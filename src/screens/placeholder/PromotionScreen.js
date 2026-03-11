import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import STRINGS from "../../constants/strings";

const PromotionScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-dark-300">
            <View className="flex-1 items-center justify-center">
                <Ionicons name="gift-outline" size={64} color={COLORS.gray[600]} />
                <Text className="mt-4 text-lg font-bold text-gray-400">
                    {STRINGS.tabPromotion}
                </Text>
                <Text className="mt-1 text-sm text-gray-500">Coming soon...</Text>
            </View>
        </SafeAreaView>
    );
};

export default PromotionScreen;
