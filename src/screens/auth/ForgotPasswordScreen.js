import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useCountdown } from "../../hooks";
import { Button, Input } from "../../components/common";
import STRINGS from "../../constants/strings";
import COLORS from "../../constants/colors";
import Config from "../../config";

const { resendCooldownSeconds: RESEND_COOLDOWN_SECONDS } = Config.auth;

const ForgotPasswordScreen = ({ navigation }) => {
    const { forgotPassword, isLoading, error, clearError } = useAuth();
    const { secondsLeft, isActive, start } = useCountdown(RESEND_COOLDOWN_SECONDS);

    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [validationError, setValidationError] = useState("");

    const validate = useCallback(() => {
        if (!email.trim()) {
            setValidationError(STRINGS.emailRequired);
            return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setValidationError(STRINGS.emailInvalid);
            return false;
        }
        setValidationError("");
        return true;
    }, [email]);

    const handleSend = useCallback(async () => {
        clearError();
        if (!validate()) return;

        const result = await forgotPassword(email.trim());
        if (result.success) {
            setSent(true);
            start(); // Start 60s countdown
        }
    }, [email, validate, forgotPassword, clearError, start]);

    const handleResend = useCallback(async () => {
        if (isActive) return;
        clearError();
        const result = await forgotPassword(email.trim());
        if (result.success) {
            start();
        }
    }, [email, isActive, forgotPassword, clearError, start]);

    return (
        <SafeAreaView className="flex-1 bg-dark-300">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 px-6 py-8">
                        {/* Back */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mb-6"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        {/* Icon */}
                        <View className="mb-6 items-center">
                            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
                                <Ionicons name="key-outline" size={40} color={COLORS.secondary} />
                            </View>
                            <Text className="text-2xl font-black text-white">
                                {STRINGS.forgotPassword.replace("?", "")}
                            </Text>
                            <Text className="mt-2 text-center text-sm text-gray-400">
                                {STRINGS.forgotPasswordDesc}
                            </Text>
                        </View>

                        {/* Error */}
                        {error && (
                            <View className="mb-4 rounded-xl bg-red-500/10 px-4 py-3">
                                <Text className="text-center text-sm text-red-400">{error}</Text>
                            </View>
                        )}

                        {/* Success */}
                        {sent && !error && (
                            <View className="mb-4 rounded-xl bg-green-500/10 px-4 py-3">
                                <Text className="text-center text-sm text-green-400">
                                    Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.
                                </Text>
                            </View>
                        )}

                        <Input
                            label={STRINGS.email}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="email@example.com"
                            keyboardType="email-address"
                            leftIcon="mail-outline"
                            error={validationError}
                            editable={!sent}
                        />

                        {!sent ? (
                            <Button
                                title={STRINGS.sendResetLink}
                                onPress={handleSend}
                                loading={isLoading}
                                size="lg"
                                className="mt-2"
                            />
                        ) : (
                            <View>
                                <Button
                                    title={
                                        isActive
                                            ? `${STRINGS.resendIn} ${secondsLeft} ${STRINGS.seconds}`
                                            : STRINGS.sendResetLink
                                    }
                                    onPress={handleResend}
                                    loading={isLoading}
                                    disabled={isActive}
                                    size="lg"
                                    className="mt-2"
                                />
                            </View>
                        )}

                        {/* Back to Login */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                            className="mt-6 items-center"
                            activeOpacity={0.7}
                        >
                            <Text className="text-sm font-semibold text-secondary">
                                {STRINGS.backToLogin}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;
