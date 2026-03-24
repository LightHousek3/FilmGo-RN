import React, { useMemo, useState } from 'react';
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
import { useAuth } from '../../hooks';
import { profileApi } from '../../api';
import COLORS from '../../constants/colors';

const toDateInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

const EditProfileScreen = ({ navigation }) => {
    const { user, updateUser } = useAuth();

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [dateOfBirth, setDateOfBirth] = useState(toDateInput(user?.dateOfBirth));
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const isDirty = useMemo(() => {
        return (
            firstName !== (user?.firstName || '') ||
            lastName !== (user?.lastName || '') ||
            phone !== (user?.phone || '') ||
            avatar !== (user?.avatar || '') ||
            dateOfBirth !== toDateInput(user?.dateOfBirth)
        );
    }, [firstName, lastName, phone, avatar, dateOfBirth, user]);

    const validate = () => {
        const nextErrors = {};

        if (!firstName.trim()) nextErrors.firstName = 'Vui lòng nhập tên.';
        else if (firstName.trim().length > 10) nextErrors.firstName = 'Tên tối đa 10 ký tự.';

        if (!lastName.trim()) nextErrors.lastName = 'Vui lòng nhập họ.';
        else if (lastName.trim().length > 10) nextErrors.lastName = 'Họ tối đa 10 ký tự.';

        if (phone && !/^[0-9]{10,11}$/.test(phone)) {
            nextErrors.phone = 'Số điện thoại phải có 10-11 chữ số.';
        }

        if (avatar && !/^https?:\/\//i.test(avatar)) {
            nextErrors.avatar = 'Avatar phải là URL hợp lệ (http/https).';
        }

        if (dateOfBirth && Number.isNaN(new Date(dateOfBirth).getTime())) {
            nextErrors.dateOfBirth = 'Ngày sinh không hợp lệ (YYYY-MM-DD).';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!isDirty) {
            navigation.goBack();
            return;
        }

        try {
            setSaving(true);
            const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            };

            if (phone.trim()) payload.phone = phone.trim();
            if (avatar.trim()) payload.avatar = avatar.trim();
            if (dateOfBirth.trim()) payload.dateOfBirth = dateOfBirth.trim();

            const response = await profileApi.updateProfile(payload);
            const updated = response?.data?.data || response?.data;

            if (updated) {
                await updateUser(updated);
            }

            Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
            navigation.goBack();
        } catch (error) {
            const message = error?.response?.data?.message || 'Cập nhật hồ sơ thất bại.';
            Alert.alert('Lỗi', message);
        } finally {
            setSaving(false);
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
                        <Text className="text-2xl font-bold text-white">Chỉnh sửa hồ sơ</Text>
                    </View>

                    <Input
                        label="Tên"
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Nhập tên"
                        leftIcon="person-outline"
                        autoCapitalize="words"
                        error={errors.firstName}
                    />

                    <Input
                        label="Họ"
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Nhập họ"
                        leftIcon="person-outline"
                        autoCapitalize="words"
                        error={errors.lastName}
                    />

                    <Input
                        label="Số điện thoại"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="090xxxxxxx"
                        keyboardType="phone-pad"
                        leftIcon="call-outline"
                        error={errors.phone}
                    />

                    <Input
                        label="Avatar URL"
                        value={avatar}
                        onChangeText={setAvatar}
                        placeholder="https://..."
                        leftIcon="image-outline"
                        error={errors.avatar}
                    />

                    <Input
                        label="Ngày sinh (YYYY-MM-DD)"
                        value={dateOfBirth}
                        onChangeText={setDateOfBirth}
                        placeholder="2000-01-31"
                        leftIcon="calendar-outline"
                        error={errors.dateOfBirth}
                    />

                    <Button
                        title="Lưu thay đổi"
                        onPress={handleSubmit}
                        loading={saving}
                        disabled={saving}
                        size="lg"
                        className="mt-2"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;
