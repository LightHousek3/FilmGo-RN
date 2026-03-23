import React from "react";
import { View, Text } from "react-native";

const SEAT_TYPES = ["STANDARD", "VIP", "SWEETBOX"];

const seatLabelMap = {
  STANDARD: "Standard",
  VIP: "VIP",
  SWEETBOX: "Sweetbox",
};

const TicketPriceTable = ({
  title,
  accentColor,
  headerBackground,
  standardColor,
  vipColor,
  sweetboxColor,
  rows,
  formatPrice,
}) => {
  const seatColorMap = {
    STANDARD: standardColor || accentColor,
    VIP: vipColor || accentColor,
    SWEETBOX: sweetboxColor || accentColor,
  };

  return (
    <View
      className="mt-5 overflow-hidden rounded-2xl border"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "#05070B",
      }}
    >
      <View className="px-4 py-3" style={{ backgroundColor: headerBackground }}>
        <Text className="text-2xl font-bold" style={{ color: accentColor }}>
          {title}
        </Text>
      </View>

      <View className="flex-row border-b border-white/10 px-3 py-3">
        <Text className="flex-[1.5] text-lg font-semibold text-gray-400">
          Khung giờ
        </Text>
        {SEAT_TYPES.map((type) => (
          <Text
            key={type}
            className="flex-1 text-center text-lg font-semibold text-gray-400"
          >
            {seatLabelMap[type]}
          </Text>
        ))}
      </View>

      {rows.length ? (
        rows.map((row, index) => (
          <View
            key={row.timeKey}
            className="flex-row items-center px-3 py-3"
            style={{
              borderBottomWidth: index === rows.length - 1 ? 0 : 1,
              borderBottomColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text className="flex-[1.5] text-base text-white">
              {row.timeLabel}
            </Text>
            {SEAT_TYPES.map((type) => {
              const price = row.prices[type];
              return (
                <Text
                  key={`${row.timeKey}-${type}`}
                  className="flex-1 text-center text-base font-semibold"
                  style={{ color: price ? seatColorMap[type] : "#6B7280" }}
                >
                  {price ? formatPrice(price) : "-"}
                </Text>
              );
            })}
          </View>
        ))
      ) : (
        <View className="px-4 py-4">
          <Text className="text-base text-gray-500">
            Chưa có dữ liệu cho khung ngày này.
          </Text>
        </View>
      )}
    </View>
  );
};

export default TicketPriceTable;
