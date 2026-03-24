import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../../constants/colors';

const FestivalDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { item } = route.params || {};

    if (!item) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lễ Hội</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingWrap}>
                    <Text style={{ color: COLORS.gray[300] }}>Lễ hội không tồn tại.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lễ Hội Phim</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                />

                <View style={styles.body}>
                    <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>

                    <Text style={styles.title}>{item.name}</Text>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} />
                            <Text style={styles.infoText}>{item.date}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color={COLORS.secondary} />
                            <Text style={styles.infoText}>{item.location}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Giới Thiệu</Text>
                    <Text style={styles.contentText}>{item.description}</Text>
                </View>
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
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { paddingBottom: 30 },
    image: { width: '100%', height: 260 },
    body: { padding: 16 },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 12,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 16,
        lineHeight: 32,
    },
    infoContainer: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    infoText: {
        color: COLORS.gray[300],
        fontSize: 15,
        marginLeft: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 12,
    },
    contentText: {
        fontSize: 15,
        color: COLORS.gray[300],
        lineHeight: 24,
    },
});

export default FestivalDetailScreen;
