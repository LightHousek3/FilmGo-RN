import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useTicketPrices } from "../../hooks";
import TicketPriceTable from "../../components/price/TicketPriceTable";
import { Loading } from "../../components/common";

const DAY_TABS = [
  { key: "WEEKDAY", label: "T2 - T6" },
  { key: "WEEKEND", label: "T7 - CN / Ngày Lễ    " },
];

const MOVIE_TYPE_CONFIG = [
  {
    key: "2D",
    title: "Phim 2D",
    accentColor: COLORS.secondary,
    headerBackground: "#2A0F14",
    standardColor: COLORS.info,
    vipColor: COLORS.gold,
    sweetboxColor: COLORS.secondary,
  },
  {
    key: "3D",
    title: "Phim 3D",
    accentColor: COLORS.info,
    headerBackground: "#0A1C3D",
    standardColor: COLORS.info,
    vipColor: COLORS.gold,
    sweetboxColor: COLORS.secondary,
  },
];

const RULE_ITEMS = [
  "Giá vé hiển thị theo loại phim, loại ghế và khung giờ tương ứng.",
  "Bảng giá được đồng bộ theo dữ liệu hiện hành của rạp.",
  "Một số suất chiếu đặc biệt có thể có mức giá khác so với bảng tham khảo.",
  "Vui lòng kiểm tra giá cuối cùng tại bước chọn ghế trước khi thanh toán.",
];

const toMinutes = (timeText = "00:00") => {
  const [hours = "0", minutes = "0"] = timeText.split(":");
  return Number(hours) * 60 + Number(minutes);
};

const mapRowsForTable = (items) => {
  const groupedByTime = items.reduce((acc, item) => {
    const timeKey = `${item.startTime}-${item.endTime}`;
    if (!acc[timeKey]) {
      acc[timeKey] = {
        timeKey,
        timeLabel: `${item.startTime} - ${item.endTime}`,
        startTime: item.startTime,
        prices: {},
      };
    }
    acc[timeKey].prices[item.typeSeat] = item.price;
    return acc;
  }, {});

  return Object.values(groupedByTime).sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
  );
};

const formatCurrency = (value) => {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
};

const PriceScreen = () => {
  const [activeDayType, setActiveDayType] = useState("WEEKDAY");
  const { ticketPrices, loading, error, refetch } = useTicketPrices({
    page: 1,
    limit: 50,
  });

  const tableData = useMemo(() => {
    const filteredByDay = ticketPrices.filter(
      (item) => item.dayType === activeDayType,
    );

    return MOVIE_TYPE_CONFIG.map((movieType) => {
      const itemsByMovieType = filteredByDay.filter(
        (item) => item.typeMovie === movieType.key,
      );
      return {
        ...movieType,
        rows: mapRowsForTable(itemsByMovieType),
      };
    });
  }, [activeDayType, ticketPrices]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-4xl font-bold text-white mt-8 mb-4">
          Bảng giá vé
        </Text>

        <View className="mt-6 flex-row rounded-2xl border border-white/10">
          {DAY_TABS.map((tab) => {
            const isActive = activeDayType === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                className="mr-2 flex-1 items-center rounded-2xl py-3"
                onPress={() => setActiveDayType(tab.key)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: isActive ? COLORS.secondary : "transparent",
                }}
              >
                <Text
                  className="text-base font-bold"
                  style={{ color: isActive ? "#FFFFFF" : "#C7CAD1" }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <Loading />
        ) : error ? (
          <View className="mt-10 items-center px-5">
            <Text className="text-center text-base text-red-400">{error}</Text>
            <TouchableOpacity
              className="mt-3 rounded-xl px-4 py-2"
              style={{ backgroundColor: COLORS.secondary }}
              onPress={() => refetch({ page: 1, limit: 50 })}
              activeOpacity={0.8}
            >
              <Text className="font-semibold text-white">Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tableData.map((table) => (
            <TicketPriceTable
              key={table.key}
              title={table.title}
              accentColor={table.accentColor}
              headerBackground={table.headerBackground}
              standardColor={table.standardColor}
              vipColor={table.vipColor}
              sweetboxColor={table.sweetboxColor}
              rows={table.rows}
              formatPrice={formatCurrency}
            />
          ))
        )}

        <View className="mt-6 rounded-2xl border border-white/10 bg-[#080B10] p-4">
          <Text className="text-2xl font-bold text-white">Lưu ý</Text>
          {RULE_ITEMS.map((item) => (
            <View key={item} className="mt-3 flex-row">
              <Text className="mr-2 text-gray-300">•</Text>
              <Text className="flex-1 text-sm leading-6 text-gray-300">
                {item}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PriceScreen;
