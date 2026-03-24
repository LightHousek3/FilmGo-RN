import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks";
import { Button, Input } from "../../components/common";
import STRINGS from "../../constants/strings";
import COLORS from "../../constants/colors";

const MENU_ITEMS = [
  { id: "settings", label: "Cài đặt", icon: "settings-outline" },
  { id: "help", label: "Trợ giúp & Hỗ trợ", icon: "help-circle-outline" },
];

const formatDateForInput = (value) => {
  if (!value) return "";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateForPayload = (value) => {
  if (!value.trim()) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) {
    const [day, month, year] = value.trim().split("/");
    return `${year}-${month}-${day}`;
  }

  return value.trim();
};

const UpdateProfileScreen = ({ navigation }) => {
  const { user, updateProfile, logout, isLoading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    formatDateForInput(user?.dateOfBirth || "")
  );
  const [validationErrors, setValidationErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = useCallback(() => {
    const errors = {};

    if (!firstName.trim()) errors.firstName = "Tên không được để trống";
    if (!lastName.trim()) errors.lastName = "Họ không được để trống";

    if (phone && !/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    if (
      dateOfBirth.trim() &&
      !/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth.trim()) &&
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())
    ) {
      errors.dateOfBirth = "Ngày sinh phải có dạng DD/MM/YYYY";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [firstName, lastName, phone, dateOfBirth]);

  const handleUpdate = useCallback(async () => {
    setError("");
    if (!validate()) return;

    setIsLoading(true);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    if (phone.trim()) {
      payload.phone = phone.trim().replace(/\s/g, "");
    }

    if (dateOfBirth.trim()) {
      payload.dateOfBirth = formatDateForPayload(dateOfBirth);
    }

    const result = await updateProfile(payload);
    setIsLoading(false);

    if (result.success) {
      Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      setError(result.message || "Cập nhật thất bại. Vui lòng thử lại.");
    }
  }, [firstName, lastName, phone, dateOfBirth, validate, updateProfile, navigation]);

  const onPressPlaceholderAction = (label) => {
    Alert.alert("Thông báo", `Tính năng "${label}" sẽ sớm ra mắt.`);
  };

  const onPressLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();

          const parentNav = nav.getParent?.();
          if (parentNav) {
            parentNav.navigate('Auth', { screen: 'Login' });
            return;
          }

          nav.navigate('Auth', { screen: 'Login' });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-300">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-8">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mb-6"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <Text className="mb-2 text-3xl font-black text-white">
              Cập nhật hồ sơ
            </Text>
            <Text className="mb-8 text-sm text-gray-400">
              Chỉnh sửa thông tin cá nhân của bạn
            </Text>

            {error && (
              <View className="mb-4 rounded-xl bg-red-500/10 px-4 py-3">
                <Text className="text-center text-sm text-red-400">{error}</Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label="Họ"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Nguyễn"
                  leftIcon="person-outline"
                  error={validationErrors.lastName}
                />
              </View>

              <View className="flex-1">
                <Input
                  label="Tên"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Văn A"
                  leftIcon="person-outline"
                  error={validationErrors.firstName}
                />
              </View>
            </View>

            <Input
              label={STRINGS.email}
              value={user?.email || ""}
              editable={false}
              placeholder="email@example.com"
              keyboardType="email-address"
              leftIcon="mail-outline"
            />

            <Input
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              placeholder="0123456789"
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={validationErrors.phone}
            />

            <Input
              label="Ngày sinh"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="15/08/1995"
              leftIcon="calendar-outline"
              error={validationErrors.dateOfBirth}
            />

            <Button
              title="Lưu thay đổi"
              onPress={handleUpdate}
              loading={isLoading}
              size="lg"
              className="mt-2"
            />

            <View
              className="mt-5 overflow-hidden rounded-2xl border"
              style={{
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "#090A0E",
              }}
            >
              {MENU_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center justify-between px-4 py-4 ${index !== MENU_ITEMS.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  onPress={() => onPressPlaceholderAction(item.label)}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={COLORS.gray[400]}
                    />
                    <Text className="ml-3 text-xl font-semibold text-white">
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.gray[600]}
                  />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="flex-row items-center justify-between border-t border-white/10 px-4 py-4"
                disabled={isLoading || authLoading}
                onPress={onPressLogout}
              >
                <View className="flex-row items-center">
                  <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                  <Text className="ml-3 text-xl font-semibold text-[#FF3B30]">
                    Đăng xuất
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.gray[600]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UpdateProfileScreen;