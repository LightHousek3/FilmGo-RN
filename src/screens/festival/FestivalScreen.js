import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../constants/colors";
import festivalApi from "../../api/festivalApi";

const formatDateRange = (startTime, endTime) => {
  if (!startTime || !endTime) return "";
  const start = new Date(startTime).toLocaleDateString("vi-VN");
  const end = new Date(endTime).toLocaleDateString("vi-VN");
  return `${start} - ${end}`;
};

const getStatusLabel = (startTime, endTime) => {
  if (!startTime || !endTime) return "";

  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now >= start && now <= end) return "Đang diễn ra";
  if (now > end) return "Đã kết thúc";
  return "Sắp diễn ra";
};

const FestivalCard = ({ item, onPress }) => {
  const imageSource = item.imageUrl || item.image || null;
  const statusLabel = getStatusLabel(item.startTime, item.endTime);
  const dateRange = formatDateRange(item.startTime, item.endTime);

  return (
    <TouchableOpacity activeOpacity={0.92} style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {imageSource ? (
          <Image
            source={{ uri: imageSource }}
            style={styles.cardImage}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={36} color={COLORS.gray[400]} />
          </View>
        )}

        {!!statusLabel && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{statusLabel}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        {!!item.title && (
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
        )}

        {!!item.content && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.content}
          </Text>
        )}

        {!!dateRange && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={15} color="#9CA3AF" />
            <Text style={styles.infoText}>{dateRange}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailText}>Chi tiết</Text>
          <Ionicons name="arrow-forward" size={16} color="#F97316" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FestivalScreen = () => {
  const navigation = useNavigation();
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const response = await festivalApi.getFestivals();
      console.log("festival response:", response?.data);
      setFestivals(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      console.log("Fetch festivals error:", error?.response?.data || error.message);
      setFestivals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Sự kiện</Text>
        <Text style={styles.pageSubtitle}>Các sự kiện điện ảnh nổi bật</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
          </View>
        ) : festivals.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>Chưa có sự kiện nào</Text>
          </View>
        ) : (
          festivals.map((item) => (
            <FestivalCard
              key={item._id}
              item={item}
              onPress={() =>
                navigation.navigate("FestivalDetail", {
                  festivalId: item._id,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    color: "#C4C4C4",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#050505",
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 22,
  },
  imageWrapper: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 290,
  },
  imagePlaceholder: {
    width: "100%",
    height: 290,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  badge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  cardContent: {
    padding: 18,
    backgroundColor: "#000",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 26,
    marginBottom: 10,
  },
  cardDescription: {
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    color: "#9CA3AF",
    fontSize: 14,
    flex: 1,
  },
  detailRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    color: "#F97316",
    fontWeight: "700",
    fontSize: 15,
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    color: "#C4C4C4",
    marginTop: 10,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
  },
});

export default FestivalScreen;