import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '../../components/common';
import { profileApi } from '../../api';
import COLORS from '../../constants/colors';

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const nextErrors = {};

        if (!currentPassword) nextErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';

        if (!newPassword) nextErrors.newPassword = 'Vui lòng nhập mật khẩu mới.';
        else if (newPassword.length < 6) nextErrors.newPassword = 'Mật khẩu tối thiểu 6 ký tự.';
        else if (!/^(?=.*[A-Za-z])(?=.*[!@#$%^&*])/.test(newPassword)) {
            nextErrors.newPassword = 'Mật khẩu cần có ít nhất 1 chữ và 1 ký tự đặc biệt.';
        }

        if (!confirmPassword) nextErrors.confirmPassword = 'Vui lòng nhập xác nhận mật khẩu.';
        else if (confirmPassword !== newPassword) {
            nextErrors.confirmPassword = 'Xác nhận mật khẩu không khớp.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSubmitting(true);
            await profileApi.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            Alert.alert('Thành công', 'Đổi mật khẩu thành công.', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            const message = error?.response?.data?.message || 'Đổi mật khẩu thất bại.';
            Alert.alert('Lỗi', message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-dark-300">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                    <View className="mb-4 flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-white">Đổi mật khẩu</Text>
                    </View>

                    <Input
                        label="Mật khẩu hiện tại"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="••••••••"
                        secureTextEntry
                        leftIcon="lock-closed-outline"
                        error={errors.currentPassword}
                    />

                    <Input
                        label="Mật khẩu mới"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="••••••••"
                        secureTextEntry
                        leftIcon="key-outline"
                        error={errors.newPassword}
                    />

                    <Input
                        label="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                        secureTextEntry
                        leftIcon="checkmark-circle-outline"
                        error={errors.confirmPassword}
                    />

                    <Button
                        title="Cập nhật mật khẩu"
                        onPress={handleSubmit}
                        loading={submitting}
                        disabled={submitting}
                        size="lg"
                        className="mt-2"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;
