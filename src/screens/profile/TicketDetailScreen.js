import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

const TicketDetailScreen = ({ navigation, route }) => {
  const booking = route?.params?.booking;
  const bookingId = route?.params?.bookingId || booking?.id;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center border-b border-white/10 px-4 py-3">
        <TouchableOpacity
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white/5"
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.white} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Chi tiết vé</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="rounded-2xl border border-white/10 bg-[#0D0F14] p-4">
          <Text className="text-sm text-gray-400">Booking ID</Text>
          <Text className="mt-2 text-base font-semibold text-white">
            {bookingId || "Chưa có ID"}
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-white/10 bg-[#0D0F14] p-4">
          <Text className="text-sm text-gray-400">Phim</Text>
          <Text className="mt-2 text-lg font-bold text-white">
            {booking?.title || "Không rõ tên phim"}
          </Text>

          <Text className="mt-3 text-sm text-gray-400">Rạp</Text>
          <Text className="mt-1 text-base text-gray-200">
            {booking?.theater || "Chưa cập nhật"}
          </Text>

          <Text className="mt-3 text-sm text-gray-400">Mã đơn</Text>
          <Text className="mt-1 text-base text-gray-200">
            #{booking?.code || "N/A"}
          </Text>

          <Text className="mt-3 text-sm text-gray-400">Ghế</Text>
          <Text className="mt-1 text-base text-gray-200">
            {booking?.seatLabel || "Chưa cập nhật"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TicketDetailScreen;
