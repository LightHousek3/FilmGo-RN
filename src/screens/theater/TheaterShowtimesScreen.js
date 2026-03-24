import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { showtimeApi } from '../../api';
import COLORS from '../../constants/colors';

const POSTER_PLACEHOLDER =
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&w=340';

const buildDateOptions = () => {
    const options = [];
    for (let i = 0; i < 7; i += 1) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        options.push(date);
    }
    return options;
};

const toDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const toDisplayDate = (date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}`;
};

const weekdayLabel = (date, index) => {
    if (index === 0) return 'Hôm nay';
    const day = date.getDay();
    if (day === 0) return 'Chủ nhật';
    return `Thứ ${day + 1}`;
};

const formatDuration = (value) => {
    const duration = Number(value || 0);
    if (!duration) return '-- Phút';
    return `${duration} Phút`;
};

const formatDateVi = (value) => {
    if (!value) return '--/--/----';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--/--/----';
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const toTimeLabel = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--:--';
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

const isSameDate = (first, second) => {
    return (
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate()
    );
};

const extractList = (payload) => {
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data?.results)) return payload.data.results;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const mapShowtimesByMovie = (showtimes, selectedDate) => {
    const grouped = new Map();

    showtimes.forEach((showtime, index) => {
        const startDate = new Date(showtime.startTime);
        if (Number.isNaN(startDate.getTime()) || !isSameDate(startDate, selectedDate)) {
            return;
        }

        const movie = showtime.movie || {};
        const movieId =
            movie._id ||
            movie.id ||
            (typeof showtime.movie === 'string' ? showtime.movie : `movie-${index}`);

        if (!grouped.has(movieId)) {
            grouped.set(movieId, {
                key: movieId,
                movie,
                ageRating: movie.ageRating || 'T13',
                duration: movie.duration,
                releaseDate: movie.releaseDate,
                rating: Number(movie.rating || movie.voteAverage || 8.0).toFixed(1),
                languageTag: showtime.language || '2D PHỤ ĐỀ',
                showtimes: [],
            });
        }

        grouped.get(movieId).showtimes.push({
            id: showtime._id || showtime.id || `showtime-${index}`,
            label: toTimeLabel(showtime.startTime),
            rawDate: startDate,
        });
    });

    return Array.from(grouped.values())
        .map((item) => ({
            ...item,
            showtimes: item.showtimes.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime()),
        }))
        .sort((a, b) => {
            const firstA = a.showtimes[0]?.rawDate?.getTime() || 0;
            const firstB = b.showtimes[0]?.rawDate?.getTime() || 0;
            return firstA - firstB;
        });
};

const TheaterShowtimesScreen = ({ navigation, route }) => {
    const theater = route.params?.theater || {};
    const dateOptions = useMemo(() => buildDateOptions(), []);
    const [selectedDate, setSelectedDate] = useState(dateOptions[0]);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchShowtimes = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await showtimeApi.getShowtimes({
                theaterId: theater._id || theater.id,
                date: toDateKey(selectedDate),
                limit: 200,
            });

            setShowtimes(extractList(response));
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể tải suất chiếu. Vui lòng thử lại.');
            setShowtimes([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, theater._id, theater.id]);

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    const groupedByMovie = useMemo(
        () => mapShowtimesByMovie(showtimes, selectedDate),
        [showtimes, selectedDate],
    );

    return (
        <SafeAreaView className="flex-1 bg-[#F5F6F8]">
            <View className="border-b border-black/10 bg-white px-4 pb-3 pt-2">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="h-10 w-10 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={28} color="#1E5AA8" />
                    </TouchableOpacity>
                    <Text
                        numberOfLines={1}
                        className="mx-2 flex-1 text-center text-[23px] font-black text-[#23262F]"
                    >
                        {theater.name || 'Rạp chiếu phim'}
                    </Text>
                    <View className="h-10 w-10 items-center justify-center">
                        <Ionicons name="navigate-outline" size={30} color="#1E5AA8" />
                    </View>
                </View>

                <View className="mt-2 flex-row items-start px-1">
                    <Ionicons
                        name="location-outline"
                        size={20}
                        color="#4C87C6"
                        style={{ marginTop: 1 }}
                    />
                    <Text className="ml-2 flex-1 text-[15px] leading-6 text-[#676E77]">
                        {theater.address || 'Địa chỉ đang được cập nhật'}
                    </Text>
                </View>
            </View>

            <View className="border-b border-black/10 bg-white py-3">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 12 }}
                >
                    {dateOptions.map((date, index) => {
                        const active = isSameDate(date, selectedDate);
                        return (
                            <TouchableOpacity
                                key={toDateKey(date)}
                                onPress={() => setSelectedDate(date)}
                                activeOpacity={0.85}
                                className="mr-2 min-w-[94px] rounded-xl border px-2 py-2"
                                style={{
                                    borderColor: active ? '#1E5AA8' : '#D9DEE7',
                                    backgroundColor: active ? '#1E5AA8' : '#FFFFFF',
                                }}
                            >
                                <Text
                                    className="text-center text-[15px] font-semibold"
                                    style={{ color: active ? '#FFFFFF' : '#3A414D' }}
                                >
                                    {weekdayLabel(date, index)}
                                </Text>
                                <Text
                                    className="mt-1 text-center text-[17px] font-black"
                                    style={{ color: active ? '#FFFFFF' : '#111827' }}
                                >
                                    {toDisplayDate(date)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
                {loading ? (
                    <View className="items-center justify-center py-16">
                        <ActivityIndicator size="large" color={COLORS.secondary} />
                        <Text className="mt-3 text-sm text-gray-500">Đang tải suất chiếu...</Text>
                    </View>
                ) : error ? (
                    <View className="px-4 py-10">
                        <Text className="text-center text-sm text-red-500">{error}</Text>
                        <TouchableOpacity
                            onPress={fetchShowtimes}
                            className="mx-auto mt-3 rounded-xl px-4 py-2"
                            style={{ backgroundColor: COLORS.secondary }}
                        >
                            <Text className="font-semibold text-white">Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                ) : groupedByMovie.length === 0 ? (
                    <View className="px-4 py-10">
                        <Text className="text-center text-[15px] text-[#69707C]">
                            Không có suất chiếu cho ngày đã chọn.
                        </Text>
                    </View>
                ) : (
                    groupedByMovie.map((item) => {
                        const posterUrl = item.movie?.image?.url || POSTER_PLACEHOLDER;
                        return (
                            <View
                                key={item.key}
                                className="mt-3 border-t border-b border-black/5 bg-white px-4 py-4"
                            >
                                <View className="flex-row">
                                    <Image
                                        source={{ uri: posterUrl }}
                                        contentFit="cover"
                                        style={{ width: 74, height: 106, borderRadius: 6 }}
                                    />

                                    <View className="ml-4 flex-1">
                                        <Text
                                            className="text-[20px] font-bold uppercase text-[#2D2F35]"
                                            numberOfLines={2}
                                        >
                                            {item.movie?.title || 'Tên phim đang cập nhật'}
                                        </Text>

                                        <View className="mt-2 flex-row items-center">
                                            <View
                                                className="rounded-md px-2 py-1"
                                                style={{ backgroundColor: '#F7941D' }}
                                            >
                                                <Text className="text-[15px] font-bold text-white">
                                                    {item.ageRating}
                                                </Text>
                                            </View>

                                            <View className="ml-3 flex-row items-center">
                                                <Ionicons
                                                    name="time-outline"
                                                    size={20}
                                                    color="#F7941D"
                                                />
                                                <Text className="ml-1 text-[16px] text-[#3E434B]">
                                                    {formatDuration(item.duration)}
                                                </Text>
                                            </View>

                                            <View className="ml-3 flex-row items-center">
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={20}
                                                    color="#F7941D"
                                                />
                                                <Text className="ml-1 text-[16px] text-[#3E434B]">
                                                    {formatDateVi(item.releaseDate)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="mt-2 flex-row items-center">
                                            <Ionicons name="star" size={20} color="#F7B500" />
                                            <Text className="ml-1 text-[18px] font-semibold text-[#2D2F35]">
                                                {item.rating}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <Text className="mt-3 text-[18px] font-medium uppercase text-[#30343B]">
                                    VIP - {item.languageTag}
                                </Text>

                                <View className="mt-3 flex-row flex-wrap gap-2">
                                    {item.showtimes.map((showtime) => (
                                        <TouchableOpacity
                                            key={showtime.id}
                                            activeOpacity={0.8}
                                            onPress={() => navigation.navigate("SeatSelection", { showtimeId: showtime.id })}
                                            className="rounded-xl border border-[#D7DCE5] px-7 py-3"
                                            style={{ minWidth: 108 }}
                                        >
                                            <Text className="text-center text-[17px] font-medium text-[#757B86]">
                                                {showtime.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default TheaterShowtimesScreen;
