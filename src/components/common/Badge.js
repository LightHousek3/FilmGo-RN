import React from "react";
import { View, Text } from "react-native";
import { getAgeRatingStyle } from "../../utils/helpers";

const Badge = ({ label, variant = "default", className: extraClass = "" }) => {
    // If it's an age rating badge, use the dynamic style
    const ageStyle = getAgeRatingStyle(label);
    const isAgeRating = ["P", "T13", "T16", "T18", "C"].includes(label);

    const variantMap = {
        default: "bg-dark-100",
        primary: "bg-secondary",
        accent: "bg-accent",
        gold: "bg-gold",
        success: "bg-green-500",
        warning: "bg-yellow-500",
    };

    const bgClass = isAgeRating ? ageStyle.bg : (variantMap[variant] || variantMap.default);
    const textClass = isAgeRating ? ageStyle.text : "text-white";

    return (
        <View
            className={`rounded-md px-2 py-0.5 ${bgClass} ${extraClass}`}
        >
            <Text className={`text-xs font-bold ${textClass}`}>{label}</Text>
        </View>
    );
};

export default React.memo(Badge);
