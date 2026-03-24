import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    ScrollView,
    RefreshControl,
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/layout/Header";
import {
    BannerSlider,
    MovieCarousel,
    ComingSoonSection,
    PromotionSection,
    NewsSection,
} from "../../components/home";
import { Loading } from "../../components/common";
import { movieApi, promotionApi, theaterApi, bannerApi, newsApi } from "../../api";
import COLORS from "../../constants/colors";

// ─── Vietnam provinces list ───────────────────────────
const LOCATIONS = [
    "Tất cả",
    "Hà Nội",
    "TP. Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Cà Mau",
    "Bình Dương",
    "Đồng Nai",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Ninh",
    "Bến Tre",
    "Long An",
    "Thừa Thiên Huế",
    "Khánh Hoà",
    "Quảng Nam",
    "Quảng Ngãi",
    "Nghệ An",
    "Thanh Hoá",
];

/** Location filter button shown next to a section title */
const LocationButton = ({ value, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={locStyles.btn}>
        <Ionicons name="location" size={12} color={COLORS.secondary} />
        {value && value !== "Tất cả" ? (
            <Text style={locStyles.btnText}>{value}</Text>
        ) : null}
    </TouchableOpacity>
);

/** Single row in the location picker – memoised so only the
 *  two rows whose active state actually flips ever re-render. */
const LocationItem = React.memo(({ name, isActive, onSelect }) => (
    <TouchableOpacity
        onPress={() => onSelect(name)}
        activeOpacity={0.75}
        style={[locStyles.locationItem, isActive && locStyles.locationItemActive]}
    >
        <Ionicons
            name={isActive ? "location" : "location-outline"}
            size={16}
            color={isActive ? COLORS.secondary : COLORS.gray[500]}
        />
        <Text style={[locStyles.locationText, isActive && { color: COLORS.white, fontWeight: "700" }]}>
            {name}
        </Text>
        {isActive && (
            <Ionicons name="checkmark" size={16} color={COLORS.secondary} style={{ marginLeft: "auto" }} />
        )}
    </TouchableOpacity>
));

// Stable reference – never changes, zero allocation per render.
const LOCATION_KEY_EXTRACTOR = (item) => item;

/** Modal bottom-sheet for picking a location */
const LocationModal = React.memo(({ visible, onClose, selected, onSelect, locationsData = [] }) => {
    // Single stable callback: select value → notify parent → close sheet
    const handleSelect = useCallback(
        (name) => {
            onSelect(name === "Tất cả" ? null : name);
            onClose();
        },
        [onSelect, onClose]
    );

    // renderItem only re-creates when `selected` changes (2 rows flip isActive).
    // LocationItem.memo ensures only those 2 rows pay for a real re-render.
    const renderItem = useCallback(
        ({ item }) => (
            <LocationItem
                name={item}
                isActive={item === selected || (item === "Tất cả" && !selected)}
                onSelect={handleSelect}
            />
        ),
        [selected, handleSelect]
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={locStyles.overlay} activeOpacity={1} onPress={onClose} />
            <View style={locStyles.sheet}>
                <View style={locStyles.sheetHandle} />
                <Text style={locStyles.sheetTitle}>Chọn tỉnh / thành phố</Text>
                <FlatList
                    data={locationsData}
                    keyExtractor={LOCATION_KEY_EXTRACTOR}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews
                    maxToRenderPerBatch={8}
                    windowSize={11}
                />
            </View>
        </Modal>
    );
});

const locStyles = StyleSheet.create({
    btn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: COLORS.secondary + "22",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: COLORS.secondary + "55",
    },
    btnText: { fontSize: 11, fontWeight: "700", color: COLORS.secondary },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    sheet: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 32,
        maxHeight: "65%",
    },
    sheetHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.gray[600],
        alignSelf: "center",
        marginTop: 10,
        marginBottom: 4,
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.white,
        textAlign: "center",
        paddingVertical: 14,
    },
    locationItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 13,
    },
    locationItemActive: {
        backgroundColor: COLORS.secondary + "15",
    },
    locationText: {
        fontSize: 14,
        color: COLORS.gray[300],
    },
});

// ─── Placeholder data matching Figma design ──────────
const MOCK_NOW_SHOWING = [
    {
        _id: "1",
        title: "Dune: Part Two",
        image: {
            url: "https://images.unsplash.com/photo-1727255230225-5e9169c40720?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400",
        },
        duration: 166,
        ageRating: "T16",
        genres: [{ name: "Sci-Fi" }, { name: "Hành động" }],
        rating: "9.4",
        releaseDate: "2026-02-01",
    },
    {
        _id: "2",
        title: "Kung Fu Panda 4",
        image: {
            url: "https://images.unsplash.com/photo-1623855516471-1b94b0d1b89e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400",
        },
        duration: 94,
        ageRating: "P",
        genres: [{ name: "Hoạt hình" }, { name: "Hài" }],
        rating: "8.5",
        releaseDate: "2026-02-15",
    },
    {
        _id: "3",
        title: "Exhuma - Quật Mộ Trùng Ma",
        image: {
            url: "https://images.unsplash.com/photo-1769321309399-38d9eda18370?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400",
        },
        duration: 134,
        ageRating: "T18",
        genres: [{ name: "Kinh dị" }, { name: "Tâm linh" }],
        rating: "8.9",
        releaseDate: "2026-02-20",
    },
    {
        _id: "4",
        title: "Godzilla x Kong: Đế Chế Mới",
        image: {
            url: "https://images.unsplash.com/photo-1761948245185-fc300ad20316?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400",
        },
        duration: 115,
        ageRating: "T13",
        genres: [{ name: "Hành động" }, { name: "Viễn tưởng" }],
        rating: "8.2",
        releaseDate: "2026-03-01",
    },
];

const MOCK_COMING_SOON = [
    {
        _id: "5",
        title: "Civil War",
        image: {
            url: "https://images.unsplash.com/photo-1765510296004-614b6cc204da?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400",
        },
        duration: 109,
        ageRating: "T18",
        genres: [{ name: "Hành động" }, { name: "Chiến tranh" }],
        releaseDate: "2026-04-01",
    },
    {
        _id: "6",
        title: "The Fall Guy",
        image: {
            url: "https://images.unsplash.com/photo-1761948245185-fc300ad20316?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400",
        },
        duration: 126,
        ageRating: "T13",
        genres: [{ name: "Hành động" }, { name: "Hài" }],
        releaseDate: "2026-04-15",
    },
    {
        _id: "7",
        title: "Kingdom of the Planet of the Apes",
        image: {
            url: "https://images.unsplash.com/photo-1727255230225-5e9169c40720?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400",
        },
        duration: 145,
        ageRating: "T13",
        genres: [{ name: "Hành động" }, { name: "Phiêu lưu" }],
        releaseDate: "2026-05-01",
    },
    {
        _id: "8",
        title: "Deadpool & Wolverine",
        image: {
            url: "https://images.unsplash.com/photo-1623855516471-1b94b0d1b89e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=400",
        },
        duration: 128,
        ageRating: "T18",
        genres: [{ name: "Hành động" }, { name: "Hài" }],
        releaseDate: "2026-07-01",
    },
];

const MOCK_PROMOTIONS = [
    {
        _id: "p1",
        title: "Combo Popcorn & Drink - Save 20%",
        imageUrl:
            "https://images.unsplash.com/photo-1585647347483-22b66260dfff?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
    },
    {
        _id: "p2",
        title: "Student Discount - Flat 45k/Ticket",
        imageUrl:
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
    },
    {
        _id: "p3",
        title: "Wednesday Happy Hour",
        imageUrl:
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
    },
];

const MOCK_NEWS = [
    {
        _id: "n1",
        title: "Liên hoan phim Quốc tế Hà Nội 2026 chính thức khởi động",
        category: "SỰ KIỆN",
        date: "28/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
    },
    {
        _id: "n2",
        title: "Top 10 phim bom tấn được mong chờ nhất mùa hè 2026",
        category: "ĐIỆN ẢNH",
        date: "25/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
    },
    {
        _id: "n3",
        title: "Galaxy Cinema khai trương cụm rạp mới tại Thủ Đức",
        category: "TIN TỨC",
        date: "22/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
    },
    {
        _id: "n4",
        title: "Oscar 2026: Danh sách đề cử chính thức được công bố",
        category: "GIẢI THƯỞNG",
        date: "20/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
    },
];

const HomeScreen = () => {
    const [nowShowing, setNowShowing] = useState([]);
    const [comingSoon, setComingSoon] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [news, setNews] = useState([]);
    const [banners, setBanners] = useState([]);
    const [locations, setLocations] = useState(LOCATIONS); // fallback defaults
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Single location filter shared between both carousels
    const [location, setLocation] = useState(null);
    const [locationModalVisible, setLocationModalVisible] = useState(false);

    const fetchData = useCallback(async (loc = null) => {
        try {
            const movieParams = { limit: 6, ...(loc ? { location: loc } : {}) };

            const [nowShowingRes, comingSoonRes, promotionsRes, bannersRes, locationsRes, newsRes] = await Promise.allSettled([
                movieApi.getNowShowing(movieParams),
                movieApi.getComingSoon(movieParams),
                promotionApi.getPromotions({ status: "ACTIVE", limit: 5 }),
                bannerApi.getBanners({ limit: 5 }),
                theaterApi.getLocations(),
                newsApi.getNews({ limit: 5 })
            ]);

            setNowShowing(
                nowShowingRes.status === "fulfilled" &&
                    Array.isArray(nowShowingRes.value?.data?.data) &&
                    nowShowingRes.value.data.data.length
                    ? nowShowingRes.value.data.data
                    : MOCK_NOW_SHOWING
            );

            setComingSoon(
                comingSoonRes.status === "fulfilled" &&
                    Array.isArray(comingSoonRes.value?.data?.data) &&
                    comingSoonRes.value.data.data.length
                    ? comingSoonRes.value.data.data
                    : MOCK_COMING_SOON
            );

            setPromotions(
                promotionsRes.status === "fulfilled" &&
                    Array.isArray(promotionsRes.value?.data?.data) &&
                    promotionsRes.value.data.data.length
                    ? promotionsRes.value.data.data
                    : MOCK_PROMOTIONS
            );

            setBanners(
                bannersRes.status === "fulfilled" &&
                    Array.isArray(bannersRes.value?.data?.data) &&
                    bannersRes.value.data.data.length
                    ? bannersRes.value.data.data
                    : []
            );

            if (
                locationsRes.status === "fulfilled" &&
                Array.isArray(locationsRes.value?.data?.data) &&
                locationsRes.value.data.data.length
            ) {
                // Ensure "Tất cả" is first
                const fetchedLocs = locationsRes.value.data.data;
                const finalLocs = fetchedLocs.includes("Tất cả") ? fetchedLocs : ["Tất cả", ...fetchedLocs];
                setLocations(finalLocs);
            }

            setNews(
                newsRes.status === "fulfilled" &&
                    Array.isArray(newsRes.value?.data?.data) &&
                    newsRes.value.data.data.length
                    ? newsRes.value.data.data
                    : MOCK_NEWS
            );
        } catch {
            setNowShowing(MOCK_NOW_SHOWING);
            setComingSoon(MOCK_COMING_SOON);
            setPromotions(MOCK_PROMOTIONS);
            setNews(MOCK_NEWS);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Refetch when location filter changes (applies to both lists)
    useEffect(() => {
        if (!loading) {
            fetchData(location);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData(location);
    }, [fetchData, location]);

    const handleMoviePress = useCallback((movie) => {
        // TODO: navigate to movie detail screen
    }, []);

    // Single location button shared by both carousels
    const locationBtn = useMemo(
        () => (
            <LocationButton
                value={location}
                onPress={() => setLocationModalVisible(true)}
            />
        ),
        [location]
    );

    const closeLocationModal = useCallback(() => setLocationModalVisible(false), []);
    const selectLocation = useCallback((loc) => setLocation(loc), []);

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <View className="flex-1 bg-dark-300">
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.secondary}
                        colors={[COLORS.secondary]}
                    />
                }
            >
                {/* Banner Slider */}
                {/* <BannerSlider banners={banners} /> */}

                {/* Now Showing Carousel – location button filters both lists */}
                <MovieCarousel
                    title="Đang Chiếu"
                    movies={nowShowing}
                    onMoviePress={handleMoviePress}
                    locationButton={locationBtn}
                />

                {/* Coming Soon – same location filter, no separate button */}
                <ComingSoonSection
                    movies={comingSoon}
                    onMoviePress={handleMoviePress}
                />

                {/* Promotions */}
                <PromotionSection promotions={promotions} />

                {/* News */}
                <NewsSection news={news} />

                {/* Bottom spacing */}
                <View className="h-4" />
            </ScrollView>

            {/* Single location modal – filters both now-showing and coming-soon */}
            <LocationModal
                visible={locationModalVisible}
                onClose={closeLocationModal}
                selected={location}
                onSelect={selectLocation}
                locationsData={locations}
            />
        </View>
    );
};

export default HomeScreen;
