import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const formatDateTime = (value) => {
    if (!value) return 'Chưa cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}  ${hours}:${minutes}`;
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const BookingDetailOverlay = ({ booking, visible, onClose }) => {
    if (!visible || !booking) return null;

    return (
        <View
            className="absolute inset-0 z-50 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
        >
            <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onClose} />

            <View className="mx-4 max-h-[85%] w-full max-w-[390px] overflow-hidden rounded-3xl border border-white/10 bg-[#101218]">
                <ScrollView
                    className="w-full"
                    contentContainerStyle={{ padding: 14, paddingBottom: 18 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="rounded-2xl border border-white/10 bg-[#12151D] p-3">
                        <View className="flex-row">
                            <View className="h-24 w-16 overflow-hidden rounded-xl bg-dark-100">
                                {booking?.poster ? (
                                    <Image
                                        source={{ uri: booking.poster }}
                                        className="h-full w-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="h-full w-full items-center justify-center bg-dark-100">
                                        <Ionicons
                                            name="film-outline"
                                            size={18}
                                            color={COLORS.gray[500]}
                                        />
                                    </View>
                                )}
                            </View>

                            <View className="ml-3 flex-1">
                                <Text className="text-2xl font-bold text-white" numberOfLines={2}>
                                    {booking?.title || 'Không rõ tên phim'}
                                </Text>

                                <View className="mt-2 self-start rounded-md border border-[#2D80FF] px-2 py-0.5">
                                    <Text className="text-xs font-semibold text-[#2D80FF]">
                                        {booking?.movieType || '2D'}
                                    </Text>
                                </View>

                                <View className="mt-2 flex-row items-center">
                                    <Ionicons
                                        name="location-outline"
                                        size={13}
                                        color={COLORS.gray[400]}
                                    />
                                    <Text
                                        className="ml-1.5 text-sm text-gray-300"
                                        numberOfLines={1}
                                    >
                                        {booking?.theater || 'Chưa cập nhật rạp'}
                                        {booking?.screenName ? ` • ${booking.screenName}` : ''}
                                    </Text>
                                </View>

                                <View className="mt-1 flex-row items-center">
                                    <Ionicons
                                        name="calendar-outline"
                                        size={13}
                                        color={COLORS.gray[400]}
                                    />
                                    <Text className="ml-1.5 text-sm text-gray-300">
                                        {formatDateTime(booking?.showAt)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="my-3 h-px bg-white/10" />

                        <View className="flex-row">
                            <View className="flex-1">
                                <Text className="text-sm text-gray-400">Ghế</Text>
                                <Text className="mt-1 text-xl font-bold text-[#FFA11A]">
                                    {booking?.seatLabel || '--'}
                                </Text>

                                <Text className="mt-3 text-sm text-gray-400">Thanh toán</Text>
                                <Text className="mt-1 text-lg font-semibold text-white">
                                    {booking?.status || 'Chưa cập nhật'}
                                </Text>
                            </View>

                            <View className="flex-1">
                                <Text className="text-sm text-gray-400">Mã vé</Text>
                                <Text className="mt-1 text-xl font-bold text-[#48A6FF]">
                                    #{booking?.code || 'N/A'}
                                </Text>

                                <Text className="mt-3 text-sm text-gray-400">Thời gian đặt</Text>
                                <Text className="mt-1 text-lg font-semibold text-white">
                                    {formatDateTime(booking?.bookedAt)}
                                </Text>
                            </View>
                        </View>

                        <View className="mt-4 items-center rounded-2xl bg-white px-4 py-6">
                            <Ionicons name="qr-code-outline" size={96} color="#0C0C0C" />
                            <Text className="mt-2 text-sm text-gray-500">Quét mã tại quầy vé</Text>
                        </View>
                    </View>

                    {Array.isArray(booking?.services) && booking.services.length > 0 ? (
                        <View className="mt-3 rounded-2xl border border-white/10 bg-black px-4 py-3">
                            <View className="mb-2 flex-row items-center">
                                <Ionicons name="ticket-outline" size={16} color="#FF7A00" />
                                <Text className="ml-2 text-xl font-bold text-white">
                                    Dịch vụ đi kèm
                                </Text>
                            </View>

                            {booking.services.map((service, index) => (
                                <Text
                                    key={`${service.name}-${index}`}
                                    className="mb-1.5 text-lg text-white"
                                >
                                    <Text style={{ color: '#FF7A00' }}>• </Text>
                                    {service.name} ({service.quantity || 1})
                                </Text>
                            ))}
                        </View>
                    ) : null}

                    <View className="mt-3 rounded-2xl border border-white/10 bg-black px-4 py-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl text-white">Tổng thanh toán</Text>
                            <Text className="text-3xl font-bold text-[#FFA11A]">
                                {formatMoney(booking?.totalPrice)}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="mt-4 items-center rounded-xl py-3"
                        style={{ backgroundColor: COLORS.secondary }}
                        onPress={onClose}
                    >
                        <Text className="font-bold text-white">Đóng</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
};

export default BookingDetailOverlay;
