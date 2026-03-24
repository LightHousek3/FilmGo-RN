import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import { Loading } from '../components/common';
import MovieDetailScreen from '../screens/home/MovieDetailScreen';
import PromotionDetailScreen from '../screens/promotion/PromotionDetailScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isInitialized } = useAuth();

    if (!isInitialized) {
        return <Loading fullScreen text={null} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Main">
                <Stack.Screen name="Main" component={DrawerNavigator} />
                <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
                <Stack.Screen name="PromotionDetail" component={PromotionDetailScreen} />
                <Stack.Screen name="Auth" component={AuthNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
