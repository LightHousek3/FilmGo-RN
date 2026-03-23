import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import COLORS from '../../constants/colors';
import MovieInfoTab from '../../components/movie/MovieInfoTab';
import MovieShowtimesTab from '../../components/movie/MovieShowtimesTab';
import movieApi from '../../api/movieApi';



const formatTime = (millis) => {
    if (!millis || millis < 0) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const MovieDetailScreen = ({ route, navigation }) => {
    const [movie, setMovie] = useState(route.params?.movie || {});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('SHOWTIMES');
    const [showTrailer, setShowTrailer] = useState(false);
    const insets = useSafeAreaInsets();
    const videoRef = useRef(null);

    // Custom controls state
    const [isPlaying, setIsPlaying] = useState(false);
    const [positionMillis, setPositionMillis] = useState(0);
    const [durationMillis, setDurationMillis] = useState(0);
    const [didFinish, setDidFinish] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [screenDims, setScreenDims] = useState(Dimensions.get('window'));
    const hideControlsTimer = useRef(null);

    // Listen for orientation changes
    useEffect(() => {
        const sub = Dimensions.addEventListener('change', ({ window }) => {
            setScreenDims(window);
        });
        return () => sub?.remove();
    }, []);

    useEffect(() => {
        const fetchFullMovie = async () => {
            const movieId = movie.id || movie._id;
            if (!movieId) return;
            try {
                setLoading(true);
                const res = await movieApi.getMovieById(movieId, { populate: 'genres' });
                if (res.data?.data) {
                    setMovie(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch full movie details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFullMovie();
    }, []);

    const imageUrl = movie.image?.url || movie.imageUrl || 'https://via.placeholder.com/600x900';
    const trailerUrl = movie.trailer?.url;

    // Auto-hide controls after 3s
    const resetHideTimer = useCallback(() => {
        if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
        setShowControls(true);
        hideControlsTimer.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }, [isPlaying]);

    const handlePlayTrailer = () => {
        if (trailerUrl) {
            setShowTrailer(true);
            setIsPlaying(true);
            setPositionMillis(0);
            setShowControls(true);
            resetHideTimer();
        }
    };

    const handleCloseTrailer = async () => {
        if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
        if (videoRef.current) {
            await videoRef.current.stopAsync();
        }
        setShowTrailer(false);
        setIsPlaying(false);
        setPositionMillis(0);
    };

    const togglePlayPause = async () => {
        if (!videoRef.current) return;
        if (didFinish) {
            await videoRef.current.setPositionAsync(0);
            await videoRef.current.playAsync();
            setDidFinish(false);
        } else if (isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
        resetHideTimer();
    };

    const skipForward = async () => {
        if (!videoRef.current) return;
        const newPos = Math.min(positionMillis + 10000, durationMillis);
        await videoRef.current.setPositionAsync(newPos);
        resetHideTimer();
    };

    const skipBackward = async () => {
        if (!videoRef.current) return;
        const newPos = Math.max(positionMillis - 10000, 0);
        await videoRef.current.setPositionAsync(newPos);
        resetHideTimer();
    };

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setPositionMillis(status.positionMillis || 0);
            setDurationMillis(status.durationMillis || 0);
            if (status.didJustFinish) {
                setDidFinish(true);
                setShowControls(true);
                if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
            }
        }
    };

    const handleSeek = async (evt) => {
        if (!videoRef.current || !durationMillis) return;
        const { locationX } = evt.nativeEvent;
        const barWidth = screenDims.width - 32; // paddingHorizontal: 16 * 2
        const ratio = Math.max(0, Math.min(locationX / barWidth, 1));
        const newPos = ratio * durationMillis;
        await videoRef.current.setPositionAsync(newPos);
        resetHideTimer();
    };

    const toggleControls = () => {
        setShowControls(prev => !prev);
        if (!showControls) resetHideTimer();
    };

    const isLandscape = screenDims.width > screenDims.height;
    const videoStyle = isLandscape
        ? { width: screenDims.width, height: screenDims.height }
        : { width: screenDims.width, height: screenDims.width * (9 / 16) };

    const progress = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Header Image Section */}
                <View style={styles.headerContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.backdropImage} blurRadius={4} />
                    <LinearGradient
                        colors={['transparent', 'rgba(26, 26, 46, 0.8)', COLORS.primary]}
                        style={styles.gradientOverlay}
                    />
                    
                    {/* Top Bar */}
                    <View style={[styles.topBar, { marginTop: insets.top + 10 }]}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={28} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButton}>
                            <Ionicons name="share-social-outline" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Play Trailer Button */}
                    {trailerUrl && (
                        <TouchableOpacity style={styles.playTrailerButton} onPress={handlePlayTrailer} activeOpacity={0.8}>
                            <View style={styles.playIconCircle}>
                                <Ionicons name="play" size={32} color={COLORS.white} style={{ marginLeft: 3 }} />
                            </View>
                            <Text style={styles.playTrailerText}>Xem Trailer</Text>
                        </TouchableOpacity>
                    )}

                    {/* Movie Info Overlay */}
                    <View style={styles.movieInfoOverlay}>
                        <Image source={{ uri: imageUrl }} style={styles.posterImage} />
                        <View style={styles.movieDetails}>
                            <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                            <View style={styles.metaRow}>
                                {movie.ageRating && (
                                    <View style={styles.ageBadge}>
                                        <Text style={styles.ageText}>{movie.ageRating}</Text>
                                    </View>
                                )}
                                <Text style={styles.metaText}>{movie.duration || 120} Phút</Text>
                            </View>
                            <View style={styles.genresRow}>
                                {(movie.genres || []).map((g, idx) => {
                                    const genreName = typeof g === 'object' ? g.name : g;
                                    if (!genreName || /^[a-f\d]{24}$/i.test(genreName)) return null;
                                    return (
                                        <View key={idx} style={styles.genreBadge}>
                                            <Text style={styles.genreText}>{genreName}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'SHOWTIMES' && styles.tabButtonActive]}
                        onPress={() => setActiveTab('SHOWTIMES')} activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'SHOWTIMES' && styles.tabTextActive]}>LỊCH CHIẾU</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'INFO' && styles.tabButtonActive]}
                        onPress={() => setActiveTab('INFO')} activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'INFO' && styles.tabTextActive]}>THÔNG TIN</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tabContentContainer}>
                    {activeTab === 'INFO' ? <MovieInfoTab movie={movie} /> : <MovieShowtimesTab movie={movie} />}
                </View>
            </ScrollView>

            {/* ========== TRAILER MODAL ========== */}
            <Modal
                visible={showTrailer}
                animationType="slide"
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={handleCloseTrailer}
            >
                <View style={styles.trailerModal}>
                    <StatusBar hidden={showTrailer} />

                    {/* Video */}
                    <TouchableOpacity 
                        style={styles.trailerVideoWrapper} 
                        activeOpacity={1} 
                        onPress={toggleControls}
                    >
                        <Video
                            ref={videoRef}
                            source={{ uri: trailerUrl }}
                            style={videoStyle}
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay={showTrailer}
                            isLooping={false}
                            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                        />
                    </TouchableOpacity>

                    {/* Custom Controls Overlay */}
                    {showControls && (
                        <>
                            {/* Top: back + title */}
                            <LinearGradient
                                colors={['rgba(0,0,0,0.7)', 'transparent']}
                                style={[styles.ctrlTopBar, { paddingTop: insets.top + 8 }]}
                                pointerEvents="box-none"
                            >
                                <TouchableOpacity onPress={handleCloseTrailer} style={styles.ctrlBackBtn}>
                                    <Ionicons name="chevron-back" size={26} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.ctrlTopTitle} numberOfLines={1}>{movie.title}</Text>
                                <View style={{ width: 40 }} />
                            </LinearGradient>

                            {/* Center: skip back / play-pause / skip forward */}
                            <View style={styles.ctrlCenter} pointerEvents="box-none">
                                <TouchableOpacity onPress={skipBackward} style={styles.ctrlSkipBtn}>
                                    <Ionicons name="play-back" size={28} color="#fff" />
                                    <Text style={styles.ctrlSkipLabel}>10s</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={togglePlayPause} style={styles.ctrlPlayBtn}>
                                    <Ionicons 
                                        name={didFinish ? 'refresh' : (isPlaying ? 'pause' : 'play')} 
                                        size={40} 
                                        color="#fff" 
                                        style={!isPlaying && !didFinish ? { marginLeft: 4 } : {}} 
                                    />
                                </TouchableOpacity>


                                <TouchableOpacity onPress={skipForward} style={styles.ctrlSkipBtn}>
                                    <Ionicons name="play-forward" size={28} color="#fff" />
                                    <Text style={styles.ctrlSkipLabel}>10s</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Bottom: seek bar + time + movie info */}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.85)']}
                                style={[styles.ctrlBottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}
                                pointerEvents="box-none"
                            >
                                {/* Seek bar */}
                                <View style={styles.ctrlSeekRow}>
                                    <Text style={styles.ctrlTime}>{formatTime(positionMillis)}</Text>
                                    <TouchableOpacity 
                                        style={styles.ctrlSeekBarOuter} 
                                        activeOpacity={1} 
                                        onPress={handleSeek}
                                    >
                                        <View style={styles.ctrlSeekBarBg}>
                                            <View style={[styles.ctrlSeekBarFill, { width: `${progress}%` }]} />
                                            <View style={[styles.ctrlSeekThumb, { left: `${progress}%` }]} />
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={styles.ctrlTime}>{formatTime(durationMillis)}</Text>
                                </View>

                                {/* Movie info mini bar */}
                                <View style={styles.ctrlMovieInfo}>
                                    <Image source={{ uri: imageUrl }} style={styles.ctrlPoster} />
                                    <View style={styles.ctrlMovieMeta}>
                                        <Text style={styles.ctrlMovieTitle} numberOfLines={1}>{movie.title}</Text>
                                        <View style={styles.ctrlMovieMetaRow}>
                                            {movie.ageRating && (
                                                <View style={styles.ctrlAgeBadge}>
                                                    <Text style={styles.ctrlAgeText}>{movie.ageRating}</Text>
                                                </View>
                                            )}
                                            <Text style={styles.ctrlDuration}>{movie.duration || 120} Phút</Text>
                                            {movie.type && <Text style={styles.ctrlType}>• {movie.type}</Text>}
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.primary },
    headerContainer: { height: 380, position: 'relative' },
    backdropImage: { width: '100%', height: '100%', position: 'absolute' },
    gradientOverlay: { ...StyleSheet.absoluteFillObject },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, zIndex: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    shareButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    playTrailerButton: { position: 'absolute', top: '35%', alignSelf: 'center', alignItems: 'center', zIndex: 10 },
    playIconCircle: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: 'rgba(255, 107, 107, 0.85)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
        shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10
    },
    playTrailerText: { color: COLORS.white, fontSize: 13, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
    movieInfoOverlay: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', alignItems: 'flex-end' },
    posterImage: { width: 120, height: 180, borderRadius: 12, borderWidth: 2, borderColor: COLORS.surfaceLight },
    movieDetails: { flex: 1, marginLeft: 16, paddingBottom: 8 },
    movieTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
    ageBadge: { backgroundColor: COLORS.warning, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    ageText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
    metaText: { color: COLORS.gray[300], fontSize: 14 },
    genresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    genreBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    genreText: { color: COLORS.white, fontSize: 12 },
    tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.surfaceLight },
    tabButton: { flex: 1, paddingVertical: 16, alignItems: 'center' },
    tabButtonActive: { borderBottomWidth: 3, borderBottomColor: COLORS.secondary },
    tabText: { fontSize: 15, fontWeight: '600', color: COLORS.gray[400] },
    tabTextActive: { color: COLORS.secondary },
    tabContentContainer: { minHeight: 400 },

    // ========= TRAILER MODAL =========
    trailerModal: { flex: 1, backgroundColor: '#000' },
    trailerVideoWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Controls: Top
    ctrlTopBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12, paddingBottom: 20, zIndex: 30
    },
    ctrlBackBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center'
    },
    ctrlTopTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center', marginHorizontal: 8 },

    // Controls: Center
    ctrlCenter: {
        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 48, zIndex: 25
    },
    ctrlPlayBtn: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: 'rgba(255, 107, 107, 0.9)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10
    },
    ctrlSkipBtn: { alignItems: 'center', justifyContent: 'center' },
    ctrlSkipLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },

    // Controls: Bottom
    ctrlBottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 16, paddingTop: 30, zIndex: 30
    },
    ctrlSeekRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    ctrlTime: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontVariant: ['tabular-nums'], minWidth: 36, textAlign: 'center' },
    ctrlSeekBarOuter: { flex: 1, height: 30, justifyContent: 'center' },
    ctrlSeekBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, position: 'relative' },
    ctrlSeekBarFill: { height: 3, backgroundColor: '#FF6B6B', borderRadius: 2 },
    ctrlSeekThumb: {
        position: 'absolute', top: -5, width: 13, height: 13, borderRadius: 7,
        backgroundColor: '#FF6B6B', marginLeft: -6, borderWidth: 2, borderColor: '#fff'
    },

    // Controls: Movie info
    ctrlMovieInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ctrlPoster: { width: 40, height: 58, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    ctrlMovieMeta: { flex: 1, marginLeft: 10 },
    ctrlMovieTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
    ctrlMovieMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ctrlAgeBadge: { backgroundColor: COLORS.warning, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
    ctrlAgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    ctrlDuration: { color: COLORS.gray[300], fontSize: 12 },
    ctrlType: { color: COLORS.gray[400], fontSize: 12 },
});

export default MovieDetailScreen;
