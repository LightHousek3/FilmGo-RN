import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import COLORS from "../../constants/colors";

const Header = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View
            className="bg-primary pb-3"
            style={{ paddingTop: insets.top }}
        >
            <View className="flex-row items-center justify-between px-4 pt-1">
                {/* Hamburger */}
                <TouchableOpacity
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    activeOpacity={0.7}
                    className="w-9 items-start justify-center"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="menu" size={28} color={COLORS.white} />
                </TouchableOpacity>

                {/* Centered brand */}
                <View className="flex-row items-center gap-2">
                    <Image
                        source={require("../../../assets/FG-logo.png")}
                        className="h-16 w-16"
                        resizeMode="contain"
                    />
                    <Text className="text-2xl font-black text-white" style={{ letterSpacing: 0.5 }}>
                        Film<Text className="text-secondary">Go</Text>
                    </Text>
                </View>

                {/* Spacer balances flex so brand is centred */}
                <View className="w-9" />
            </View>
        </View>
    );
};

export default React.memo(Header);
