import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constants/colors';

const MOCK_FESTIVALS = [
    {
        _id: 'f1',
        name: 'Liên Hoan Phim Quốc Tế Hà Nội 2026',
        date: '10 – 20 / 10 / 2026',
        location: 'Hà Nội',
        imageUrl:
            'https://images.unsplash.com/photo-1478720568477-152d9b164e26?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&w=800',
        description:
            'Sự kiện điện ảnh lớn nhất Việt Nam quy tụ hơn 200 bộ phim từ 50 quốc gia. Cơ hội gặp gỡ các đạo diễn và diễn viên nổi tiếng thế giới.',
        badge: 'HOT',
        badgeColor: '#E94560',
    },
    {
        _id: 'f2',
        name: 'Tuần Phim Châu Âu 2026',
        date: '15 – 22 / 11 / 2026',
        location: 'TP. Hồ Chí Minh',
        imageUrl:
            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&w=800',
        description:
            'Giới thiệu những tác phẩm điện ảnh độc đáo từ các đạo diễn tài năng thuộc Liên minh Châu Âu.',
        badge: 'MỚI',
        badgeColor: '#22C55E',
    },
    {
        _id: 'f3',
        name: 'Liên Hoan Phim Ngắn Trẻ Việt Nam',
        date: '05 – 10 / 12 / 2026',
        location: 'Đà Nẵng',
        imageUrl:
            'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&w=800',
        description:
            'Sân chơi dành cho các nhà làm phim trẻ Việt Nam. Nơi khởi đầu của những tài năng điện ảnh tương lai.',
        badge: 'SẮP TỚI',
        badgeColor: '#F5C518',
    },
    {
        _id: 'f4',
        name: 'Tuần Phim Kinh Dị Đông Nam Á',
        date: '31 / 10 – 05 / 11 / 2026',
        location: 'TP. Hồ Chí Minh',
        imageUrl:
            'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&w=800',
        description:
            'Tuyển chọn những bộ phim kinh dị xuất sắc nhất từ các nền điện ảnh Thái, Hàn, Nhật Bản và Việt Nam.',
        badge: 'ĐẶC BIỆT',
        badgeColor: '#8B5CF6',
    },
];

const FestivalCard = ({ item }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate('FestivalDetail', { id: item.id || item._id, item })}
        >
            <View style={styles.cardImageWrapper}>
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.cardImage}
                    contentFit="cover"
                    transition={0}
                    cachePolicy="memory-disk"
                />
                {/* Badge */}
                <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
                {/* Gradient overlay */}
                <View style={styles.imageGradient} />
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.nameText} numberOfLines={2}>
                    {item.name}
                </Text>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.secondary} />
                    <Text style={styles.infoText}>{item.date}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color={COLORS.secondary} />
                    <Text style={styles.infoText}>{item.location}</Text>
                </View>

                <Text style={styles.descText} numberOfLines={3}>
                    {item.description}
                </Text>

                <TouchableOpacity
                    style={styles.detailBtn}
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.navigate('FestivalDetail', { id: item.id || item._id, item })
                    }
                >
                    <Text style={styles.detailBtnText}>Xem chi tiết</Text>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const FestivalScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lễ Hội Điện Ảnh</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero banner */}
                <View style={styles.heroBanner}>
                    <Ionicons name="film" size={32} color={COLORS.secondary} />
                    <Text style={styles.heroTitle}>Khám Phá Lễ Hội Điện Ảnh</Text>
                    <Text style={styles.heroSubtitle}>
                        Những sự kiện điện ảnh đặc sắc không thể bỏ lỡ
                    </Text>
                </View>

                {/* Festival cards */}
                {MOCK_FESTIVALS.map((item) => (
                    <FestivalCard key={item._id} item={item} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    backBtn: { width: 36 },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.white,
    },
    scrollContent: { padding: 16, gap: 16 },
    heroBanner: {
        backgroundColor: COLORS.accent,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.white,
        marginTop: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 13,
        color: COLORS.gray[300],
        marginTop: 4,
        textAlign: 'center',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardImageWrapper: { position: 'relative' },
    cardImage: { width: '100%', height: 180 },
    badge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    cardBody: { padding: 14 },
    nameText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 10,
        lineHeight: 22,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    infoText: { fontSize: 13, color: COLORS.gray[300] },
    descText: {
        fontSize: 13,
        color: COLORS.gray[400],
        lineHeight: 18,
        marginTop: 8,
        marginBottom: 12,
    },
    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-end',
    },
    detailBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.secondary,
    },
});

export default FestivalScreen;
