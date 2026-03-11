import React, { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { SectionHeader } from "../common";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NEWS_CARD_WIDTH = SCREEN_WIDTH * 0.75;

const NewsCard = React.memo(({ item, onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPress?.(item)}
            style={{ width: NEWS_CARD_WIDTH }}
            className="overflow-hidden rounded-xl bg-dark-200"
        >
            <Image
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", height: 140 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
            />
            <View className="px-3 py-3">
                {item.category && (
                    <Text className="mb-1 text-xs font-bold uppercase text-secondary">
                        {item.category}
                    </Text>
                )}
                <Text className="text-sm font-bold text-white" numberOfLines={2}>
                    {item.title}
                </Text>
                {item.date && (
                    <Text className="mt-1 text-xs text-gray-500">{item.date}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
});

const NewsSection = ({ news = [], onNewsPress, onViewAll }) => {
    const renderItem = useCallback(
        ({ item }) => <NewsCard item={item} onPress={onNewsPress} />,
        [onNewsPress]
    );

    const keyExtractor = useCallback((item) => item.id || item._id, []);

    if (!news.length) return null;

    return (
        <View className="mt-6 mb-6">
            <SectionHeader title="Tin Tức" onViewAll={onViewAll} />

            <FlatList
                data={news}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                removeClippedSubviews
                maxToRenderPerBatch={3}
            />
        </View>
    );
};

export default React.memo(NewsSection);
