import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
    View,
    Dimensions,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Config from "../../config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 200;
const BANNER_AUTO_SLIDE_INTERVAL = Config.ui.bannerAutoSlideInterval;

const PLACEHOLDER_BANNERS = [
    {
        id: "1",
        imageUrl:
            "https://images.unsplash.com/photo-1727255230225-5e9169c40720?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=1000",
    },
    {
        id: "2",
        imageUrl:
            "https://images.unsplash.com/photo-1623855516471-1b94b0d1b89e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=1000",
    },
    {
        id: "3",
        imageUrl:
            "https://images.unsplash.com/photo-1761948245185-fc300ad20316?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=1000",
    },
];

const BannerSlider = ({ banners = PLACEHOLDER_BANNERS, onBannerPress }) => {
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // These refs are only ever accessed from the JS thread (setTimeout / setInterval / event handlers)
    // so they never enter a worklet context — no "Tried to modify key current" error possible.
    const extIdxRef = useRef(1);      // position in extendedData (accounts for clone prefix)
    const isScrollingRef = useRef(false); // guard to prevent timer + manual swipe overlap

    const data = banners.length > 0 ? banners : PLACEHOLDER_BANNERS;

    // Infinite-loop clone strategy: [last, ...originals, first]
    const extendedData = useMemo(() => {
        if (data.length <= 1) return data;
        return [
            { ...data[data.length - 1], _eid: "clone-left" },
            ...data.map((item, i) => ({ ...item, _eid: `real-${i}` })),
            { ...data[0], _eid: "clone-right" },
        ];
    }, [data]);

    // Jump to first real item after mount (skip clone-left at index 0)
    useEffect(() => {
        if (data.length <= 1) return;
        const timer = setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: SCREEN_WIDTH, animated: false });
        }, 0);
        return () => clearTimeout(timer);
    }, [data.length]);

    // Auto-slide every BANNER_AUTO_SLIDE_INTERVAL ms
    useEffect(() => {
        if (data.length <= 1) return;

        const interval = setInterval(() => {
            if (isScrollingRef.current) return;
            isScrollingRef.current = true;

            const nextIdx = extIdxRef.current + 1;
            flatListRef.current?.scrollToOffset({
                offset: nextIdx * SCREEN_WIDTH,
                animated: true,
            });
        }, BANNER_AUTO_SLIDE_INTERVAL);

        return () => clearInterval(interval);
    }, [data.length]);

    // After each swipe or auto-slide settles, handle clone teleportation
    const handleMomentumScrollEnd = useCallback(
        (e) => {
            const x = e.nativeEvent.contentOffset.x;
            const landedIdx = Math.round(x / SCREEN_WIDTH);

            isScrollingRef.current = false;
            extIdxRef.current = landedIdx;

            if (landedIdx <= 0) {
                // Landed on left clone → jump instantly to last real item
                const realOffset = data.length * SCREEN_WIDTH;
                extIdxRef.current = data.length;
                setCurrentIndex(data.length - 1);
                flatListRef.current?.scrollToOffset({ offset: realOffset, animated: false });
            } else if (landedIdx >= data.length + 1) {
                // Landed on right clone → jump instantly to first real item
                extIdxRef.current = 1;
                setCurrentIndex(0);
                flatListRef.current?.scrollToOffset({ offset: SCREEN_WIDTH, animated: false });
            } else {
                setCurrentIndex(landedIdx - 1);
            }
        },
        [data.length]
    );

    const renderItem = useCallback(
        ({ item }) => (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onBannerPress?.(item)}
                style={{ width: SCREEN_WIDTH }}
            >
                <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: SCREEN_WIDTH, height: BANNER_HEIGHT }}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                />
                <LinearGradient
                    colors={["transparent", "rgba(15,15,26,0.85)"]}
                    style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80 }}
                />
            </TouchableOpacity>
        ),
        [onBannerPress]
    );

    const keyExtractor = useCallback((_item, index) => `banner-${index}`, []);

    return (
        <View className="relative">
            <FlatList
                ref={flatListRef}
                data={extendedData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                scrollEventThrottle={16}
                getItemLayout={(_d, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* Dots */}
            <View className="absolute bottom-3 w-full flex-row items-center justify-center gap-1.5">
                {data.map((_, index) => (
                    <View
                        key={index}
                        style={{
                            height: 7,
                            borderRadius: 4,
                            width: index === currentIndex ? 22 : 7,
                            backgroundColor:
                                index === currentIndex ? "#E94560" : "rgba(255,255,255,0.4)",
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

export default React.memo(BannerSlider);
