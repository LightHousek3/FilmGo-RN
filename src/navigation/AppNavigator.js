import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import { Loading } from '../components/common';
import MovieDetailScreen from '../screens/home/MovieDetailScreen';
import SeatSelectionScreen from '../screens/booking/SeatSelectionScreen';
import ServiceSelectionScreen from '../screens/booking/ServiceSelectionScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';
import NewsDetailScreen from '../screens/news/NewsDetailScreen';
import FestivalDetailScreen from '../screens/festival/FestivalDetailScreen';
import { PaymentProvider } from '../contexts/PaymentContext';
import * as Linking from 'expo-linking';

import { navigationRef } from './NavigationService';

const Stack = createNativeStackNavigator();

const linking = {
    prefixes: ['filmgo://', Linking.createURL('/')],
    config: {
        screens: {
            Payment: {
                path: 'payment-result/:bookingId?',
                parse: {
                    bookingId: (value) => value,
                    success: (value) => value,
                    status: (value) => value,
                    message: (value) => value,
                },
            },
        },
    },
};

const AppNavigator = () => {
    const { isInitialized } = useAuth();

    if (!isInitialized) {
        return <Loading fullScreen text={null} />;
    }

    return (
        <NavigationContainer ref={navigationRef} linking={linking}>
            <PaymentProvider>
                <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Main">
                    <Stack.Screen name="Main" component={DrawerNavigator} />
                    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
                    <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
                    <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
                    <Stack.Screen name="Payment" component={PaymentScreen} />
                    <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
                    <Stack.Screen name="FestivalDetail" component={FestivalDetailScreen} />
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                </Stack.Navigator>
            </PaymentProvider>
        </NavigationContainer>
    );
};

export default AppNavigator;
