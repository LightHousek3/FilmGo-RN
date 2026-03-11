import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from "react-native-reanimated";
import Badge from "../common/Badge";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { formatDuration } from "../../utils/helpers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Card dimensions for the carousel
export const CARD_WIDTH = SCREEN_WIDTH * 0.6;
export const CARD_HEIGHT = CARD_WIDTH * 1.5;
export const SPACING = -20;
export const SIDE_CARD_SCALE = 0.85;
export const SIDE_CARD_OPACITY = 0.6;

const MovieCarouselItem = ({ item, index, scrollX, onPress }) => {
    const inputRange = [
        (index - 1) * (CARD_WIDTH + SPACING * 2),
        index * (CARD_WIDTH + SPACING * 2),
        (index + 1) * (CARD_WIDTH + SPACING * 2),
    ];

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [SIDE_CARD_SCALE, 1, SIDE_CARD_SCALE],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [SIDE_CARD_OPACITY, 1, SIDE_CARD_OPACITY],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollX.value,
            inputRange,
            [20, 0, 20],
            Extrapolation.CLAMP
        );

        // Center item gets highest z-index so it visually overlays side cards
        const zIndex = Math.round(
            interpolate(scrollX.value, inputRange, [0, 10, 0], Extrapolation.CLAMP)
        );

        return {
            transform: [{ scale }, { translateY }],
            opacity,
            zIndex,
            elevation: zIndex, // Android
        };
    });

    const genres = item.genres
        ? item.genres
              .map((g) => (typeof g === "object" ? g.name : g))
              .filter((g) => !/^[a-f\d]{24}$/i.test(g))
              .join(" / ")
        : "";

    return (
        <Animated.View
            style={[
                {
                    width: CARD_WIDTH,
                    marginHorizontal: SPACING,
                    // overflow visible so scaled center card isn't clipped by ScrollView
                    overflow: "visible",
                },
                animatedStyle,
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress?.(item)}
                className="overflow-hidden rounded-2xl"
            >
                {/* Poster Image */}
                <View style={{ height: CARD_HEIGHT }}>
                    <Image
                        source={{ uri: item.image?.url }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        transition={300}
                        cachePolicy="memory-disk"
                        placeholder={require("../../../assets/icon.png")}
                    />

                    {/* Age Rating Badge */}
                    {item.ageRating && (
                        <View className="absolute left-2 top-2">
                            <Badge label={item.ageRating} />
                        </View>
                    )}

                    {/* Gradient Overlay */}
                    <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
                </View>

                {/* Movie Info */}
                <View className="bg-dark-200 px-3 py-3">
                    <Text className="text-base font-bold text-white" numberOfLines={1}>
                        {item.title}
                    </Text>

                    {/* Rating */}
                    <View className="mt-1 flex-row items-center">
                        <Ionicons name="star" size={14} color={COLORS.gold} />
                        <Text className="ml-1 text-sm font-semibold text-gold">
                            {item.rating || "N/A"}
                        </Text>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={COLORS.gray[400]}
                            style={{ marginLeft: 10 }}
                        />
                        <Text className="ml-1 text-xs text-gray-400">
                            {item.duration ? formatDuration(item.duration) : "N/A"}
                        </Text>
                    </View>

                    {/* Genre */}
                    {genres ? (
                        <Text className="mt-1 text-xs text-gray-400" numberOfLines={1}>
                            {genres}
                        </Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default React.memo(MovieCarouselItem);
