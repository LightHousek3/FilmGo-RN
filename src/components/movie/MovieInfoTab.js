import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

const MovieInfoTab = ({ movie }) => {
    return (
        <View style={styles.container}>
            {/* Storyline */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nội Dung Phim</Text>
                <Text style={styles.bodyText}>
                    {movie?.description || 'Chưa có thông tin nội dung.'}
                </Text>
            </View>

            {/* Khởi Chiếu */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Khởi Chiếu</Text>
                <Text style={styles.bodyText}>
                    {movie?.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                </Text>
            </View>

            {/* Xuất Xứ */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Xuất Xứ</Text>
                <Text style={styles.bodyText}>
                    {movie?.origin || 'Đang cập nhật'}
                </Text>
            </View>

            {/* Director */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đạo Diễn</Text>
                <Text style={styles.bodyText}>
                    {movie?.author || 'Đang cập nhật'}
                </Text>
            </View>

            {/* Cast (placeholder) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Diễn Viên</Text>
                <Text style={styles.bodyText}>
                    {movie?.actors?.join(', ') || 'Đang cập nhật'}
                </Text>
            </View>
            
            <View style={{ height: 40 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    bodyText: {
        fontSize: 14,
        color: COLORS.gray[300],
        lineHeight: 22,
    }
});

export default MovieInfoTab;
