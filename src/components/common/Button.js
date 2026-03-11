import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

const Button = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = "primary", // primary | secondary | outline | ghost
    size = "md", // sm | md | lg
    className: extraClass = "",
    textClassName = "",
    children,
}) => {
    const baseContainer =
        "items-center justify-center rounded-xl flex-row";

    const variantStyles = {
        primary: "bg-secondary",
        secondary: "bg-accent",
        outline: "border-2 border-secondary bg-transparent",
        ghost: "bg-transparent",
    };

    const sizeStyles = {
        sm: "px-4 py-2",
        md: "px-6 py-3.5",
        lg: "px-8 py-4",
    };

    const textVariantStyles = {
        primary: "text-white",
        secondary: "text-white",
        outline: "text-secondary",
        ghost: "text-secondary",
    };

    const textSizeStyles = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    const disabledStyle = disabled || loading ? "opacity-50" : "";

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            className={`${baseContainer} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyle} ${extraClass}`}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === "outline" || variant === "ghost" ? "#E94560" : "#FFFFFF"}
                />
            ) : children ? (
                children
            ) : (
                <Text
                    className={`font-bold ${textVariantStyles[variant]} ${textSizeStyles[size]} ${textClassName}`}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default React.memo(Button);
