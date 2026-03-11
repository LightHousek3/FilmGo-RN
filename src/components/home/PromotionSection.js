import React, { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { SectionHeader } from "../common";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PROMO_CARD_WIDTH = SCREEN_WIDTH * 0.7;

const PromotionCard = React.memo(({ item, onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPress?.(item)}
            style={{ width: PROMO_CARD_WIDTH }}
            className="overflow-hidden rounded-xl"
        >
            <Image
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", height: 140 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
            />
            <View className="bg-dark-200 px-3 py-2.5">
                <Text className="text-sm font-bold text-white" numberOfLines={2}>
                    {item.title}
                </Text>
            </View>
        </TouchableOpacity>
    );
});

const PromotionSection = ({
    promotions = [],
    onPromotionPress,
    onViewAll,
}) => {
    const renderItem = useCallback(
        ({ item }) => <PromotionCard item={item} onPress={onPromotionPress} />,
        [onPromotionPress]
    );

    const keyExtractor = useCallback((item) => item.id || item._id, []);

    if (!promotions.length) return null;

    return (
        <View className="mt-6">
            <SectionHeader title="Khuyến Mãi" onViewAll={onViewAll} />

            <FlatList
                data={promotions}
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

export default React.memo(PromotionSection);
