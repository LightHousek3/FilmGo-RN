import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useCountdown } from '../../hooks';
import { Button, Input } from '../../components/common';
import STRINGS from '../../constants/strings';
import COLORS from '../../constants/colors';
import Config from '../../config';

const { resendCooldownSeconds: RESEND_COOLDOWN_SECONDS } = Config.auth;

const EmailVerificationScreen = ({ navigation, route }) => {
    const password = route?.params?.password || '';
    const email = route?.params?.email || '';
    const { verifyEmail, resendVerification } = useAuth();
    const { secondsLeft, isActive, start } = useCountdown(RESEND_COOLDOWN_SECONDS);

    const [code, setCode] = useState('');
    const [validationError, setValidationError] = useState('');

    // Local loading and error states
    const [isVerifyLoading, setIsVerifyLoading] = useState(false);
    const [isResendLoading, setIsResendLoading] = useState(false);
    const [error, setError] = useState('');

    useFocusEffect(
        useCallback(() => {
            setError('');
            return () => {
                setError('');
            };
        }, []),
    );

    const handleChangeCode = useCallback(
        (value) => {
            const numericValue = value.replace(/\D/g, '');
            setCode(numericValue);
            if (validationError) {
                setValidationError('');
            }
        },
        [validationError],
    );

    const handleVerify = useCallback(async () => {
        setError('');

        if (code.length !== 6) {
            setValidationError('Vui lòng nhập mã xác thực gồm 6 chữ số.');
            return;
        }

        setIsVerifyLoading(true);
        const result = await verifyEmail({
            email: email.trim(),
            password: password.trim(),
            code: code.trim(),
        });
        setIsVerifyLoading(false);

        if (result.success) {
            Alert.alert(STRINGS.success, 'Xác thực email thành công!', [
                {
                    text: 'OK',
                    onPress: () => {
                        if (!result.authenticated) {
                            navigation.navigate('Main');
                        }
                    },
                },
            ]);
        } else {
            setError(result.message || 'Xác thực email thất bại.');
        }
    }, [code, verifyEmail, email, password, navigation]);

    const handleResend = useCallback(async () => {
        if (isActive || !email) return;
        setError('');

        setIsResendLoading(true);
        const result = await resendVerification(email);
        setIsResendLoading(false);

        if (result.success) {
            start();
        } else {
            setError(result.message || 'Không thể gửi lại mã xác minh.');
        }
    }, [email, isActive, resendVerification, start]);

    return (
        <SafeAreaView className="flex-1 bg-dark-300">
            <View className="flex-1 items-center justify-center px-6">
                {/* Icon */}
                <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-secondary/20">
                    <Ionicons name="mail-unread-outline" size={50} color={COLORS.secondary} />
                </View>

                <Text className="mb-3 text-2xl font-black text-white">{STRINGS.verifyEmail}</Text>

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

                <Input
                    label="Mã xác thực"
                    value={code}
                    onChangeText={handleChangeCode}
                    placeholder="Nhập 6 chữ số"
                    keyboardType="number-pad"
                    maxLength={6}
                    error={validationError}
                    className="w-full"
                />

                <Button
                    title="Xác thực"
                    onPress={handleVerify}
                    loading={isVerifyLoading}
                    size="lg"
                    className="mb-3 w-full"
                />

                {/* Resend Button */}
                <Button
                    title={
                        isActive
                            ? `${STRINGS.resendIn} ${secondsLeft} ${STRINGS.seconds}`
                            : STRINGS.resendVerification
                    }
                    onPress={handleResend}
                    loading={isResendLoading}
                    disabled={isActive || isVerifyLoading}
                    size="lg"
                    variant={isActive ? 'outline' : 'primary'}
                    className="w-full"
                />

                {/* Back to Login */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
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
