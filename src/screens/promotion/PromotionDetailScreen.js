import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { promotionApi } from "../../api";
import { Loading } from "../../components/common";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&w=1000";

const formatDate = (value) => {
  if (!value) return "--/--/----";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  return date.toLocaleDateString("vi-VN");
};

const formatDiscount = (promotion) => {
  if (promotion?.discountType === "PERCENT") {
    return `Giảm ${Number(promotion?.discountValue || 0)}%`;
  }

  if (promotion?.discountType === "AMOUNT") {
    const amount = Number(promotion?.discountValue || 0);
    return `Giảm ${amount.toLocaleString("vi-VN")}đ`;
  }

  return "Ưu đãi đặc biệt";
};

const statusLabelMap = {
  ACTIVE: "Đang áp dụng",
  EXPIRED: "Hết hạn",
  UPCOMING: "Sắp diễn ra",
};

const seatLabelMap = {
  STANDARD: "Ghế thường",
  VIP: "Ghế VIP",
  SWEETBOX: "Ghế Sweetbox",
};

const movieTypeLabelMap = {
  "2D": "Phim 2D",
  "3D": "Phim 3D",
};

const dayTypeLabelMap = {
  WEEKDAY: "Ngày thường",
  WEEKEND: "Cuối tuần",
};

const prettifyList = (values = [], map = {}) =>
  values.map((value) => map[value] || value).join(", ");

const extractServiceTypes = (promotion) => {
  const services = promotion?.promotionServices;

  if (Array.isArray(services)) {
    return services.flatMap((service) =>
      Array.isArray(service?.typeService) ? service.typeService : [],
    );
  }

  if (Array.isArray(services?.typeService)) {
    return services.typeService;
  }

  return [];
};

const extractTicketField = (promotion, fieldName) => {
  const tickets = promotion?.promotionTickets;

  if (Array.isArray(tickets)) {
    return tickets.flatMap((ticket) =>
      Array.isArray(ticket?.[fieldName]) ? ticket[fieldName] : [],
    );
  }

  if (Array.isArray(tickets?.[fieldName])) {
    return tickets[fieldName];
  }

  return [];
};

const extractPromotionDetail = (response) => {
  const payload = response?.data;

  if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload;
  }

  return null;
};

const PromotionDetailScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promotion, setPromotion] = useState(null);

  const promotionId = route?.params?.promotionId;

  const fetchDetail = useCallback(async () => {
    if (!promotionId) {
      setError("Không tìm thấy mã khuyến mãi.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await promotionApi.getPromotionById(promotionId);
      const data = extractPromotionDetail(response);
      setPromotion(data || null);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Không tải được chi tiết khuyến mãi.";
      setError(message);
      setPromotion(null);
    } finally {
      setLoading(false);
    }
  }, [promotionId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const conditionText = useMemo(() => {
    if (!promotion) {
      return "Áp dụng theo điều kiện của rạp cho từng suất chiếu.";
    }

    const conditions = [];

    const serviceTypes = extractServiceTypes(promotion);
    if (serviceTypes.length) {
      conditions.push(`Dịch vụ: ${serviceTypes.join(", ")}`);
    }

    const seatTypes = extractTicketField(promotion, "typeSeat");
    if (seatTypes.length) {
      conditions.push(`Loại ghế: ${prettifyList(seatTypes, seatLabelMap)}`);
    }

    const movieTypes = extractTicketField(promotion, "typeMovie");
    if (movieTypes.length) {
      conditions.push(`Định dạng: ${prettifyList(movieTypes, movieTypeLabelMap)}`);
    }

    const dayTypes = extractTicketField(promotion, "dayType");
    if (dayTypes.length) {
      conditions.push(`Ngày áp dụng: ${prettifyList(dayTypes, dayTypeLabelMap)}`);
    }

    if (!conditions.length) {
      return "Áp dụng theo điều kiện của rạp cho từng suất chiếu.";
    }

    return conditions.join("\n");
  }, [promotion]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết khuyến mãi</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <Loading />
      ) : error ? (
        <View style={styles.stateWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.retryBtn}
            onPress={fetchDetail}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : promotion ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: promotion?.imageUrl || FALLBACK_IMAGE }}
            style={styles.image}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
          />

          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>
              {statusLabelMap[promotion?.status] || "Khuyến mãi"}
            </Text>
          </View>

          <Text style={styles.title}>{promotion?.title || "Khuyến mãi"}</Text>
          <Text style={styles.discount}>{formatDiscount(promotion)}</Text>

          <Text style={styles.description}>
            {promotion?.description || "Nội dung khuyến mãi đang được cập nhật."}
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bắt đầu</Text>
              <Text style={styles.infoValue}>{formatDate(promotion?.startDate)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hết hạn</Text>
              <Text style={styles.infoValue}>{formatDate(promotion?.endDate)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Điều kiện</Text>
              <Text style={styles.infoValue}>{conditionText}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.stateWrap}>
          <Text style={styles.emptyText}>Không có dữ liệu chi tiết.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  backBtn: {
    width: 32,
    alignItems: "flex-start",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  statusChip: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: COLORS.secondary + "2A",
    borderWidth: 1,
    borderColor: COLORS.secondary + "66",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusChipText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    marginTop: 12,
    color: COLORS.white,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
  },
  discount: {
    marginTop: 8,
    color: COLORS.warning,
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    marginTop: 10,
    color: COLORS.gray[300],
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    padding: 14,
  },
  infoRow: {
    gap: 6,
  },
  infoLabel: {
    color: COLORS.gray[400],
    fontSize: 13,
  },
  infoValue: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  divider: {
    marginVertical: 10,
    height: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: COLORS.gray[400],
    fontSize: 14,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});

export default PromotionDetailScreen;
