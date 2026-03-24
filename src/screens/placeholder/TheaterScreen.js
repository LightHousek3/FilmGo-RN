import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theaterApi } from '../../api';

const RADIUS_OPTIONS = [3, 5, 10, 20, 50];
const DEFAULT_RADIUS = 10;
const THEATER_PLACEHOLDER =
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=700';

const extractList = (response) => {
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data?.results)) return response.data.results;
    if (Array.isArray(response?.data)) return response.data;
    return [];
};

const formatDistance = (distanceKm) => {
    if (distanceKm == null || Number.isNaN(distanceKm)) return null;
    if (distanceKm < 1) return `${Math.max(1, Math.round(distanceKm * 1000))}m`;
    if (distanceKm >= 10) return `${Math.round(distanceKm)} km`;
    return `${distanceKm.toFixed(1)} km`;
};

const parseDistanceKm = (theater) => {
    const candidate = theater?.distanceKm ?? theater?.distance;
    const parsed = Number(candidate);
    if (!Number.isFinite(parsed)) return null;
    return parsed > 100 ? parsed / 1000 : parsed;
};

const mapTheater = (theater, index) => {
    const distanceKm = parseDistanceKm(theater);
    const distanceLabel = theater?.distanceText || formatDistance(distanceKm);

    return {
        id: theater._id || theater.id || `theater-${index}`,
        name: theater.name || 'Rạp đang cập nhật',
        address: theater.address || theater.location || 'Địa chỉ đang được cập nhật',
        phone: theater.phone || 'Đang cập nhật',
        imageUrl: theater.image?.url || THEATER_PLACEHOLDER,
        rating: Number(theater.rating || 4.5).toFixed(1),
        distanceLabel,
        distanceKm,
        screenCount: theater.screenCount || theater.screens?.length || theater.numberOfScreens || 0,
        formats: theater.formats || ['2D', '3D', 'IMAX', 'Dolby Atmos'],
        raw: theater,
    };
};

const TheaterScreen = ({ navigation }) => {
    const [permissionStatus, setPermissionStatus] = useState('undetermined');
    const [locationLoading, setLocationLoading] = useState(false);
    const [theatersLoading, setTheatersLoading] = useState(false);
    const [error, setError] = useState('');
    const [radius, setRadius] = useState(DEFAULT_RADIUS);
    const [radiusInput, setRadiusInput] = useState(String(DEFAULT_RADIUS));
    const [userLocation, setUserLocation] = useState(null);
    const [theaters, setTheaters] = useState([]);

    const readCurrentLocation = useCallback(async () => {
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };

        setUserLocation(coords);
        return coords;
    }, []);

    const requestPermissionAndLocation = useCallback(async () => {
        try {
            setLocationLoading(true);
            const permission = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(permission.status);

            if (!permission.granted) {
                Alert.alert(
                    'Cần quyền vị trí',
                    'Bạn chưa cho phép chia sẻ vị trí. Hãy bật quyền vị trí trong Cài đặt để tìm rạp gần bạn.',
                    [
                        { text: 'Để sau', style: 'cancel' },
                        {
                            text: 'Mở Cài đặt',
                            onPress: () => Linking.openSettings(),
                        },
                    ],
                );
                return null;
            }

            return await readCurrentLocation();
        } catch {
            setError('Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
            return null;
        } finally {
            setLocationLoading(false);
        }
    }, [readCurrentLocation]);

    const fetchNearbyTheaters = useCallback(async (coords, searchRadius) => {
        if (!coords) return;

        try {
            setTheatersLoading(true);
            setError('');

            const response = await theaterApi.getNearby({
                lat: coords.latitude,
                lng: coords.longitude,
                limit: 20,
            });

            const mapped = extractList(response)
                .map((item, index) => mapTheater(item, index))
                .filter((item) => item.distanceKm == null || item.distanceKm <= searchRadius)
                .sort((a, b) => {
                    if (a.distanceKm == null && b.distanceKm == null) return 0;
                    if (a.distanceKm == null) return 1;
                    if (b.distanceKm == null) return -1;
                    return a.distanceKm - b.distanceKm;
                });

            setTheaters(mapped);
        } catch (err) {
            const message = err?.response?.data?.message || 'Không thể tải danh sách rạp gần bạn.';
            setError(message);
            setTheaters([]);
        } finally {
            setTheatersLoading(false);
        }
    }, []);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const permission = await Location.getForegroundPermissionsAsync();
                setPermissionStatus(permission.status);

                if (permission.granted) {
                    setLocationLoading(true);
                    const coords = await readCurrentLocation();
                    await fetchNearbyTheaters(coords, DEFAULT_RADIUS);
                }
            } catch {
                setError('Không thể kiểm tra trạng thái vị trí. Vui lòng thử lại.');
            } finally {
                setLocationLoading(false);
            }
        };

        bootstrap();
    }, [fetchNearbyTheaters, readCurrentLocation]);

    const onSearch = useCallback(async () => {
        const normalizedRadius = Math.max(1, Math.min(200, Number(radiusInput) || radius));
        setRadius(normalizedRadius);
        setRadiusInput(String(normalizedRadius));

        let coords = userLocation;
        if (!coords) {
            coords = await requestPermissionAndLocation();
        }

        if (coords) {
            fetchNearbyTheaters(coords, normalizedRadius);
        }
    }, [fetchNearbyTheaters, radius, radiusInput, requestPermissionAndLocation, userLocation]);

    const onSelectRadius = useCallback(
        (value) => {
            setRadius(value);
            setRadiusInput(String(value));
            if (userLocation) {
                fetchNearbyTheaters(userLocation, value);
            }
        },
        [fetchNearbyTheaters, userLocation],
    );

    const summaryText = useMemo(() => {
        if (theatersLoading) return 'Đang tìm rạp gần bạn...';
        if (!userLocation) return 'Hãy cấp quyền vị trí để tìm rạp gần nhất';
        return `Tìm thấy ${theaters.length} rạp trong bán kính ${radius} km`;
    }, [radius, theaters.length, theatersLoading, userLocation]);

    const renderTheater = ({ item, index }) => {
        const isPrimary = index === 0;
        return (
            <View
                className="mb-4 overflow-hidden rounded-3xl border"
                style={{
                    borderColor: isPrimary ? '#FF7A00' : 'rgba(255,255,255,0.12)',
                    backgroundColor: '#05070B',
                }}
            >
                <View className="flex-row px-3 pb-4 pt-4">
                    <Image
                        source={{ uri: item.imageUrl }}
                        contentFit="cover"
                        style={{ width: 98, height: 96, borderRadius: 14 }}
                    />

                    <View className="ml-3 flex-1">
                        <Text numberOfLines={2} className="text-2xl font-bold text-white">
                            {item.name}
                        </Text>
                        <Text numberOfLines={2} className="mt-1 text-base leading-6 text-[#A3ACB8]">
                            {item.address}
                        </Text>

                        <View className="mt-2 flex-row items-center">
                            <Ionicons name="star" size={18} color="#F7B500" />
                            <Text className="ml-1 text-[17px] font-semibold text-white">
                                {item.rating}
                            </Text>

                            <Ionicons
                                name="location-outline"
                                size={17}
                                color="#FF7A00"
                                style={{ marginLeft: 16 }}
                            />
                            {!!item.distanceLabel && (
                                <Text className="ml-1 text-[17px] font-semibold text-[#FF9A2C]">
                                    {item.distanceLabel}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                <View className="border-t border-white/10 px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={18} color="#757D89" />
                            <Text className="ml-2 text-base text-white">08:00 - 23:30</Text>
                        </View>

                        <View className="flex-row items-center">
                            <Ionicons name="call-outline" size={18} color="#757D89" />
                            <Text className="ml-2 text-base text-white">{item.phone}</Text>
                        </View>
                    </View>

                    <Text className="mt-2 text-base text-[#8B95A2]">
                        {item.screenCount || 6} phòng chiếu
                    </Text>

                    <View className="mt-2 flex-row flex-wrap">
                        {item.formats.slice(0, 4).map((format) => (
                            <View
                                key={`${item.id}-${format}`}
                                className="mr-2 rounded-full border px-3 py-1"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.18)',
                                    backgroundColor: '#1B1E24',
                                }}
                            >
                                <Text className="text-sm text-[#E2E6ED]">{format}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        className="mt-4 items-center rounded-2xl py-3"
                        style={{ backgroundColor: '#FF7A00' }}
                        onPress={() =>
                            navigation.navigate('TheaterShowtimes', { theater: item.raw })
                        }
                        activeOpacity={0.85}
                    >
                        <Text className="text-lg font-bold text-white">Xem lịch chiếu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <FlatList
                data={theaters}
                keyExtractor={(item) => item.id}
                renderItem={renderTheater}
                ListHeaderComponent={
                    <View className="px-4 pb-2 pt-8">
                        <Text className="text-[38px] font-black text-white">Tìm rạp</Text>
                        <Text className="mt-1 text-lg text-[#A6AFBB]">
                            Nhập bán kính để tìm rạp gần bạn nhất
                        </Text>

                        {permissionStatus !== 'granted' && (
                            <View
                                className="mt-4 rounded-2xl border px-4 py-4"
                                style={{
                                    borderColor: 'rgba(255,122,0,0.45)',
                                    backgroundColor: 'rgba(255,122,0,0.12)',
                                }}
                            >
                                <Text className="text-base font-bold text-[#FFD0A2]">
                                    Ứng dụng cần quyền vị trí
                                </Text>
                                <Text className="mt-1 text-sm leading-5 text-[#FFC58D]">
                                    Bật chia sẻ vị trí để hiển thị rạp gần nhất. Bạn có thể thay đổi
                                    quyền này ở trang Cài đặt hệ thống.
                                </Text>
                                <View className="mt-3 flex-row">
                                    <TouchableOpacity
                                        onPress={requestPermissionAndLocation}
                                        className="mr-2 rounded-xl px-4 py-2"
                                        style={{ backgroundColor: '#FF7A00' }}
                                        activeOpacity={0.85}
                                    >
                                        <Text className="font-semibold text-white">
                                            Cho phép vị trí
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => Linking.openSettings()}
                                        className="rounded-xl border px-4 py-2"
                                        style={{ borderColor: 'rgba(255,255,255,0.35)' }}
                                        activeOpacity={0.85}
                                    >
                                        <Text className="font-semibold text-white">Mở Cài đặt</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View className="mt-5 flex-row items-center">
                            <View
                                className="h-14 flex-1 flex-row items-center rounded-2xl border px-4"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    backgroundColor: '#111318',
                                }}
                            >
                                <Ionicons name="navigate-outline" size={20} color="#FF7A00" />
                                <TextInput
                                    value={radiusInput}
                                    onChangeText={setRadiusInput}
                                    keyboardType="numeric"
                                    placeholder="10"
                                    placeholderTextColor="#7D8692"
                                    className="ml-3 flex-1 text-2xl font-semibold text-white"
                                />
                                <Text className="text-xl text-[#8E96A1]">km</Text>
                            </View>

                            <TouchableOpacity
                                onPress={onSearch}
                                activeOpacity={0.85}
                                className="ml-3 h-14 w-14 items-center justify-center rounded-2xl"
                                style={{ backgroundColor: '#FF7A00' }}
                            >
                                {locationLoading || theatersLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Ionicons name="search" size={22} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className="mt-4 flex-row flex-wrap">
                            {RADIUS_OPTIONS.map((value) => {
                                const active = radius === value;
                                return (
                                    <TouchableOpacity
                                        key={value}
                                        className="mr-2 mt-2 rounded-full border px-6 py-2"
                                        style={{
                                            borderColor: active
                                                ? '#FF7A00'
                                                : 'rgba(255,255,255,0.25)',
                                            backgroundColor: active
                                                ? 'rgba(255,122,0,0.2)'
                                                : '#12151B',
                                        }}
                                        onPress={() => onSelectRadius(value)}
                                        activeOpacity={0.85}
                                    >
                                        <Text
                                            className="text-lg font-semibold"
                                            style={{ color: active ? '#FFAF5A' : '#A6B0BC' }}
                                        >
                                            {value} km
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text className="mt-5 text-lg text-[#C8CED8]">{summaryText}</Text>

                        {!!error && <Text className="mt-2 text-sm text-red-400">{error}</Text>}
                    </View>
                }
                ListEmptyComponent={
                    !theatersLoading &&
                    userLocation && (
                        <View className="px-4 pt-8">
                            <Text className="text-center text-base text-[#9CA3AF]">
                                Chưa có rạp trong phạm vi tìm kiếm. Hãy tăng bán kính và thử lại.
                            </Text>
                        </View>
                    )
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 18, paddingHorizontal: 12 }}
            />
        </SafeAreaView>
    );
};

export default TheaterScreen;
