import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
    View,
    Dimensions,
    TouchableOpacity,
    FlatList,
    StyleSheet
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Config from "../../config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 200;
const BANNER_AUTO_SLIDE_INTERVAL = Config.ui.bannerAutoSlideInterval || 3000;
const MULTIPLIER = 50; // Multiplex to simulate infinite scroll without jumping

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

    const data = banners && banners.length > 0 ? banners : PLACEHOLDER_BANNERS;
    const dataLength = data.length;

    // Create a deeply multiplexed array for true zero-flicker infinite scroll
    const extendedData = useMemo(() => {
        if (dataLength <= 1) return data;
        return Array(MULTIPLIER).fill(data).flat().map((item, index) => ({
            ...item,
            _uniqueId: `${item._id || item.id || 'banner'}-${index}`
        }));
    }, [data, dataLength]);

    // Calculate middle to start
    const initialIndex = dataLength > 1 ? Math.floor(MULTIPLIER / 2) * dataLength : 0;
    const realIndexRef = useRef(initialIndex);

    // Auto-slide
    useEffect(() => {
        if (dataLength <= 1) return;
        const interval = setInterval(() => {
            realIndexRef.current += 1;
            flatListRef.current?.scrollToIndex({
                index: realIndexRef.current,
                animated: true,
            });
        }, BANNER_AUTO_SLIDE_INTERVAL);

        return () => clearInterval(interval);
    }, [dataLength]);

    const dataLengthRef = useRef(dataLength);
    useEffect(() => {
        dataLengthRef.current = dataLength;
    }, [dataLength]);

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            const index = viewableItems[0].index;
            if (index != null && dataLengthRef.current > 0) {
                realIndexRef.current = index;
                setCurrentIndex(index % dataLengthRef.current);
            }
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 100
    }).current;

    const renderItem = useCallback(
        ({ item }) => (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onBannerPress?.(item)}
                style={{ width: SCREEN_WIDTH }}
            >
                <Image
                    source={{ uri: item.imageUrl || item.image?.url }}
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

    const keyExtractor = useCallback((item) => item._uniqueId || item.id || Math.random().toString(), []);

    if (!data || data.length === 0) return null;

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
                initialScrollIndex={initialIndex}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
                removeClippedSubviews={true}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={5}
            />

            {/* Dots */}
            {dataLength > 1 && (
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
            )}
        </View>
    );
};

export default React.memo(BannerSlider);
