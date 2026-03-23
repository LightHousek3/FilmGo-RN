import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { View, Dimensions, FlatList } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import MovieCarouselItem, {
    CARD_WIDTH,
    SPACING,
} from "./MovieCarouselItem";
import { SectionHeader } from "../common";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_INTERVAL = CARD_WIDTH + SPACING * 2;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2 - SPACING;

// High multiplex multiplier to virtually eliminate the edges
const MULTIPLIER = 50;

/**
 * Enterprise-level infinite movie carousel.
 * Uses FlatList virtualization to minimize memory overhead + "multiplex" data 
 * to provide a seamless infinite scrolling effect without UI layout-jump flicker.
 */

// ─── Animated dot ────────────────────────────────────────────────────────────
// Fully UI-thread driven: no React state, no re-renders when active dot changes.
const AnimatedDot = React.memo(({ index, scrollX, total }) => {
    const style = useAnimatedStyle(() => {
        // Find which raw index we are currently looking at based on scroll
        const raw = Math.round(scrollX.value / CARD_INTERVAL);
        const activeIdx = ((raw % total) + total) % total;
        const isActive = activeIdx === index;
        return {
            width: withTiming(isActive ? 20 : 6, { duration: 200 }),
            backgroundColor: isActive
                ? "#E94560"
                : "rgba(255,255,255,0.3)",
        };
    });
    return <Animated.View style={[{ height: 6, borderRadius: 3 }, style]} />;
});

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// ─── Carousel ─────────────────────────────────────────────────────────────────
const MovieCarousel = ({
    title,
    movies = [],
    onMoviePress,
    onViewAll,
    locationButton,
}) => {
    const moviesLength = movies.length;
    const initialIndex = moviesLength > 1 ? Math.floor(MULTIPLIER / 2) * moviesLength : 0;
    const initialOffset = initialIndex * CARD_INTERVAL;

    // Initialize scrollX with the correct offset immediately to prevent 1-frame scale jumping
    const scrollX = useSharedValue(initialOffset);
    const listRef = useRef(null);
    
    // Create a deeply multiplexed array for true zero-flicker infinite scroll
    const extendedMovies = useMemo(() => {
        if (moviesLength <= 1) return movies;
        return Array(MULTIPLIER).fill(movies).flat().map((item, index) => ({
            ...item,
            _uniqueId: `${item._id || item.id || 'movie'}-${index}`
        }));
    }, [movies, moviesLength]);

    useEffect(() => {
        if (moviesLength > 1) {
            scrollX.value = initialOffset;
        }
    }, [moviesLength, initialOffset, scrollX]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const renderItem = useCallback(({ item, index }) => (
        <MovieCarouselItem
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={onMoviePress}
        />
    ), [onMoviePress, scrollX]);

    const keyExtractor = useCallback((item) => item._uniqueId || item._id || item.id || Math.random().toString(), []);

    const getItemLayout = useCallback((_, index) => ({
        length: CARD_INTERVAL,
        offset: CARD_INTERVAL * index,
        index,
    }), []);

    if (!movies || movies.length === 0) return null;

    return (
        <View className="mt-6">
            <SectionHeader
                title={title}
                onViewAll={onViewAll}
                locationButton={locationButton}
            />

            <AnimatedFlatList
                ref={listRef}
                data={extendedMovies}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_INTERVAL}
                decelerationRate="fast"
                disableIntervalMomentum
                contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                initialScrollIndex={initialIndex}
                getItemLayout={getItemLayout}
                removeClippedSubviews={true}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={7}
            />

            {/* Dots driven by scrollX on the UI thread */}
            {moviesLength > 1 && (
                <View className="mt-3 flex-row items-center justify-center gap-1.5">
                    {movies.map((_, idx) => (
                        <AnimatedDot
                            key={idx}
                            index={idx}
                            scrollX={scrollX}
                            total={moviesLength}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

export default React.memo(MovieCarousel);
