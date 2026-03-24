import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useBookingDetail } from "../../hooks";
import COLORS from "../../constants/colors";
import ProfileInfoSection from "../../components/profile/ProfileInfoSection";
import TicketHistorySection from "../../components/profile/TicketHistorySection";
import BookingDetailOverlay from "../../components/profile/BookingDetailOverlay";

const TABS = {
    INFO: 'info',
    HISTORY: 'history',
};

const MENU_ITEMS = [
    { id: 'settings', label: 'Cài đặt', icon: 'settings-outline' },
    { id: 'help', label: 'Trợ giúp & Hỗ trợ', icon: 'help-circle-outline' },
];

const formatJoinDate = (dateString) => {
    if (!dateString) return '01/2024';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '01/2024';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
};

const formatBirthday = (dateString) => {
    if (!dateString) return '--/--/----';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const ProfileScreen = ({ navigation }) => {
    const nav = navigation || useNavigation();
    const { user, logout, isLoading, isAuthenticated } = useAuth();
    const { selectedBooking, openBookingDetail, closeBookingDetail } = useBookingDetail();
    const [activeTab, setActiveTab] = useState(TABS.INFO);

    const fullName = useMemo(() => {
        if (!user) return 'Khách';
        return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Khách';
    }, [user]);

    const memberSince = formatJoinDate(user?.createdAt);

    const onPressPlaceholderAction = (label) => {
        Alert.alert('Thông báo', `Tính năng \"${label}\" sẽ sớm ra mắt.`);
    };

    const onPressLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: logout,
            },
        ]);
    };

    const onPressLogin = () => {
        const parentNav = nav.getParent?.();
        if (parentNav) {
            parentNav.navigate('Auth', { screen: 'Login' });
            return;
        }
        nav.navigate('Auth', { screen: 'Login' });
    };

    // Điều hướng đến màn hình UpdateProfile khi nhấn "Chỉnh sửa"
    const onEdit = () => {
        nav.navigate("UpdateProfile"); // Điều hướng đến màn hình UpdateProfileScreen
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }}>
                <View className="px-4 pt-2">
                    <View className="mt-4 flex-row items-center">
                        <View
                            className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border"
                            style={{ borderColor: COLORS.secondary, borderWidth: 2 }}
                        >
                            {user?.avatar ? (
                                <Image
                                    source={{ uri: user.avatar }}
                                    resizeMode="cover"
                                    className="h-full w-full"
                                />
                            ) : (
                                <View className="h-full w-full items-center justify-center bg-dark-100">
                                    <Ionicons name="person" size={38} color={COLORS.gray[400]} />
                                </View>
                            )}
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-[24px] font-bold text-white" numberOfLines={1}>
                                {fullName}
                            </Text>

                            <Text className="mt-1 text-[16px] text-gray-400">
                                Thành viên từ {memberSince}
                            </Text>
                        </View>
                    </View>

                    <View className="mt-6 flex-row rounded-2xl border border-white/10">
                        <TouchableOpacity
                            activeOpacity={0.85}
                            className="flex-1 items-center rounded-xl py-3"
                            style={{
                                backgroundColor:
                                    activeTab === TABS.INFO ? COLORS.secondary : 'transparent',
                            }}
                            onPress={() => setActiveTab(TABS.INFO)}
                        >
                            <Text
                                className="text-base font-bold"
                                style={{
                                    color:
                                        activeTab === TABS.INFO ? COLORS.white : COLORS.gray[500],
                                }}
                            >
                                Thông tin
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            className="flex-1 items-center rounded-xl py-3"
                            style={{
                                backgroundColor:
                                    activeTab === TABS.HISTORY ? COLORS.secondary : 'transparent',
                            }}
                            onPress={() => setActiveTab(TABS.HISTORY)}
                        >
                            <Text
                                className="text-base font-bold"
                                style={{
                                    color:
                                        activeTab === TABS.HISTORY
                                            ? COLORS.white
                                            : COLORS.gray[500],
                                }}
                            >
                                Lịch sử vé
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === TABS.INFO ? (
                        <ProfileInfoSection
                            fullName={fullName}
                            user={user}
                            birthdayText={formatBirthday(user?.birthDate)}
                            onEdit={onEdit} // Truyền hàm onEdit vào
                        />
                    ) : (
                        <TicketHistorySection onSelectBooking={openBookingDetail} />
                    )}

                    <View
                        className="mt-5 overflow-hidden rounded-2xl border"
                        style={{
                            borderColor: 'rgba(255,255,255,0.12)',
                            backgroundColor: '#090A0E',
                        }}
                    >
                        {MENU_ITEMS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                className="flex-row items-center justify-between border-b border-white/10 px-4 py-4"
                                onPress={() => onPressPlaceholderAction(item.label)}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name={item.icon} size={20} color={COLORS.gray[400]} />
                                    <Text className="ml-3 text-xl font-semibold text-white">
                                        {item.label}
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={COLORS.gray[600]}
                                />
                            </TouchableOpacity>
                        ))}

                        {isAuthenticated ? (
                            <TouchableOpacity
                                className="flex-row items-center justify-between px-4 py-4"
                                disabled={isLoading}
                                onPress={onPressLogout}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                                    <Text className="ml-3 text-xl font-semibold text-[#FF3B30]">
                                        Đăng xuất
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={COLORS.gray[600]}
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                className="flex-row items-center justify-between px-4 py-4"
                                onPress={onPressLogin}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons
                                        name="log-in-outline"
                                        size={20}
                                        color={COLORS.secondary}
                                    />
                                    <Text
                                        className="ml-3 text-xl font-semibold"
                                        style={{ color: COLORS.secondary }}
                                    >
                                        Đăng nhập
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={COLORS.gray[600]}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>

            <BookingDetailOverlay
                booking={selectedBooking}
                visible={Boolean(selectedBooking)}
                onClose={closeBookingDetail}
            />
        </SafeAreaView>
    );
};

export default ProfileScreen;