import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
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
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.primary,
                    borderTopColor: COLORS.surfaceLight,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: COLORS.secondary,
                tabBarInactiveTintColor: COLORS.gray[400],
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
                tabBarIcon: ({ focused, color, size }) => {
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
