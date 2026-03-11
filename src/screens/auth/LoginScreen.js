import { useState } from "react";
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
import { useAuth } from "../../hooks";
import { Button, Input } from "../../components/common";
import STRINGS from "../../constants/strings";
import COLORS from "../../constants/colors";

const LoginScreen = ({ navigation }) => {
    const { login, isLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    const validate = () => {
        const errors = {};
        if (!email.trim()) errors.email = STRINGS.emailRequired;
        else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = STRINGS.emailInvalid;
        if (!password) errors.password = STRINGS.passwordRequired;
        else if (password.length < 6) errors.password = STRINGS.passwordMin;
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async () => {
        clearError();
        if (!validate()) return;
        await login(email.trim(), password);
    };

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
                    <View className="flex-1 justify-center px-6 py-8">
                        {/* Logo */}
                        <View className="mb-10 items-center">
                            <Ionicons name="film" size={56} color={COLORS.secondary} />
                            <Text className="mt-3 text-3xl font-black text-white">
                                Film<Text className="text-secondary">Go</Text>
                            </Text>
                            <Text className="mt-2 text-sm text-gray-400">
                                {STRINGS.tagline}
                            </Text>
                        </View>

                        {/* Error */}
                        {error && (
                            <View className="mb-4 rounded-xl bg-red-500/10 px-4 py-3">
                                <Text className="text-center text-sm text-red-400">{error}</Text>
                            </View>
                        )}

                        {/* Inputs */}
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

                        {/* Forgot Password */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate("ForgotPassword")}
                            className="mb-6 self-end"
                            activeOpacity={0.7}
                        >
                            <Text className="text-sm font-semibold text-secondary">
                                {STRINGS.forgotPassword}
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <Button
                            title={STRINGS.login}
                            onPress={handleLogin}
                            loading={isLoading}
                            size="lg"
                        />

                        {/* Register Link */}
                        <View className="mt-6 flex-row items-center justify-center">
                            <Text className="text-sm text-gray-400">
                                {STRINGS.dontHaveAccount}{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Register")}
                                activeOpacity={0.7}
                            >
                                <Text className="text-sm font-bold text-secondary">
                                    {STRINGS.register}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
