import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import COLORS from "../../constants/colors";
import STRINGS from "../../constants/strings";

const Loading = ({ fullScreen = false, text = STRINGS.loading }) => {
    if (fullScreen) {
        return (
            <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: COLORS.background }}
            >
                <ActivityIndicator size="large" color={COLORS.secondary} />
                {text && (
                    <Text className="mt-3 text-sm text-gray-400">{text}</Text>
                )}
            </View>
        );
    }

    return (
        <View className="items-center justify-center py-8">
            <ActivityIndicator size="small" color={COLORS.secondary} />
            {text && (
                <Text className="mt-2 text-xs text-gray-400">{text}</Text>
            )}
        </View>
    );
};

export default React.memo(Loading);
