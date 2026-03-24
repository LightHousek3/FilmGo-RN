import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Loading } from "../../components/common";
import usePromotions from "../../hooks/usePromotions";

const CATEGORY_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "COMBO", label: "Combo" },
  { key: "POPCORN", label: "Popcorn" },
  { key: "DRINK", label: "Drink" },
  { key: "OTHER", label: "Khác" },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&w=900";

const getServiceTypes = (promotion) => {
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

const formatDate = (value) => {
  if (!value) return "--/--/----";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  return date.toLocaleDateString("vi-VN");
};

const getBadgeText = (promotion) => {
  if (promotion?.discountType === "PERCENT") {
    return `-${Number(promotion?.discountValue || 0)}%`;
  }

  if (promotion?.discountType === "AMOUNT") {
    const amount = Number(promotion?.discountValue || 0);
    return `${amount.toLocaleString("vi-VN")}đ`;
  }

  return "Ưu đãi";
};

const PromotionScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("ALL");
  const {
    promotions,
    loading,
    error,
    refetch: fetchPromotions,
  } = usePromotions({ status: "ACTIVE", limit: 20 });

  const filteredPromotions = useMemo(() => {
    if (activeTab === "ALL") return promotions;

    return promotions.filter((item) => {
      const serviceTypes = getServiceTypes(item);
      return serviceTypes.includes(activeTab);
    });
  }, [activeTab, promotions]);

  const handlePressPromotion = useCallback(
    (promotion) => {
      const promotionId = promotion?._id || promotion?.id;
      if (!promotionId) return;

      navigation.navigate("PromotionDetail", { promotionId });
    },
    [navigation],
  );

  const renderPromotionItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.card}
        onPress={() => handlePressPromotion(item)}
      >
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: item?.imageUrl || FALLBACK_IMAGE }}
            style={styles.image}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getBadgeText(item)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.title} numberOfLines={2}>
            {item?.title || "Khuyến mãi"}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item?.description || "Ưu đãi hấp dẫn dành cho bạn."}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.expiryRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={COLORS.gray[500]}
              />
              <Text style={styles.expiryText}>{`HSD: ${formatDate(item?.endDate)}`}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handlePressPromotion],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.headerTitle}>Khuyến Mãi</Text>
        <Text style={styles.headerSubtitle}>Ưu đãi hấp dẫn dành riêng cho bạn</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <Loading />
        ) : error ? (
          <View style={styles.stateWrap}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.retryBtn}
              onPress={fetchPromotions}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredPromotions.length ? (
          <FlatList
            scrollEnabled={false}
            data={filteredPromotions}
            renderItem={renderPromotionItem}
            keyExtractor={(item, index) => String(item?._id || item?.id || index)}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
        ) : (
          <View style={styles.stateWrap}>
            <Text style={styles.emptyText}>Không có khuyến mãi phù hợp.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "900",
    color: COLORS.white,
    marginTop: 28,
  },
  headerSubtitle: {
    color: COLORS.gray[300],
    fontSize: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  tabsRow: {
    paddingBottom: 14,
    gap: 10,
  },
  tabButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: COLORS.background,
  },
  tabButtonActive: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  tabText: {
    color: COLORS.gray[300],
    fontSize: 22,
    fontWeight: "700",
  },
  tabTextActive: {
    color: COLORS.white,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: COLORS.black,
  },
  imageWrap: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.warning,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: COLORS.black,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  description: {
    marginTop: 8,
    color: COLORS.gray[300],
    fontSize: 14,
    lineHeight: 20,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  expiryText: {
    color: COLORS.gray[500],
    fontSize: 12,
  },
  stateWrap: {
    paddingVertical: 36,
    alignItems: "center",
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

export default PromotionScreen;
