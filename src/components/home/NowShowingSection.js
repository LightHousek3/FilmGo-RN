import React, { useCallback } from "react";
import { View, FlatList, Dimensions } from "react-native";
import MovieCard from "./MovieCard";
import { SectionHeader } from "../common";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const NowShowingSection = ({ movies = [], onMoviePress, onViewAll }) => {
    const renderItem = useCallback(
        ({ item }) => <MovieCard item={item} onPress={onMoviePress} />,
        [onMoviePress]
    );

    const keyExtractor = useCallback((item) => item.id || item._id, []);

    if (!movies.length) return null;

    return (
        <View className="mt-6">
            <SectionHeader title="Đang Chiếu" onViewAll={onViewAll} />

            <FlatList
                data={movies}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                removeClippedSubviews
                maxToRenderPerBatch={4}
                windowSize={5}
            />
        </View>
    );
};

export default React.memo(NowShowingSection);
