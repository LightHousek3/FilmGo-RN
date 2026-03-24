import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showtimeApi } from '../../api';
import { Loading } from '../../components/common';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const SEAT_TYPES = {
    STANDARD: { label: 'Ghế thường', borderColor: '#D1D5DB', bgColor: '#FFFFFF' },
    SWEETBOX: { label: 'Ghế đôi', borderColor: '#3B82F6', bgColor: '#FFFFFF' },
    VIP: { label: 'Ghế VIP', borderColor: '#F59E0B', bgColor: '#FFFFFF' },
};

const SeatSelectionScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { showtimeId } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [seatingData, setSeatingData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        if (!showtimeId) {
            Alert.alert('Lỗi', 'Không tìm thấy lịch chiếu');
            navigation.goBack();
            return;
        }
        fetchSeatingData();
    }, [showtimeId]);

    const fetchSeatingData = async () => {
        try {
            setLoading(true);
            const response = await showtimeApi.getShowtimeSeating(showtimeId);
            if (response.data.success) {
                setSeatingData(response.data.data);
            } else {
                Alert.alert('Lỗi', response.data.message || 'Không thể tải sơ đồ ghế');
            }
        } catch (error) {
            console.error('Error fetching seating data:', error);
            Alert.alert('Lỗi', 'Không thể tải sơ đồ ghế. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleSeatPress = useCallback((seat) => {
        if (seat.status !== 'AVAILABLE') return;

        setSelectedSeats((prev) => {
            const isSelected = prev.some((s) => s._id === seat._id);
            if (isSelected) {
                return prev.filter((s) => s._id !== seat._id);
            } else {
                return [...prev, seat];
            }
        });
    }, []);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const match = isoString.match(/T(\d{2}:\d{2})/);
        return match ? match[1] : '';
    };

    const groupedSeats = useMemo(() => {
        if (!seatingData || !seatingData.seats) return [];
        const rowsMap = {};
        seatingData.seats.forEach((seat) => {
            const match = seat.seatNumber.match(/^[A-Z]+/);
            const rowLabel = match ? match[0] : 'A';
            if (!rowsMap[rowLabel]) rowsMap[rowLabel] = [];
            rowsMap[rowLabel].push(seat);
        });

        const sortedRowLabels = Object.keys(rowsMap).sort((a, b) => b.localeCompare(a));

        return sortedRowLabels.map((label) => {
            const rowSeats = rowsMap[label].sort((a, b) => {
                const numA = parseInt(a.seatNumber.replace(/\D/g, ''), 10) || 0;
                const numB = parseInt(b.seatNumber.replace(/\D/g, ''), 10) || 0;
                return numA - numB;
            });
            return { rowConfig: label, seats: rowSeats };
        });
    }, [seatingData]);

    const calculateTotal = () => {
        return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
    };

    const handleContinue = () => {
        if (selectedSeats.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 ghế.');
            return;
        }

        navigation.navigate('ServiceSelection', {
            showtimeId,
            selectedSeats,
            theaterId: seatingData?.theater?._id || seatingData?.theater?.id,
            movie: seatingData?.movie,
            theater: seatingData?.theater,
            showtime: seatingData?.showtime,
            baseTotal: calculateTotal(),
        });
    };

    if (loading || !seatingData) {
        return <Loading fullScreen />;
    }

    const { theater, movie, showtime } = seatingData;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1E5AA8" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {theater?.name}
                </Text>
            </View>

            <View style={styles.subHeader}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.movieTitle} numberOfLines={2}>
                        {movie?.title}
                    </Text>
                    <Text style={styles.movieFormat}>{movie?.type} PHỤ ĐỀ</Text>
                </View>
                <View style={styles.timeBox}>
                    <Text style={styles.timeText}>{formatTime(showtime?.startTime)}</Text>
                    <Ionicons
                        name="caret-down"
                        size={12}
                        color="#4B5563"
                        style={{ marginLeft: 4 }}
                    />
                </View>
            </View>

            <ScrollView
                style={styles.mapContainer}
                contentContainerStyle={styles.mapScrollContent}
                maximumZoomScale={2}
                minimumZoomScale={1}
            >
                {groupedSeats.map((row) => (
                    <View key={row.rowConfig} style={styles.rowContainer}>
                        <Text style={styles.rowLabel}>{row.rowConfig}</Text>
                        <View style={styles.seatsRow}>
                            {row.seats.map((seat) => {
                                const isUnavailable = seat.status !== 'AVAILABLE';
                                const isSelected = selectedSeats.some((s) => s._id === seat._id);
                                const isSweetbox = seat.type === 'SWEETBOX';

                                return (
                                    <TouchableOpacity
                                        key={seat._id}
                                        onPress={() => handleSeatPress(seat)}
                                        activeOpacity={0.7}
                                        disabled={isUnavailable}
                                        style={[
                                            styles.seatWrapper,
                                            isSweetbox && styles.seatSweetbox,
                                            isUnavailable
                                                ? styles.seatSold
                                                : isSelected
                                                  ? styles.seatSelected
                                                  : {
                                                        borderColor:
                                                            SEAT_TYPES[seat.type]?.borderColor ||
                                                            SEAT_TYPES.STANDARD.borderColor,
                                                    },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.seatInner,
                                                isUnavailable
                                                    ? styles.seatInnerSold
                                                    : isSelected
                                                      ? styles.seatInnerSelected
                                                      : styles.seatInnerAvailable,
                                            ]}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={styles.rowLabelRight}>{row.rowConfig}</Text>
                    </View>
                ))}

                <View style={styles.screenContainer}>
                    <View style={styles.screenBar} />
                    <Text style={styles.screenText}>MÀN HÌNH</Text>
                </View>
            </ScrollView>

            <View style={styles.legendContainer}>
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View
                            style={[
                                styles.legendBox,
                                { borderColor: SEAT_TYPES.STANDARD.borderColor },
                            ]}
                        />
                        <Text style={styles.legendText}>Ghế thường</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View
                            style={[styles.legendBox, { borderColor: SEAT_TYPES.VIP.borderColor }]}
                        />
                        <Text style={styles.legendText}>Ghế VIP</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View
                            style={[
                                styles.legendBox,
                                { borderColor: SEAT_TYPES.SWEETBOX.borderColor, width: 24 },
                            ]}
                        />
                        <Text style={styles.legendText}>Ghế đôi</Text>
                    </View>
                </View>
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View
                            style={[
                                styles.legendBox,
                                styles.seatSold,
                                { backgroundColor: '#D1D5DB' },
                            ]}
                        />
                        <Text style={styles.legendText}>Đã bán</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View
                            style={[
                                styles.legendBox,
                                styles.seatSelected,
                                { backgroundColor: '#F97316' },
                            ]}
                        />
                        <Text style={styles.legendText}>Đang chọn</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalValue}>{formatPrice(calculateTotal())}</Text>
                </View>
                <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
                    <Text style={styles.continueText}>Tiếp Tục</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    movieTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
    movieFormat: { fontSize: 13, color: '#6B7280' },
    timeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    timeText: { fontSize: 14, fontWeight: '500', color: '#111827' },
    mapContainer: { flex: 1, backgroundColor: '#F9FAFB' },
    mapScrollContent: { paddingVertical: 30, paddingHorizontal: 16, alignItems: 'center' },
    rowContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    rowLabel: {
        width: 20,
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        textAlign: 'center',
        marginRight: 8,
    },
    rowLabelRight: {
        width: 20,
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        textAlign: 'center',
        marginLeft: 8,
    },
    seatsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    seatWrapper: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 3,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    seatSweetbox: { width: 40 },
    seatSold: { borderColor: '#D1D5DB', backgroundColor: '#D1D5DB' },
    seatSelected: { borderColor: '#F97316', backgroundColor: '#F97316' },
    seatInner: { width: '100%', height: '100%', borderRadius: 4 },
    seatInnerAvailable: { backgroundColor: '#FFFFFF' },
    seatInnerSold: { backgroundColor: '#D1D5DB' },
    seatInnerSelected: { backgroundColor: '#F97316' },
    screenContainer: { marginTop: 40, alignItems: 'center', width: '100%' },
    screenBar: {
        width: '80%',
        height: 4,
        backgroundColor: '#F97316',
        borderRadius: 2,
        marginBottom: 8,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    screenText: { fontSize: 10, color: '#9CA3AF', fontWeight: 'bold', letterSpacing: 1 },
    legendContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    legendRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', width: '30%' },
    legendBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1,
        marginRight: 6,
        backgroundColor: '#FFFFFF',
    },
    legendText: { fontSize: 12, color: '#4B5563' },
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
    },
    continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default SeatSelectionScreen;
