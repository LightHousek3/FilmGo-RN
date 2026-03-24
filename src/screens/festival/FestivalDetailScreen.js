import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import festivalApi from "../../api/festivalApi";

const formatDateRange = (startTime, endTime) => {
  if (!startTime || !endTime) return "";
  const start = new Date(startTime).toLocaleDateString("vi-VN");
  const end = new Date(endTime).toLocaleDateString("vi-VN");
  return `${start} - ${end}`;
};

const FestivalDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { festivalId } = route.params || {};

  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFestivalDetail = async () => {
    try {
      setLoading(true);
      const response = await festivalApi.getFestivalById(festivalId);
      console.log("festival detail response:", response?.data);
      setFestival(response?.data?.data || null);
    } catch (error) {
      console.log("Fetch festival detail error:", error?.response?.data || error.message);
      setFestival(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (festivalId) {
      fetchFestivalDetail();
    }
  }, [festivalId]);

  

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Đang tải chi tiết sự kiện...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!festival) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>Không tìm thấy sự kiện</Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageSource = festival.imageUrl || festival.image || null;
  const dateRange = formatDateRange(festival.startTime, festival.endTime);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrapper}>
          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              style={styles.heroImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="image-outline" size={44} color="#9CA3AF" />
            </View>
          )}

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>SỰ KIỆN</Text>

          {!!festival.title && <Text style={styles.title}>{festival.title}</Text>}

          {!!dateRange && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#D1D5DB" />
              <Text style={styles.metaText}>{dateRange}</Text>
            </View>
          )}

          {!!festival.content && (
            <Text style={styles.paragraph}>{festival.content}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  heroWrapper: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 520,
  },
  heroPlaceholder: {
    width: "100%",
    height: 520,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 54,
    left: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  label: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 1,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 32,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  metaText: {
    color: "#D1D5DB",
    fontSize: 14,
  },
  paragraph: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 30,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#C4C4C4",
    marginTop: 10,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default FestivalDetailScreen;