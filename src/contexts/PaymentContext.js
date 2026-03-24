import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '../navigation/NavigationService';

export const PaymentContext = createContext({});

export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }) => {
    const [pendingBooking, setPendingBooking] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isFabVisible, setIsFabVisible] = useState(true);

    const insets = useSafeAreaInsets();

    useEffect(() => {
        let interval;
        if (pendingBooking && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setPendingBooking(null);
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [pendingBooking]); // Only re-run when pendingBooking changes!

    const setPendingPayment = (booking) => {
        if (!booking) {
            setPendingBooking(null);
            setTimeLeft(0);
            return;
        }

        // Only keep global pending payment for orders waiting for payment.
        if (booking.status && booking.status !== 'PENDING') {
            setPendingBooking(null);
            setTimeLeft(0);
            return;
        }

        const createdAt = new Date(booking.createdAt).getTime();
        const now = new Date().getTime();
        const expiresAt = createdAt + 10 * 60 * 1000; // 10 mins

        const remaining = Math.floor((expiresAt - now) / 1000);

        if (remaining > 0) {
            setPendingBooking(booking);
            setTimeLeft(remaining);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handlePressFab = () => {
        if (pendingBooking) {
            navigate('Payment', {
                bookingId: pendingBooking._id || pendingBooking.id,
                bookingData: pendingBooking,
            });
        }
    };

    return (
        <PaymentContext.Provider
            value={{
                pendingBooking,
                timeLeft,
                setPendingPayment,
                clearPendingPayment: () => {
                    setPendingBooking(null);
                    setTimeLeft(0);
                },
                setIsFabVisible,
            }}
        >
            {children}

            {/* Global FAB */}
            {pendingBooking && timeLeft > 0 && isFabVisible && (
                <View
                    style={[styles.fabContainer, { bottom: insets.bottom + 80 }]}
                    pointerEvents="box-none"
                >
                    <TouchableOpacity
                        style={styles.fab}
                        activeOpacity={0.9}
                        onPress={handlePressFab}
                    >
                        <Ionicons
                            name="time"
                            size={20}
                            color="#FFFFFF"
                            style={{ marginRight: 6 }}
                        />
                        <View>
                            <Text style={styles.fabTitle}>Thanh toán ngay</Text>
                            <Text style={styles.fabTime}>{formatTime(timeLeft)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </PaymentContext.Provider>
    );
};

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        right: 16,
        alignItems: 'flex-end',
        zIndex: 9999,
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    fabTitle: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    fabTime: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
    },
});
