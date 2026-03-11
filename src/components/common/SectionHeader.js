import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

/**
 * @param {object} props
 * @param {string}       props.title
 * @param {()=>void}     [props.onViewAll]
 * @param {boolean}      [props.showViewAll=true]
 * @param {ReactNode}    [props.locationButton]  – optional element rendered next to title
 */
const SectionHeader = ({ title, onViewAll, showViewAll = true, locationButton }) => {
    return (
        <View className="mb-4 flex-row items-center justify-between px-4">
            {/* Left: title + optional location picker */}
            <View className="flex-row items-center" style={{ gap: 8 }}>
                <Text className="text-xl font-bold text-white">{title}</Text>
                {locationButton ?? null}
            </View>

            {showViewAll && onViewAll && (
                <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
                    <Text className="text-sm font-semibold text-secondary">Xem tất cả</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default React.memo(SectionHeader);
