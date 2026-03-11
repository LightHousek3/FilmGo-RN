import React from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../constants/colors";

const MOCK_NEWS = [
    {
        _id: "n1",
        title: "Liên hoan phim Quốc tế Hà Nội 2026 chính thức khởi động",
        category: "SỰ KIỆN",
        date: "28/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
        summary:
            "Lễ hội điện ảnh lớn nhất miền Bắc chính thức khai mạc với hàng trăm bộ phim từ khắp nơi trên thế giới.",
    },
    {
        _id: "n2",
        title: "Top 10 phim bom tấn được mong chờ nhất mùa hè 2026",
        category: "ĐIỆN ẢNH",
        date: "25/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
        summary:
            "Mùa hè 2026 hứa hẹn bùng nổ với loạt bom tấn đình đám từ Marvel, DC và nhiều hãng phim lớn.",
    },
    {
        _id: "n3",
        title: "Galaxy Cinema khai trương cụm rạp mới tại Thủ Đức",
        category: "TIN TỨC",
        date: "22/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
        summary:
            "Cụm rạp hiện đại nhất khu vực TP. Thủ Đức chính thức mở cửa với 12 phòng chiếu và công nghệ 4DX.",
    },
    {
        _id: "n4",
        title: "Oscar 2026: Danh sách đề cử chính thức được công bố",
        category: "GIẢI THƯỞNG",
        date: "20/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
        summary:
            "Viện Hàn lâm Điện ảnh Mỹ vừa công bố danh sách đề cử Oscar lần thứ 98, với nhiều bất ngờ thú vị.",
    },
    {
        _id: "n5",
        title: "Phim Việt Nam tranh tài tại LHP Cannes 2026",
        category: "QUỐC TẾ",
        date: "18/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
        summary:
            "Lần đầu tiên trong lịch sử, Việt Nam có hai bộ phim được mời tham dự tranh giải chính thức tại Cannes.",
    },
    {
        _id: "n6",
        title: "Công nghệ IMAX Laser chính thức có mặt tại Việt Nam",
        category: "CÔNG NGHỆ",
        date: "15/02/2026",
        imageUrl:
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700",
        summary:
            "Trải nghiệm màn hình cong khổng lồ IMAX Laser với độ phân giải 4K và âm thanh 12 kênh lần đầu có mặt.",
    },
];

const CATEGORY_COLORS = {
    "SỰ KIỆN": "#E94560",
    "ĐIỆN ẢNH": "#3B82F6",
    "TIN TỨC": "#22C55E",
    "GIẢI THƯỞNG": "#F5C518",
    "QUỐC TẾ": "#8B5CF6",
    "CÔNG NGHỆ": "#F59E0B",
};

const NewsCard = ({ item }) => (
    <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
    >
        <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
        />
        <View style={styles.cardBody}>
            <View style={styles.categoryRow}>
                <View
                    style={[
                        styles.categoryBadge,
                        {
                            backgroundColor:
                                (CATEGORY_COLORS[item.category] || COLORS.secondary) + "30",
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.categoryText,
                            {
                                color:
                                    CATEGORY_COLORS[item.category] || COLORS.secondary,
                            },
                        ]}
                    >
                        {item.category}
                    </Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <Text style={styles.titleText} numberOfLines={2}>
                {item.title}
            </Text>
            <Text style={styles.summaryText} numberOfLines={2}>
                {item.summary}
            </Text>
        </View>
    </TouchableOpacity>
);

const NewsScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tin Tức</Text>
                <View style={styles.backBtn} />
            </View>

            <FlatList
                data={MOCK_NEWS}
                renderItem={({ item }) => <NewsCard item={item} />}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    backBtn: { width: 36 },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: COLORS.white,
    },
    listContent: { padding: 16 },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        overflow: "hidden",
    },
    cardImage: { width: "100%", height: 180 },
    cardBody: { padding: 14 },
    categoryRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
    },
    categoryText: { fontSize: 11, fontWeight: "700" },
    dateText: { fontSize: 12, color: COLORS.gray[500] },
    titleText: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.white,
        marginBottom: 6,
        lineHeight: 22,
    },
    summaryText: {
        fontSize: 13,
        color: COLORS.gray[400],
        lineHeight: 18,
    },
});

export default NewsScreen;
