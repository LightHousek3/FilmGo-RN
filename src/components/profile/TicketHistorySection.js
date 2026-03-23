import React from "react";
import { View, Text } from "react-native";

const TicketHistorySection = () => {
  return (
    <View
      className="mt-5 rounded-2xl border px-4 py-5"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "#090A0E",
      }}
    >
      <Text className="text-lg font-bold text-white">Lịch sử vé</Text>
      <Text className="mt-2 text-base text-gray-400">
        Bạn chưa có giao dịch vé nào gần đây.
      </Text>
    </View>
  );
};

export default TicketHistorySection;
