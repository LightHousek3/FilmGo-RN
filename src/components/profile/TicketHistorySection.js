import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTicketHistory } from "../../hooks";
import COLORS from "../../constants/colors";

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "upcoming", label: "Sắp chiếu" },
  { key: "watched", label: "Đã xem" },
  { key: "canceled", label: "Đã hủy" },
];

const STATUS_UI = {
  upcoming: {
    label: "Sắp chiếu",
    color: "#F59E0B",
    background: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.4)",
  },
  watched: {
    label: "Đã xem",
    color: "#22C55E",
    background: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.4)",
  },
  canceled: {
    label: "Đã hủy",
    color: "#EF4444",
    background: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.4)",
  },
};

const formatDateTime = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} • ${hours}:${minutes}`;
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const TicketHistorySection = ({ onSelectBooking }) => {
  const {
    activeFilter,
    setActiveFilter,
    bookings,
    loading,
    error,
    isAuthenticated,
    refetch,
  } = useTicketHistory("all");

  return (
    <View className="mt-5">
      <View className="mb-4 flex-row flex-wrap">
        {STATUS_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              className="mb-2 mr-2 rounded-full border px-4 py-2"
              style={{
                borderColor: isActive
                  ? COLORS.secondary
                  : "rgba(255,255,255,0.2)",
                backgroundColor: isActive
                  ? "rgba(233, 69, 96, 0.14)"
                  : "transparent",
              }}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.85}
            >
              <Text
                className="font-semibold"
                style={{
                  color: isActive ? COLORS.secondary : COLORS.gray[300],
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View
          className="rounded-2xl border px-4 py-5"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            backgroundColor: "#090A0E",
          }}
        >
          <Text className="text-base text-gray-400">
            Đang tải lịch sử vé...
          </Text>
        </View>
      ) : error ? (
        <View
          className="rounded-2xl border px-4 py-5"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            backgroundColor: "#090A0E",
          }}
        >
          <Text className="text-base text-red-400">{error}</Text>
          <TouchableOpacity className="mt-3 self-start" onPress={refetch}>
            <Text style={{ color: COLORS.secondary }} className="font-semibold">
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : !isAuthenticated ? (
        <View
          className="rounded-2xl border px-4 py-5"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            backgroundColor: "#090A0E",
          }}
        >
          <Text className="text-base text-gray-400">
            Vui lòng đăng nhập để xem lịch sử vé.
          </Text>
        </View>
      ) : bookings.length === 0 ? (
        <View
          className="rounded-2xl border px-4 py-5"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            backgroundColor: "#090A0E",
          }}
        >
          <Text className="text-base text-gray-400">
            Không có vé nào ở trạng thái này.
          </Text>
        </View>
      ) : (
        bookings.map((booking) => {
          const statusUI = STATUS_UI[booking.status] || STATUS_UI.upcoming;
          return (
            <TouchableOpacity
              key={booking.id}
              activeOpacity={0.9}
              onPress={() => onSelectBooking?.(booking)}
              className="mb-4 overflow-hidden rounded-2xl border"
              style={{
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "#090A0E",
              }}
            >
              <View className="flex-row p-3">
                <View className="h-24 w-16 overflow-hidden rounded-xl bg-dark-100">
                  {booking.poster ? (
                    <Image
                      source={{ uri: booking.poster }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center bg-dark-100">
                      <Ionicons
                        name="film-outline"
                        size={18}
                        color={COLORS.gray[500]}
                      />
                    </View>
                  )}
                </View>

                <View className="ml-3 flex-1">
                  <View className="flex-row items-start justify-between">
                    <Text
                      className="mr-2 flex-1 text-xl font-bold text-white"
                      numberOfLines={1}
                    >
                      {booking.title}
                    </Text>

                    <View
                      className="rounded-full border px-2 py-1"
                      style={{
                        borderColor: statusUI.border,
                        backgroundColor: statusUI.background,
                      }}
                    >
                      <Text
                        style={{ color: statusUI.color }}
                        className="text-xs font-semibold"
                      >
                        {statusUI.label}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-2 flex-row items-center">
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={COLORS.gray[500]}
                    />
                    <Text className="ml-2 text-sm text-gray-300">
                      {booking.theater}
                    </Text>
                  </View>

                  <View className="mt-1 flex-row items-center">
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={COLORS.gray[500]}
                    />
                    <Text className="ml-2 text-sm text-gray-300">
                      {formatDateTime(booking.showAt)}
                    </Text>
                  </View>

                  <View className="mt-1 flex-row items-center">
                    <Ionicons
                      name="ticket-outline"
                      size={14}
                      color={COLORS.gray[500]}
                    />
                    <Text className="ml-2 text-sm text-gray-300">
                      Ghế: {booking.seatLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between border-t border-white/10 bg-[#0F1116] px-3 py-2.5">
                <Text className="text-sm text-gray-500">#{booking.code}</Text>
                <Text
                  className="text-base font-bold"
                  style={{ color: COLORS.secondary }}
                >
                  {formatMoney(booking.totalPrice)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
};

export default TicketHistorySection;
