import React, { useEffect, useMemo } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedRef,
    useAnimatedStyle,
    scrollTo,
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

// 2 clones on each side: real items live at indices [CLONES … CLONES+n-1]
const CLONES = 2;
// Initial scroll offset = first real item (index CLONES) centred
const INITIAL_OFFSET = CLONES * CARD_INTERVAL;

/**
 * Cinema-style carousel with infinite loop.
 *
 * Extended data: [clone_n-2, clone_n-1, ...originals, clone_0, clone_1]
 *  - Real items span indices CLONES … CLONES+n-1
 *  - Two clones on each side keep neighbors populated at every edge position
 *  - On momentum-end in clone territory → silent teleport (UI thread only,
 *    no runOnJS / React state update → zero re-render flash)
 *  - Indicator dots are driven by scrollX shared value on the UI thread
 */

// ─── Animated dot ────────────────────────────────────────────────────────────
// Fully UI-thread driven: no React state, no re-renders when active dot changes.
const AnimatedDot = React.memo(({ index, scrollX, total }) => {
    const style = useAnimatedStyle(() => {
        // Map any scroll position → 0-based movie index (handles clone offsets)
        const raw = Math.round(scrollX.value / CARD_INTERVAL) - CLONES;
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

// ─── Carousel ─────────────────────────────────────────────────────────────────
const MovieCarousel = ({
    title,
    movies = [],
    onMoviePress,
    onViewAll,
    locationButton,
}) => {
    const scrollRef = useAnimatedRef();
    const scrollX = useSharedValue(INITIAL_OFFSET);
    const moviesLength = useSharedValue(movies.length);

    useEffect(() => {
        moviesLength.value = movies.length;
    }, [movies.length]);

    // [clone_n-2, clone_n-1, ...originals, clone_0, clone_1]
    // Uses circular indexing so it works for any array length ≥ 2.
    const extendedMovies = useMemo(() => {
        const n = movies.length;
        if (n <= 1) return movies;
        const at = (i) => movies[((i % n) + n) % n];
        return [
            { ...at(n - 2), _cloneKey: "left2" },
            { ...at(n - 1), _cloneKey: "left1" },
            ...movies,
            { ...at(0), _cloneKey: "right1" },
            { ...at(1), _cloneKey: "right2" },
        ];
    }, [movies]);

    // Reset to first real item when the movies list changes
    useEffect(() => {
        if (movies.length > 1) {
            const timer = setTimeout(() => {
                scrollX.value = INITIAL_OFFSET;
                scrollTo(scrollRef, INITIAL_OFFSET, 0, false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [movies.length]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
        onMomentumEnd: (event) => {
            "worklet";
            const n = moviesLength.value;
            if (n <= 1) return;

            const landedIdx = Math.round(event.contentOffset.x / CARD_INTERVAL);

            if (landedIdx < CLONES) {
                // Left-clone territory → jump forward n positions to real counterpart
                const realOffset = (landedIdx + n) * CARD_INTERVAL;
                scrollX.value = realOffset;
                scrollTo(scrollRef, realOffset, 0, false);
            } else if (landedIdx >= CLONES + n) {
                // Right-clone territory → jump back n positions to real counterpart
                const realOffset = (landedIdx - n) * CARD_INTERVAL;
                scrollX.value = realOffset;
                scrollTo(scrollRef, realOffset, 0, false);
            }
            // Inside real range → nothing to do; scrollX already tracks position
        },
    });

    if (!movies.length) return null;

    return (
        <View className="mt-6">
            <SectionHeader
                title={title}
                onViewAll={onViewAll}
                locationButton={locationButton}
            />

            <Animated.ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_INTERVAL}
                decelerationRate="fast"
                disableIntervalMomentum
                contentOffset={{ x: INITIAL_OFFSET, y: 0 }}
                contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                style={{ overflow: "visible" }}
            >
                {extendedMovies.map((item, index) => (
                    <MovieCarouselItem
                        key={`${item._id ?? item.id ?? index}${item._cloneKey ?? ""}`}
                        item={item}
                        index={index}
                        scrollX={scrollX}
                        onPress={onMoviePress}
                    />
                ))}
            </Animated.ScrollView>

            {/* Dots driven by scrollX on the UI thread — zero JS re-renders */}
            {movies.length > 1 && (
                <View className="mt-3 flex-row items-center justify-center gap-1.5">
                    {movies.map((_, idx) => (
                        <AnimatedDot
                            key={idx}
                            index={idx}
                            scrollX={scrollX}
                            total={movies.length}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

export default React.memo(MovieCarousel);
