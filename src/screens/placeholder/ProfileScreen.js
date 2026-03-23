import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks';
import { Button } from '../../components/common';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constants/colors';
import STRINGS from '../../constants/strings';

const ProfileScreen = () => {
    const { user, logout, isLoading } = useAuth();
    const navigation = useNavigation();
    return (
        <SafeAreaView className="flex-1 bg-dark-300">
            <View className="flex-1 items-center justify-center px-6">
                {/* Avatar */}
                <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-dark-100">
                    <Ionicons name="person" size={48} color={COLORS.gray[400]} />
                </View>

                {user ? (
                    <>
                        <Text className="text-xl font-bold text-white">
                            {user.firstName} {user.lastName}
                        </Text>
                        <Text className="mt-1 text-sm text-gray-400">{user.email}</Text>

                        <Button
                            title={STRINGS.logout}
                            onPress={logout}
                            loading={isLoading}
                            variant="outline"
                            className="mt-8 w-full"
                        />
                    </>
                ) : (
                    <Button
                        title={STRINGS.login}
                        onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                        loading={isLoading}
                        variant="outline"
                        className="mt-8 w-full"
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default ProfileScreen;
