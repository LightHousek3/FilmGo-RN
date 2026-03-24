import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constants/colors';
import newsApi from '../../api/newsApi';

const CATEGORY_COLORS = {
    'SỰ KIỆN': '#E94560',
    'ĐIỆN ẢNH': '#3B82F6',
    'TIN TỨC': '#22C55E',
    'GIẢI THƯỞNG': '#F5C518',
    'QUỐC TẾ': '#8B5CF6',
    'CÔNG NGHỆ': '#F59E0B',
};

const NewsCard = ({ item, navigation }) => (
    <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => navigation.navigate('NewsDetail', { id: item.id || item._id, item })}
    >
        <Image
            source={{ uri: item.imageUrl || item.image?.url }}
            style={styles.cardImage}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
        />
        <View style={styles.cardBody}>
            <View style={styles.categoryRow}>
                <View
                    style={[
                        styles.categoryBadge,
                        {
                            backgroundColor:
                                (CATEGORY_COLORS[item.category] || COLORS.secondary) + '30',
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.categoryText,
                            {
                                color: CATEGORY_COLORS[item.category] || COLORS.secondary,
                            },
                        ]}
                    >
                        {item.category}
                    </Text>
                </View>
                <Text style={styles.dateText}>
                    {
                        // display either preformatted date or ISO date
                        new Date(
                            item.publishDate || item.date || item.createdAt,
                        ).toLocaleDateString()
                    }
                </Text>
            </View>
            <Text style={styles.titleText} numberOfLines={2}>
                {item.title}
            </Text>
            <Text style={styles.summaryText} numberOfLines={2}>
                {item.description || item.subTitle}
            </Text>
        </View>
    </TouchableOpacity>
);

const NewsScreen = () => {
    const navigation = useNavigation();
    const [news, setNews] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [meta, setMeta] = useState(null);

    const fetchNews = useCallback(
        async ({ page: p = 1, replace = true } = {}) => {
            try {
                if (p === 1) setRefreshing(true);
                else setLoading(true);

                const res = await newsApi.getNews({ page: p, limit });
                const list = res.data?.data || [];
                const m = res.data?.meta || null;

                setMeta(m);
                if (p === 1) setNews(list);
                else setNews((prev) => [...prev, ...list]);
                setPage(p + 1);
            } catch (error) {
                // ignore for now; keep empty list
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [limit],
    );

    useEffect(() => {
        fetchNews({ page: 1, replace: true });
    }, [fetchNews]);

    const handleRefresh = () => {
        setPage(1);
        fetchNews({ page: 1, replace: true });
    };

    const handleLoadMore = () => {
        if (loading) return;
        if (meta && meta.page && meta.totalPages && meta.page >= meta.totalPages) return;
        fetchNews({ page, replace: false });
    };

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
                <Text style={styles.headerTitle}>Tin Tức</Text>
                <View style={styles.backBtn} />
            </View>

            <FlatList
                data={news}
                renderItem={({ item }) => <NewsCard item={item} navigation={navigation} />}
                keyExtractor={(item, index) =>
                    item.id ||
                    item._id ||
                    item._key ||
                    (item.title ? String(item.title) : String(index))
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListFooterComponent={() =>
                    loading ? (
                        <View style={{ paddingVertical: 12 }}>
                            <ActivityIndicator color={COLORS.secondary} />
                        </View>
                    ) : null
                }
            />
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
    listContent: { padding: 16 },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        overflow: 'hidden',
    },
    cardImage: { width: '100%', height: 180 },
    cardBody: { padding: 14 },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
    },
    categoryText: { fontSize: 11, fontWeight: '700' },
    dateText: { fontSize: 12, color: COLORS.gray[500] },
    titleText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 6,
        lineHeight: 22,
    },
    summaryText: {
        fontSize: 13,
        color: COLORS.gray[400],
        lineHeight: 18,
    },
});

export default NewsScreen;
