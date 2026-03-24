import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    Image,
    Linking,
    AppState,
} from 'react-native';
import * as LinkingExpo from 'expo-linking';
import Constants from 'expo-constants';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bookingApi, paymentApi } from '../../api';
import { Loading } from '../../components/common';
import { usePayment } from '../../contexts/PaymentContext';
import COLORS from '../../constants/colors';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const day = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    return `${time} - ${day}`;
};

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();

    // From route params
    const { bookingId: routeBookingId, bookingData, success, status } = route.params || {};
    const bookingId = routeBookingId || (bookingData ? bookingData._id || bookingData.id : null);

    const { setPendingPayment, clearPendingPayment, timeLeft, pendingBooking, setIsFabVisible } =
        usePayment();

    const [loading, setLoading] = useState(!bookingData || success === 'true');
    const [booking, setBooking] = useState(bookingData || null);
    const [submitting, setSubmitting] = useState(false);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        if (!booking && bookingId) {
            fetchBooking();
        } else if (booking) {
            if (booking.status === 'CONFIRMED' || booking.status === 'CANCELLED') {
                clearPendingPayment();
                return;
            }

            // Check if we need to start or update the timer
            if (
                !pendingBooking ||
                (pendingBooking._id !== booking._id && pendingBooking.id !== booking.id)
            ) {
                setPendingPayment(booking);
            }
        }
    }, [bookingId, booking]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // Return from background (e.g. from Browser/VNPay)
                if (bookingId || booking?._id) {
                    checkPaymentStatus();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [booking, bookingId]);

    useEffect(() => {
        // If deep linked back with success param, immediately check status!
        if (success !== undefined && bookingId) {
            if (success === 'true') {
                clearPendingPayment();
            }
            checkPaymentStatus();
        }
    }, [success, bookingId]);

    useEffect(() => {
        if (status === 'success' && bookingId) {
            clearPendingPayment();
            checkPaymentStatus();
        }
    }, [status, bookingId]);

    useFocusEffect(
        useCallback(() => {
            setIsFabVisible(false);
            return () => setIsFabVisible(true);
        }, []),
    );

    const checkPaymentStatus = async (retryCount = 0) => {
        try {
            const currentBookingId = bookingId || booking?._id;
            if (!currentBookingId) return;
            const response = await bookingApi.getBookingById(currentBookingId);
            if (response.data && response.data.success) {
                const updatedBooking = response.data.data;

                // Address Race condition: VNPay return vs IPN webhook
                // If deep link already claims success="true" but DB is still PENDING, we should poll.
                if (updatedBooking.status === 'PENDING' && success === 'true' && retryCount < 5) {
                    setTimeout(() => {
                        checkPaymentStatus(retryCount + 1);
                    }, 2000);
                    return;
                }

                setBooking(updatedBooking);

                if (
                    updatedBooking.status === 'CONFIRMED' ||
                    updatedBooking.status === 'CANCELLED'
                ) {
                    clearPendingPayment();
                }
                setLoading(false);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.log('Error polling status:', error);
            setLoading(false);
        }
    };

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await bookingApi.getBookingById(bookingId);
            if (response.data && response.data.success) {
                setBooking(response.data.data);
                setPendingPayment(response.data.data);
            } else {
                Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
                navigation.navigate('Main');
            }
        } catch (error) {
            console.error('Error fetching booking:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra.');
            navigation.navigate('Main');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        Alert.alert(
            'Xác nhận hủy',
            'Bạn có chắc chắn muốn hủy đơn hàng này không? Quá trình này không thể hoàn tác.',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy đơn',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            const currentBookingId = bookingId || booking?._id;
                            const res = await bookingApi.cancelBooking(currentBookingId);
                            if (res.data && res.data.success) {
                                clearPendingPayment();
                                Alert.alert('Thành công', 'Đã hủy đơn hàng.', [
                                    { text: 'OK', onPress: () => navigation.navigate('Main') },
                                ]);
                            }
                        } catch (error) {
                            console.log('Error canceling booking:', error);
                            const msg = error.response?.data?.message || 'Không thể hủy đơn hàng.';
                            Alert.alert('Lỗi', msg);
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ],
        );
    };

    const handleVNPayPayment = async () => {
        if (timeLeft <= 0) {
            Alert.alert('Hết hạn', 'Đơn hàng đã hết hạn thanh toán.');
            return;
        }

        try {
            setSubmitting(true);
            // Append booking id so app can know context on deep link return
            const currentBookingId = booking?._id || booking?.id || bookingId;
            const isExpoGo = Constants.appOwnership === 'expo';
            const redirectUrl = isExpoGo
                ? LinkingExpo.createURL('payment-result', {
                      queryParams: {
                          bookingId: String(currentBookingId),
                      },
                  })
                : `filmgo://payment-result?bookingId=${encodeURIComponent(currentBookingId)}`;

            const paymentUrlRes = await paymentApi.initiateVnpay({
                bookingId: currentBookingId,
                locale: 'vn',
                appReturnUrl: redirectUrl,
            });
            if (
                paymentUrlRes.data &&
                paymentUrlRes.data.success &&
                paymentUrlRes.data.data.paymentUrl
            ) {
                // Not clearing payment or replacing navigation yet, just open url
                // Return to app will be handled by AppState
                Linking.openURL(paymentUrlRes.data.data.paymentUrl);
            } else {
                throw new Error('Failed to get payment url');
            }
        } catch (error) {
            console.log('Payment error', error);
            Alert.alert('Lỗi', 'Không thể tạo URL thanh toán.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading fullScreen />;

    const isFinished =
        booking && (booking.status === 'CONFIRMED' || booking.status === 'CANCELLED');

    if (isFinished) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        paddingTop: insets.top,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                    },
                ]}
            >
                <Ionicons
                    name={booking.status === 'CONFIRMED' ? 'checkmark-circle' : 'close-circle'}
                    size={64}
                    color={booking.status === 'CONFIRMED' ? COLORS.success : '#EF4444'}
                />
                <Text style={styles.expiredTitle}>
                    {booking.status === 'CONFIRMED'
                        ? 'Thanh toán thành công'
                        : 'Giao dịch thất bại'}
                </Text>
                <Text style={styles.expiredDesc}>
                    {booking.status === 'CONFIRMED'
                        ? 'Chúc bạn xem phim vui vẻ!'
                        : 'Đơn hàng đã bị hủy hoặc thanh toán không thành công.'}
                </Text>
                <TouchableOpacity
                    style={styles.backHomeBtn}
                    onPress={() => navigation.navigate('Main')}
                >
                    <Text style={styles.backHomeText}>Về trang chủ</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (timeLeft <= 0) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        paddingTop: insets.top,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                    },
                ]}
            >
                <Ionicons name="close-circle" size={64} color="#EF4444" />
                <Text style={styles.expiredTitle}>Đơn hàng đã hết hạn</Text>
                <Text style={styles.expiredDesc}>
                    Thời gian giữ ghế cho đơn hàng này đã kết thúc. Vui lòng đặt lại.
                </Text>
                <TouchableOpacity
                    style={styles.backHomeBtn}
                    onPress={() => {
                        clearPendingPayment();
                        navigation.navigate('Main');
                    }}
                >
                    <Text style={styles.backHomeText}>Về trang chủ</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const showtime = booking?.showtime || {};
    const movie = showtime.movie || {};
    const screen = showtime.screen || {};
    const theater = screen.theater || {};
    const seats = booking?.seats || [];
    const services = booking?.services || [];
    const totalAmount = booking?.totalPrice || booking?.amount || 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh Toán</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.timerBox}>
                    <Text style={styles.timerLabel}>Thời gian giữ ghế còn lại</Text>
                    <Text style={styles.timerValue}>
                        {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}
                        {timeLeft % 60}
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Thông tin đặt vé</Text>
                    <View style={styles.movieInfoContainer}>
                        {movie.image && (
                            <Image
                                source={{
                                    uri:
                                        typeof movie.image === 'string'
                                            ? movie.image
                                            : movie.image?.url,
                                }}
                                style={styles.movieImage}
                            />
                        )}
                        <View style={styles.movieDetails}>
                            <Text style={styles.movieTitle}>{movie.title}</Text>
                            <Text style={styles.theaterName}>{theater.name}</Text>
                            <Text style={styles.infoText}>{theater.address}</Text>
                            <Text style={styles.infoText}>
                                Suất chiếu: {formatDateTime(showtime.startTime)}
                            </Text>
                            <Text style={styles.infoText}>Phòng chiếu: {screen.name}</Text>
                            <Text style={styles.infoText}>
                                Ghế: {seats.map((s) => s?.seat?.seatNumber || '(Trống)').join(', ')}
                            </Text>
                        </View>
                    </View>

                    {services.length > 0 && (
                        <View style={styles.servicesContainer}>
                            <Text style={styles.servicesTitle}>Dịch vụ thêm:</Text>
                            {services.map((item, index) => (
                                <Text key={index} style={styles.serviceItem}>
                                    - {item.service.name} (x{item.quantity})
                                </Text>
                            ))}
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mã đơn</Text>
                        <Text style={styles.infoValue}>{booking?._id || booking?.id}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tổng tiền</Text>
                        <Text style={styles.infoValueHighlight}>{formatPrice(totalAmount)}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <TouchableOpacity style={styles.paymentMethod}>
                        <View style={styles.vnpayIcon}>
                            <Text style={styles.vnpayText}>VNPAY</Text>
                        </View>
                        <Text style={styles.paymentMethodText}>Thanh toán qua VNPAY</Text>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        style={[styles.cancelBtn, submitting && { opacity: 0.7 }]}
                        onPress={handleCancelBooking}
                        disabled={submitting}
                    >
                        <Text style={styles.cancelText}>Hủy đơn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.checkoutBtn, submitting && { opacity: 0.7 }]}
                        onPress={handleVNPayPayment}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <View style={styles.loadingContainer}>
                                <Loading size={20} color={COLORS.white} text={null} />
                            </View>
                        ) : (
                            <Text style={styles.checkoutText}>Thanh toán ngay</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: { marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    scrollContent: { padding: 16 },
    timerBox: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    timerLabel: { fontSize: 14, color: '#EF4444', marginBottom: 4 },
    timerValue: { fontSize: 24, fontWeight: 'bold', color: '#B91C1C' },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
    movieInfoContainer: { flexDirection: 'row', marginBottom: 16 },
    movieImage: { width: 80, height: 120, borderRadius: 8, marginRight: 12 },
    movieDetails: { flex: 1, justifyContent: 'center' },
    movieTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
    theaterName: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
    infoText: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
    servicesContainer: { marginBottom: 16 },
    servicesTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
    serviceItem: { fontSize: 14, color: '#6B7280', paddingLeft: 8 },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    infoLabel: { fontSize: 14, color: '#6B7280' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
    infoValueHighlight: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#10B981',
        borderRadius: 8,
        backgroundColor: '#ECFDF5',
    },
    vnpayIcon: {
        backgroundColor: '#005BAA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 12,
    },
    vnpayText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
    paymentMethodText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
    footer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    checkoutBtn: {
        flex: 2,
        backgroundColor: COLORS.secondary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        minHeight: 56,
    },
    checkoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minHeight: 56,
    },
    cancelText: { color: '#4B5563', fontSize: 16, fontWeight: 'bold' },
    loadingContainer: {
        height: 20, // Match text height
        justifyContent: 'center',
        alignItems: 'center',
    },
    expiredTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    expiredDesc: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 32,
    },
    backHomeBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backHomeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});

export default PaymentScreen;
