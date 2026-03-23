import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

const ProfileInfoSection = ({ fullName, user, onEdit, birthdayText }) => {
  return (
    <View
      className="mt-5 overflow-hidden rounded-2xl border"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "#090A0E",
      }}
    >
      <View className="flex-row items-center justify-between border-b border-white/10 px-4 py-3.5">
        <Text className="text-lg font-bold text-white">Thông tin cá nhân</Text>
        <TouchableOpacity className="flex-row items-center" onPress={onEdit}>
          <Ionicons name="create-outline" size={16} color={COLORS.secondary} />
          <Text
            className="ml-1 text-base font-semibold"
            style={{ color: COLORS.secondary }}
          >
            Chỉnh sửa
          </Text>
        </TouchableOpacity>
      </View>

      <View className="px-4">
        <View className="flex-row items-center border-b border-white/10 py-4">
          <Ionicons name="person-outline" size={20} color={COLORS.gray[500]} />
          <View className="ml-4">
            <Text className="text-sm text-gray-500">Họ và tên</Text>
            <Text className="mt-1 text-xl font-semibold text-white">
              {fullName}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center border-b border-white/10 py-4">
          <Ionicons name="mail-outline" size={20} color={COLORS.gray[500]} />
          <View className="ml-4">
            <Text className="text-sm text-gray-500">Email</Text>
            <Text className="mt-1 text-xl font-semibold text-white">
              {user?.email || "Chưa cập nhật"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center border-b border-white/10 py-4">
          <Ionicons name="call-outline" size={20} color={COLORS.gray[500]} />
          <View className="ml-4">
            <Text className="text-sm text-gray-500">Số điện thoại</Text>
            <Text className="mt-1 text-xl font-semibold text-white">
              {user?.phone || "Chưa cập nhật"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center py-4">
          <Ionicons
            name="calendar-outline"
            size={20}
            color={COLORS.gray[500]}
          />
          <View className="ml-4">
            <Text className="text-sm text-gray-500">Ngày sinh</Text>
            <Text className="mt-1 text-xl font-semibold text-white">
              {birthdayText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfileInfoSection;
