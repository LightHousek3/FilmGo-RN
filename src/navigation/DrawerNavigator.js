import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MainTabNavigator from "./MainTabNavigator";
import NewsScreen from "../screens/news/NewsScreen";
import FestivalScreen from "../screens/festival/FestivalScreen";
import ContactScreen from "../screens/contact/ContactScreen";
import { useAuth } from "../hooks";
import COLORS from "../constants/colors";

const Drawer = createDrawerNavigator();

const DRAWER_ITEMS = [
  {
    name: "MainTabs",
    label: "Trang Chủ",
    icon: "home-outline",
    focusedIcon: "home",
    color: COLORS.secondary,
  },
  {
    name: "DrawerNews",
    label: "Tin Tức",
    icon: "newspaper-outline",
    focusedIcon: "newspaper",
    color: "#3B82F6",
  },
  {
    name: "DrawerFestival",
    label: "Lễ Hội Điện Ảnh",
    icon: "calendar-outline",
    focusedIcon: "calendar",
    color: "#F5C518",
  },
  {
    name: "DrawerContact",
    label: "Liên Hệ",
    icon: "call-outline",
    focusedIcon: "call",
    color: "#22C55E",
  },
];

function CustomDrawerContent({ navigation, state }) {
  const insets = useSafeAreaInsets();
  const { logout, isAuthenticated } = useAuth();
  const activeRouteName = state.routeNames[state.index];

  const onPressAuthAction = () => {
    if (isAuthenticated) {
      logout();
      return;
    }

    navigation.getParent()?.navigate("Auth");
  };

  return (
    <View className="flex-1 bg-dark-200" style={{ paddingTop: insets.top }}>
      {/* ── Brand header ── */}
      <View className="items-center px-5 pb-5 pt-4">
        <View className="mb-3 h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-accent">
          <Image
            source={require("../../assets/FG-logo.png")}
            className="h-16 w-16"
            resizeMode="contain"
          />
        </View>
        <Text className="text-2xl font-black text-white">
          Film<Text className="text-secondary">Go</Text>
        </Text>
      </View>

      {/* ── Divider ── */}
      <View className="mx-4 my-1 h-px bg-dark-100" />

      {/* ── Menu items ── */}
      <DrawerContentScrollView
        scrollEnabled={false}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        {DRAWER_ITEMS.map((item) => {
          const isActive = activeRouteName === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigation.navigate(item.name)}
              activeOpacity={0.75}
              className="relative mx-2 mb-0.5 flex-row items-center rounded-xl px-5 py-3.5"
              style={
                isActive ? { backgroundColor: item.color + "20" } : undefined
              }
            >
              {/* Active indicator bar */}
              {isActive && (
                <View
                  className="absolute bottom-[20%] left-2 top-[20%] w-1 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
              )}

              <Ionicons
                name={isActive ? item.focusedIcon : item.icon}
                size={22}
                color={isActive ? item.color : COLORS.gray[400]}
              />
              <Text
                className="ml-3.5 text-[15px] font-semibold"
                style={{ color: isActive ? COLORS.white : COLORS.gray[400] }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      {/* ── Footer: auth action ── */}
      <View style={{ paddingBottom: insets.bottom + 8 }}>
        <View className="mx-4 my-1 h-px bg-dark-100" />
        <TouchableOpacity
          onPress={onPressAuthAction}
          activeOpacity={0.75}
          className="mt-1 flex-row items-center px-6 py-3.5"
          style={{ gap: 14 }}
        >
          <Ionicons
            name={isAuthenticated ? "log-out-outline" : "log-in-outline"}
            size={22}
            color={isAuthenticated ? COLORS.error : COLORS.secondary}
          />
          <Text
            className="text-[15px] font-semibold"
            style={{ color: isAuthenticated ? COLORS.error : COLORS.secondary }}
          >
            {isAuthenticated ? "Đăng xuất" : "Đăng nhập"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          backgroundColor: COLORS.surface,
          width: 280,
        },
        overlayColor: "rgba(0,0,0,0.65)",
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ title: "Trang Chủ" }}
      />
      <Drawer.Screen
        name="DrawerNews"
        component={NewsScreen}
        options={{ title: "Tin Tức" }}
      />
      <Drawer.Screen
        name="DrawerFestival"
        component={FestivalScreen}
        options={{ title: "Lễ Hội Điện Ảnh" }}
      />
      <Drawer.Screen
        name="DrawerContact"
        component={ContactScreen}
        options={{ title: "Liên Hệ" }}
      />
    </Drawer.Navigator>
  );
};
export default DrawerNavigator;
