import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../../constants/colors';
import newsApi from '../../api/newsApi';

const NewsDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id, item } = route.params || {};
    const [news, setNews] = useState(item || null);
    const [loading, setLoading] = useState(!item);

    useEffect(() => {
        let mounted = true;
        const fetchDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await newsApi.getNewsDetail(id);
                if (mounted) setNews(res.data.data);
            } catch (error) {
                // ignore for now
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (!news && id) fetchDetail();

        return () => {
            mounted = false;
        };
    }, [id]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Ionicons
                    name="arrow-back"
                    size={24}
                    color={COLORS.white}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.headerTitle}>Tin Tức</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                </View>
            ) : (
                news && (
                    <ScrollView contentContainerStyle={styles.content}>
                        <Image
                            source={{ uri: news.image?.url || news.imageUrl }}
                            style={styles.image}
                            contentFit="cover"
                            transition={300}
                            cachePolicy="memory-disk"
                        />
                        <View style={styles.metaRow}>
                            <Text style={styles.category}>{news.category}</Text>
                            <Text style={styles.date}>{new Date(news.date).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.title}>{news.title}</Text>
                        <Text style={styles.author}>{news.author}</Text>
                        <Text style={styles.contentText}>{news.content || news.description}</Text>
                    </ScrollView>
                )
            )}
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
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { padding: 16 },
    image: { width: '100%', height: 240, borderRadius: 12, overflow: 'hidden' },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        marginBottom: 8,
    },
    category: { fontWeight: '700', color: COLORS.white },
    date: { color: COLORS.gray[500] },
    title: { fontSize: 20, fontWeight: '900', color: COLORS.white, marginTop: 6 },
    author: { color: COLORS.gray[400], marginVertical: 8 },
    contentText: { color: COLORS.gray[300], lineHeight: 22, marginTop: 6 },
});

export default NewsDetailScreen;
