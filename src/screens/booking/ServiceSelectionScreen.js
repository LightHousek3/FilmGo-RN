import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serviceApi, bookingApi } from '../../api';
import { Loading } from '../../components/common';
import { useAuth } from '../../hooks';
import COLORS from '../../constants/colors';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ServiceSelectionScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // params from SeatSelectionScreen
    const { showtimeId, selectedSeats, theaterId, movie, theater, showtime, baseTotal } =
        route.params || {};

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [services, setServices] = useState([]);

    // selectedServices: { [serviceId]: quantity }
    const [selectedServices, setSelectedServices] = useState({});

    useEffect(() => {
        if (!theaterId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin rạp');
            navigation.goBack();
            return;
        }
        fetchServices();
    }, [theaterId]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await serviceApi.getServices({
                theater: theaterId,
                status: 'AVAILABLE',
                limit: 50,
            });
            if (response.data.success) {
                setServices(response.data.data);
            } else {
                Alert.alert('Lỗi', 'Không thể tải danh sách dịch vụ');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            // Non-blocking error, user can still proceed without services
            Alert.alert('Lỗi', 'Không thể tải dịch vụ. Bạn có thể bỏ qua bước này.');
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (serviceId, delta) => {
        setSelectedServices((prev) => {
            const currentObj = prev[serviceId] || 0;
            const newVal = currentObj + delta;

            if (newVal <= 0) {
                const newSelection = { ...prev };
                delete newSelection[serviceId];
                return newSelection;
            }

            return {
                ...prev,
                [serviceId]: newVal,
            };
        });
    };

    const calculateServicesTotal = () => {
        return Object.entries(selectedServices).reduce((total, [serviceId, quantity]) => {
            const service = services.find((s) => s.id === serviceId || s._id === serviceId);
            if (service) {
                return total + service.price * quantity;
            }
            return total;
        }, 0);
    };

    const totalAmount = baseTotal + calculateServicesTotal();

    const handleCheckout = async () => {
        const servicesArray = Object.entries(selectedServices).map(([serviceId, quantity]) => ({
            serviceId,
            quantity,
        }));

        const bookingData = {
            showtime: showtimeId,
            seats: selectedSeats.map((s) => s._id || s.id),
            services: servicesArray,
        };

        if (user) {
            // Already logged in, create booking via API
            try {
                setSubmitting(true);
                const response = await bookingApi.createBooking(bookingData);
                if (response.data && response.data.success) {
                    const bookingId = response.data.data._id || response.data.data.id;
                    navigation.navigate('Payment', { bookingId, bookingData: response.data.data });
                } else {
                    Alert.alert('Lỗi', response.data.message || 'Không thể tạo đơn hàng.');
                }
            } catch (error) {
                console.error('Lỗi khi tạo booking:', error);
                const errorMsg = error.response?.data?.message || error.message || 'Tạo đơn hàng thất bại. Vui lòng thử lại.';
                Alert.alert('Lỗi', errorMsg);
            } finally {
                setSubmitting(false);
            }
        } else {
            // Not logged in, save to AsyncStorage and navigate to Login
            try {
                await AsyncStorage.setItem(
                    'pendingBooking',
                    JSON.stringify({
                        ...bookingData,
                        meta: { movie, theater, showtime, baseTotal, selectedSeats },
                    }),
                );
                Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để hoàn tất đặt vé!', [
                    { text: 'Huỷ', style: 'cancel' },
                    {
                        text: 'Đăng nhập',
                        onPress: () => navigation.navigate('Auth'),
                    },
                ]);
            } catch (error) {
                console.error('Lỗi lưu pendingBooking:', error);
                Alert.alert('Lỗi', 'Đã có lỗi xảy ra.');
            }
        }
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1E5AA8" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Chọn Bắp Nước
                </Text>
            </View>

            {/* Sub Info */}
            <View style={styles.subHeader}>
                <Text style={styles.subHeaderTitle}>Phim: {movie?.title}</Text>
                <Text style={styles.subHeaderSub}>Rạp: {theater?.name}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {services.length === 0 ? (
                    <Text style={styles.emptyText}>Không có dịch vụ nào.</Text>
                ) : (
                    services.map((item) => {
                        const serviceId = item.id || item._id;
                        const qty = selectedServices[serviceId] || 0;
                        return (
                            <View key={serviceId} style={styles.serviceItem}>
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.serviceImg}
                                    resizeMode="contain"
                                />
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceName}>{item.name}</Text>
                                    {!!item.description && (
                                        <Text style={styles.serviceDesc}>{item.description}</Text>
                                    )}
                                    <Text style={styles.servicePrice}>
                                        {formatPrice(item.price)}
                                    </Text>
                                </View>
                                <View style={styles.qtyBox}>
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, qty === 0 && styles.qtyBtnDisabled]}
                                        onPress={() => updateQuantity(serviceId, -1)}
                                        disabled={qty === 0}
                                    >
                                        <Ionicons
                                            name="remove"
                                            size={18}
                                            color={qty === 0 ? '#9CA3AF' : '#111827'}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{qty}</Text>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => updateQuantity(serviceId, 1)}
                                    >
                                        <Ionicons name="add" size={18} color="#111827" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.continueBtn, submitting && { opacity: 0.7 }]}
                    onPress={handleCheckout}
                    disabled={submitting}
                >
                    {submitting ? (
                        <View style={styles.loadingContainer}>
                            <Loading size={20} color="#FFFFFF" fullScreen={false} text={null} />
                        </View>
                    ) : (
                        <Text style={styles.continueText}>Thanh toán</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: { marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E5AA8' },
    subHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    subHeaderTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
    subHeaderSub: { fontSize: 13, color: '#4B5563' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 30 },
    serviceItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center',
    },
    serviceImg: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
    },
    serviceInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    serviceName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    serviceDesc: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    servicePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F97316',
    },
    qtyBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 4,
    },
    qtyBtn: {
        padding: 4,
    },
    qtyBtnDisabled: {
        opacity: 0.5,
    },
    qtyText: {
        fontSize: 15,
        fontWeight: 'bold',
        minWidth: 24,
        textAlign: 'center',
        marginHorizontal: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    totalBox: { flex: 1 },
    totalLabel: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    continueBtn: {
        backgroundColor: '#F97316',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    loadingContainer: {
        height: 20, // Match text height approx
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ServiceSelectionScreen;
