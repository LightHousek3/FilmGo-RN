import { useEffect, useRef } from 'react';
import { Animated, View, Easing } from 'react-native';

const HashLoader = ({ size = 50, color = '#36d7b7' }) => {
    const rotation = useRef(new Animated.Value(0)).current;
    const stretch = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                // Animation round 360 degree
                Animated.timing(rotation, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                // Animation stretch
                Animated.sequence([
                    Animated.timing(stretch, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(stretch, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ).start();
    }, [rotation, stretch]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const scale = stretch.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 1],
    });

    // Calc scale to create # figure
    const thickness = size * 0.2;
    const offset = size * 0.2;

    const lineStyle = {
        position: 'absolute',
        backgroundColor: color,
        borderRadius: thickness / 2,
    };

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View style={{ width: size, height: size, transform: [{ rotate: spin }] }}>
                {/* 2 horizontal line */}
                <Animated.View
                    style={[
                        lineStyle,
                        {
                            width: size,
                            height: thickness,
                            top: offset,
                            transform: [{ scaleX: scale }],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        lineStyle,
                        {
                            width: size,
                            height: thickness,
                            bottom: offset,
                            transform: [{ scaleX: scale }],
                        },
                    ]}
                />

                {/* 2 Vertical line */}
                <Animated.View
                    style={[
                        lineStyle,
                        {
                            width: thickness,
                            height: size,
                            left: offset,
                            transform: [{ scaleY: scale }],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        lineStyle,
                        {
                            width: thickness,
                            height: size,
                            right: offset,
                            transform: [{ scaleY: scale }],
                        },
                    ]}
                />
            </Animated.View>
        </View>
    );
};

export default HashLoader;
