import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Badge from "../common/Badge";
import COLORS from "../../constants/colors";
import { formatDuration } from "../../utils/helpers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

const MovieCard = ({ item, onPress }) => {
    const genres = item.genres
        ? item.genres
              .map((g) => (typeof g === "object" ? g.name : g))
              .filter((g) => !/^[a-f\d]{24}$/i.test(g))
              .join(" / ")
        : "";

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPress?.(item)}
            style={{ width: CARD_WIDTH }}
            className="mb-4"
        >
            {/* Poster */}
            <View className="overflow-hidden rounded-xl" style={{ height: CARD_WIDTH * 1.45 }}>
                <Image
                    source={{ uri: item.image?.url }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                    placeholder={require("../../../assets/icon.png")}
                />

                {/* Age Rating */}
                {item.ageRating && (
                    <View className="absolute left-2 top-2">
                        <Badge label={item.ageRating} />
                    </View>
                )}
            </View>

            {/* Info */}
            <View className="mt-2">
                <Text className="text-sm font-bold text-white" numberOfLines={1}>
                    {item.title}
                </Text>

                <View className="mt-1 flex-row items-center">
                    <Ionicons name="star" size={12} color={COLORS.gold} />
                    <Text className="ml-1 text-xs font-semibold text-gold">
                        {item.rating || "N/A"}
                    </Text>
                    <Ionicons
                        name="time-outline"
                        size={12}
                        color={COLORS.gray[400]}
                        style={{ marginLeft: 8 }}
                    />
                    <Text className="ml-1 text-xs text-gray-400">
                        {item.duration ? formatDuration(item.duration) : "N/A"}
                    </Text>
                </View>

                {genres ? (
                    <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
                        {genres}
                    </Text>
                ) : null}
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(MovieCard);
