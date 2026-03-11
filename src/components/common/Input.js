import React, { useState } from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    error,
    leftIcon,
    className: extraClass = "",
    editable = true,
    multiline = false,
    maxLength,
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    return (
        <View className={`mb-4 ${extraClass}`}>
            {label && (
                <Text className="mb-2 text-sm font-semibold text-gray-300">
                    {label}
                </Text>
            )}
            <View
                className={`flex-row items-center rounded-xl border px-4 ${isFocused
                        ? "border-secondary bg-dark-100"
                        : error
                            ? "border-red-500 bg-dark-100"
                            : "border-dark-100 bg-dark-100"
                    }`}
            >
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={isFocused ? COLORS.secondary : COLORS.gray[400]}
                        style={{ marginRight: 10 }}
                    />
                )}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.gray[500]}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    multiline={multiline}
                    maxLength={maxLength}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 py-3.5 text-base text-white"
                />
                {secureTextEntry && (
                    <TouchableOpacity onPress={togglePasswordVisibility} activeOpacity={0.7}>
                        <Ionicons
                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color={COLORS.gray[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text className="mt-1 text-xs text-red-500">{error}</Text>
            )}
        </View>
    );
};

export default React.memo(Input);
