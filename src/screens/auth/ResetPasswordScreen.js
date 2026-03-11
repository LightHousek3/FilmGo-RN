import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks";
import { Button, Input } from "../../components/common";
import STRINGS from "../../constants/strings";
import COLORS from "../../constants/colors";

const ResetPasswordScreen = ({ navigation, route }) => {
    const { resetPassword, isLoading, error, clearError } = useAuth();
    const token = route?.params?.token || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    const validate = useCallback(() => {
        const errors = {};
        if (!password) errors.password = STRINGS.passwordRequired;
        else if (password.length < 6) errors.password = STRINGS.passwordMin;
        if (password !== confirmPassword)
            errors.confirmPassword = STRINGS.passwordNotMatch;
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [password, confirmPassword]);

    const handleReset = useCallback(async () => {
        clearError();
        if (!validate()) return;

        const result = await resetPassword(token, password);
        if (result.success) {
            Alert.alert(
                STRINGS.success,
                "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.",
                [{ text: "OK", onPress: () => navigation.navigate("Login") }]
            );
        }
    }, [password, token, validate, resetPassword, clearError, navigation]);

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

                        {/* Header */}
                        <View className="mb-6 items-center">
                            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
                                <Ionicons
                                    name="lock-open-outline"
                                    size={40}
                                    color={COLORS.secondary}
                                />
                            </View>
                            <Text className="text-2xl font-black text-white">
                                {STRINGS.resetPassword}
                            </Text>
                            <Text className="mt-2 text-center text-sm text-gray-400">
                                {STRINGS.resetPasswordDesc}
                            </Text>
                        </View>

                        {/* Error */}
                        {error && (
                            <View className="mb-4 rounded-xl bg-red-500/10 px-4 py-3">
                                <Text className="text-center text-sm text-red-400">{error}</Text>
                            </View>
                        )}

                        <Input
                            label={STRINGS.newPassword}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={validationErrors.password}
                        />

                        <Input
                            label={STRINGS.confirmNewPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={validationErrors.confirmPassword}
                        />

                        <Button
                            title={STRINGS.resetPassword}
                            onPress={handleReset}
                            loading={isLoading}
                            size="lg"
                            className="mt-2"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ResetPasswordScreen;
