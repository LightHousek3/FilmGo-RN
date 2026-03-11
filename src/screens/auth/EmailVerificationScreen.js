import React, { useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useCountdown } from "../../hooks";
import { Button } from "../../components/common";
import STRINGS from "../../constants/strings";
import COLORS from "../../constants/colors";
import Config from "../../config";

const { resendCooldownSeconds: RESEND_COOLDOWN_SECONDS } = Config.auth;

const EmailVerificationScreen = ({ navigation, route }) => {
    const email = route?.params?.email || "";
    const { resendVerification, isLoading, error, clearError } = useAuth();
    const { secondsLeft, isActive, start } = useCountdown(RESEND_COOLDOWN_SECONDS);

    const handleResend = useCallback(async () => {
        if (isActive || !email) return;
        clearError();
        const result = await resendVerification(email);
        if (result.success) {
            start();
        }
    }, [email, isActive, resendVerification, clearError, start]);

    return (
        <SafeAreaView className="flex-1 bg-dark-300">
            <View className="flex-1 items-center justify-center px-6">
                {/* Icon */}
                <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-secondary/20">
                    <Ionicons name="mail-unread-outline" size={50} color={COLORS.secondary} />
                </View>

                <Text className="mb-3 text-2xl font-black text-white">
                    {STRINGS.verifyEmail}
                </Text>

                <Text className="mb-2 text-center text-sm text-gray-400">
                    {STRINGS.emailVerificationDesc}
                </Text>

                {email ? (
                    <Text className="mb-8 text-center text-sm font-semibold text-secondary">
                        {email}
                    </Text>
                ) : null}

                {/* Error */}
                {error && (
                    <View className="mb-4 w-full rounded-xl bg-red-500/10 px-4 py-3">
                        <Text className="text-center text-sm text-red-400">{error}</Text>
                    </View>
                )}

                {/* Resend Button */}
                <Button
                    title={
                        isActive
                            ? `${STRINGS.resendIn} ${secondsLeft} ${STRINGS.seconds}`
                            : STRINGS.resendVerification
                    }
                    onPress={handleResend}
                    loading={isLoading}
                    disabled={isActive}
                    size="lg"
                    variant={isActive ? "outline" : "primary"}
                    className="w-full"
                />

                {/* Back to Login */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Login")}
                    className="mt-6"
                    activeOpacity={0.7}
                >
                    <Text className="text-sm font-semibold text-secondary">
                        {STRINGS.backToLogin}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default EmailVerificationScreen;
