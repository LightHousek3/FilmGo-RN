import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import COLORS from '../../constants/colors';
import { showtimeApi } from '../../api';

const getNext7Days = () => {
    const days = [];
    const date = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(date);
        d.setDate(d.getDate() + i);

        // Format YYYY-MM-DD gracefully utilizing LOCAL timezone offset
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const fullDate = `${yyyy}-${mm}-${dd}`;

        days.push({
            id: i.toString(),
            dayOfWeek: i === 0 ? 'Hôm nay' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()],
            dateNumber: d.getDate(),
            fullDate
        });
    }
    return days;
};

const DATES = getNext7Days();

const MovieShowtimesTab = ({ movie }) => {
    const [selectedDate, setSelectedDate] = useState(DATES[0].fullDate);
    const [theaterGroups, setTheaterGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchShowtimes = useCallback(async () => {
        const movieId = movie?.id || movie?._id;
        if (!movieId) return;
        
        setLoading(true);
        try {
            const res = await showtimeApi.getShowtimes({
                movie: movieId,
                date: selectedDate,
                populate: "screen.theater",
                limit: 100 // fetch as many as possible for the day
            });
            
            const showtimes = res.data?.data || [];
            
            // Group showtimes by theater
            const theaterMap = new Map();

            showtimes.forEach(st => {
                const theater = st.screen?.theater;
                if (!theater) return;

                if (!theaterMap.has(theater._id && theater.id ? theater.id : (theater._id || theater.id))) {
                    const tId = theater.id || theater._id;
                    theaterMap.set(tId, {
                        id: tId,
                        name: theater.name,
                        address: theater.address || theater.location, // fallback if address is missing
                        showtimes: []
                    });
                }

                // Format to local time natively, aligning perfectly with Backend bounds (UTC+7 shift)
                const dateObj = new Date(st.startTime);
                const h = String(dateObj.getHours()).padStart(2, '0');
                const m = String(dateObj.getMinutes()).padStart(2, '0');
                const timeString = `${h}:${m}`;
                
                const tId = theater.id || theater._id;
                theaterMap.get(tId).showtimes.push({
                    id: st.id || st._id,
                    time: timeString,
                    rawDate: dateObj,
                    status: st.status
                });
            });

            // Sort showtimes chronologically within each theater
            const groupedArray = Array.from(theaterMap.values());
            groupedArray.forEach(group => {
                group.showtimes.sort((a, b) => a.rawDate - b.rawDate);
            });

            setTheaterGroups(groupedArray);
        } catch (error) {
            console.error("Failed to fetch showtimes", error);
            setTheaterGroups([]);
        } finally {
            setLoading(false);
        }
    }, [movie, selectedDate]);

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    const renderDate = ({ item }) => {
        const isSelected = item.fullDate === selectedDate;
        return (
            <TouchableOpacity 
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => setSelectedDate(item.fullDate)}
                activeOpacity={0.7}
            >
                <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>{item.dayOfWeek}</Text>
                <Text style={[styles.dateNum, isSelected && styles.dateTextActive]}>{item.dateNumber}</Text>
            </TouchableOpacity>
        );
    };

    const renderTheater = ({ item }) => (
        <View style={styles.theaterCard}>
            <Text style={styles.theaterName}>{item.name}</Text>
            <Text style={styles.theaterAddress}>{item.address}</Text>
            
            <View style={styles.showtimesContainer}>
                {item.showtimes.map(st => {
                    const isEnded = st.status === 'ENDED';
                    return (
                        <TouchableOpacity 
                            key={st.id} 
                            style={[styles.timeButton, isEnded && styles.timeButtonEnded]} 
                            disabled={isEnded}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.timeText, isEnded && styles.timeTextEnded]}>{st.time}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderEmptyState = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có lịch chiếu cho ngày này.</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Date Picker */}
            <View style={styles.datePickerContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={DATES}
                    keyExtractor={item => item.id}
                    renderItem={renderDate}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                />
            </View>

            {/* Theaters List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                </View>
            ) : theaterGroups.length === 0 ? (
                renderEmptyState()
            ) : (
                <View style={styles.theaterListContainer}>
                    {theaterGroups.map((item, index) => (
                        <React.Fragment key={item.id}>
                            {renderTheater({ item })}
                        </React.Fragment>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    datePickerContainer: {
        paddingTop: 16,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    dateCard: {
        width: 60,
        height: 70,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateCardActive: {
        backgroundColor: COLORS.secondary,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dateDay: {
        fontSize: 12,
        color: COLORS.gray[400],
        marginBottom: 4,
        fontWeight: '600',
    },
    dateNum: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    dateTextActive: {
        color: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        color: COLORS.gray[400],
        fontSize: 15,
    },
    theaterCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    theaterName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 6,
    },
    theaterAddress: {
        fontSize: 13,
        color: COLORS.gray[400],
        marginBottom: 16,
    },
    theaterListContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    showtimesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    timeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.gray[700],
    },
    timeButtonEnded: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'transparent',
    },
    timeText: {
        color: COLORS.gray[200],
        fontSize: 14,
        fontWeight: '600',
    },
    timeTextEnded: {
        color: COLORS.gray[600],
        textDecorationLine: 'line-through'
    }
});

export default MovieShowtimesTab;
