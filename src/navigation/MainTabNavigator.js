import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeScreen from "../screens/home/HomeScreen";
import TheaterScreen from "../screens/placeholder/TheaterScreen";
import PriceScreen from "../screens/placeholder/PriceScreen";
import PromotionScreen from "../screens/placeholder/PromotionScreen";
import ProfileScreen from "../screens/placeholder/ProfileScreen";
import COLORS from "../constants/colors";
import STRINGS from "../constants/strings";

const Tab = createBottomTabNavigator();

const TAB_ICON_MAP = {
  HomeTab: { focused: "home", unfocused: "home-outline" },
  TheaterTab: { focused: "film", unfocused: "film-outline" },
  PriceTab: { focused: "pricetag", unfocused: "pricetag-outline" },
  PromotionTab: { focused: "gift", unfocused: "gift-outline" },
  ProfileTab: { focused: "person", unfocused: "person-outline" },
};

const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: COLORS.surfaceLight,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          ...(Platform.OS === "android"
            ? {
                elevation: 12,
              }
            : {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
              }),
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICON_MAP[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: STRINGS.tabHome }}
      />
      <Tab.Screen
        name="TheaterTab"
        component={TheaterScreen}
        options={{ tabBarLabel: STRINGS.tabTheater }}
      />
      <Tab.Screen
        name="PriceTab"
        component={PriceScreen}
        options={{ tabBarLabel: STRINGS.tabPrice }}
      />
      <Tab.Screen
        name="PromotionTab"
        component={PromotionScreen}
        options={{ tabBarLabel: STRINGS.tabPromotion }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: STRINGS.tabProfile }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
