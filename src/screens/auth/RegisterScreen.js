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

const RegisterScreen = ({ navigation }) => {
    const { register, isLoading, error, clearError } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    const validate = useCallback(() => {
        const errors = {};
        if (!firstName.trim()) errors.firstName = STRINGS.firstNameRequired;
        if (!lastName.trim()) errors.lastName = STRINGS.lastNameRequired;
        if (!email.trim()) errors.email = STRINGS.emailRequired;
        else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = STRINGS.emailInvalid;
        if (!password) errors.password = STRINGS.passwordRequired;
        else if (password.length < 6) errors.password = STRINGS.passwordMin;
        if (password !== confirmPassword)
            errors.confirmPassword = STRINGS.passwordNotMatch;
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [firstName, lastName, email, password, confirmPassword]);

    const handleRegister = useCallback(async () => {
        clearError();
        if (!validate()) return;

        const result = await register({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
        });

        if (result.success) {
            Alert.alert(
                STRINGS.success,
                "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.",
                [
                    {
                        text: "OK",
                        onPress: () =>
                            navigation.navigate("EmailVerification", { email: email.trim() }),
                    },
                ]
            );
        }
    }, [firstName, lastName, email, password, validate, register, clearError, navigation]);

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
                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mb-6"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        {/* Title */}
                        <Text className="mb-2 text-3xl font-black text-white">
                            {STRINGS.register}
                        </Text>
                        <Text className="mb-8 text-sm text-gray-400">
                            Tạo tài khoản mới để bắt đầu đặt vé xem phim
                        </Text>

                        {/* Error */}
                        {error && (
                            <View className="mb-4 rounded-xl bg-red-500/10 px-4 py-3">
                                <Text className="text-center text-sm text-red-400">{error}</Text>
                            </View>
                        )}

                        {/* Name Row */}
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Input
                                    label={STRINGS.lastName}
                                    value={lastName}
                                    onChangeText={setLastName}
                                    placeholder="Nguyễn"
                                    leftIcon="person-outline"
                                    error={validationErrors.lastName}
                                />
                            </View>
                            <View className="flex-1">
                                <Input
                                    label={STRINGS.firstName}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    placeholder="Văn A"
                                    leftIcon="person-outline"
                                    error={validationErrors.firstName}
                                />
                            </View>
                        </View>

                        <Input
                            label={STRINGS.email}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="email@example.com"
                            keyboardType="email-address"
                            leftIcon="mail-outline"
                            error={validationErrors.email}
                        />

                        <Input
                            label={STRINGS.password}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={validationErrors.password}
                        />

                        <Input
                            label={STRINGS.confirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={validationErrors.confirmPassword}
                        />

                        {/* Register Button */}
                        <Button
                            title={STRINGS.register}
                            onPress={handleRegister}
                            loading={isLoading}
                            size="lg"
                            className="mt-2"
                        />

                        {/* Login Link */}
                        <View className="mt-6 flex-row items-center justify-center">
                            <Text className="text-sm text-gray-400">
                                {STRINGS.alreadyHaveAccount}{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Login")}
                                activeOpacity={0.7}
                            >
                                <Text className="text-sm font-bold text-secondary">
                                    {STRINGS.login}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
