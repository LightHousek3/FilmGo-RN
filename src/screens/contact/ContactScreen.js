import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../constants/colors";

const CONTACT_ITEMS = [
    {
        icon: "call",
        label: "Hotline",
        value: "1900 2224",
        hint: "7:00 – 23:00 mỗi ngày",
        action: () => Linking.openURL("tel:19002224"),
    },
    {
        icon: "mail",
        label: "Email",
        value: "support@filmgo.vn",
        hint: "Phản hồi trong 24 giờ",
        action: () => Linking.openURL("mailto:support@filmgo.vn"),
    },
    {
        icon: "location",
        label: "Trụ sở chính",
        value: "123 Nguyễn Huệ, Q.1, TP.HCM",
        hint: "Thứ 2 – Thứ 6, 8:00 – 17:00",
        action: null,
    },
    {
        icon: "globe",
        label: "Website",
        value: "www.filmgo.vn",
        hint: "Mua vé & tra cứu lịch chiếu",
        action: () => Linking.openURL("https://www.filmgo.vn"),
    },
];

const SOCIAL_ITEMS = [
    { icon: "logo-facebook", label: "Facebook", color: "#1877F2" },
    { icon: "logo-instagram", label: "Instagram", color: "#E1306C" },
    { icon: "logo-youtube", label: "YouTube", color: "#FF0000" },
    { icon: "logo-tiktok", label: "TikTok", color: "#fff" },
];

const FAQ_ITEMS = [
    {
        q: "Làm thế nào để đổi / hoàn vé?",
        a: "Vé có thể đổi / hoàn trước giờ chiếu 2 tiếng. Vui lòng liên hệ hotline hoặc đến quầy vé tại rạp.",
    },
    {
        q: "Ứng dụng có hỗ trợ thanh toán online không?",
        a: "Có. Chúng tôi hỗ trợ VNPay, MoMo, ZaloPay, thẻ tín dụng và thẻ ghi nợ quốc tế.",
    },
    {
        q: "Có chính sách ưu đãi dành cho học sinh / sinh viên không?",
        a: "Có. Xuất trình thẻ học sinh / sinh viên tại quầy để được giảm 30% giá vé mọi ngày trong tuần.",
    },
];

function FaqItem({ item }) {
    const [open, setOpen] = React.useState(false);
    return (
        <TouchableOpacity
            onPress={() => setOpen((v) => !v)}
            activeOpacity={0.8}
            style={styles.faqCard}
        >
            <View style={styles.faqRow}>
                <Text style={styles.faqQ} numberOfLines={open ? undefined : 2}>
                    {item.q}
                </Text>
                <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={COLORS.secondary}
                />
            </View>
            {open && (
                <Text style={styles.faqA}>{item.a}</Text>
            )}
        </TouchableOpacity>
    );
}

const ContactScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Liên Hệ</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero */}
                <View style={styles.heroBanner}>
                    <Ionicons name="headset" size={36} color={COLORS.secondary} />
                    <Text style={styles.heroTitle}>Chúng tôi luôn sẵn sàng hỗ trợ bạn</Text>
                    <Text style={styles.heroSubtitle}>
                        Đội ngũ CSKH 24/7 – Phản hồi nhanh trong mọi tình huống
                    </Text>
                </View>

                {/* Contact cards */}
                <Text style={styles.sectionLabel}>THÔNG TIN LIÊN HỆ</Text>
                {CONTACT_ITEMS.map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        activeOpacity={item.action ? 0.75 : 1}
                        onPress={item.action ?? undefined}
                        style={styles.contactCard}
                    >
                        <View style={styles.contactIconWrap}>
                            <Ionicons
                                name={item.icon}
                                size={22}
                                color={COLORS.secondary}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.contactLabel}>{item.label}</Text>
                            <Text style={styles.contactValue}>{item.value}</Text>
                            <Text style={styles.contactHint}>{item.hint}</Text>
                        </View>
                        {item.action && (
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={COLORS.gray[500]}
                            />
                        )}
                    </TouchableOpacity>
                ))}

                {/* Social links */}
                <Text style={styles.sectionLabel}>MẠNG XÃ HỘI</Text>
                <View style={styles.socialRow}>
                    {SOCIAL_ITEMS.map((s) => (
                        <TouchableOpacity
                            key={s.label}
                            activeOpacity={0.75}
                            style={styles.socialBtn}
                        >
                            <Ionicons name={s.icon} size={24} color={s.color} />
                            <Text style={styles.socialLabel}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQ */}
                <Text style={styles.sectionLabel}>CÂU HỎI THƯỜNG GẶP</Text>
                {FAQ_ITEMS.map((item) => (
                    <FaqItem key={item.q} item={item} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    backBtn: { width: 36 },
    headerTitle: { fontSize: 20, fontWeight: "800", color: COLORS.white },
    scrollContent: { padding: 16, paddingBottom: 32 },
    heroBanner: {
        backgroundColor: COLORS.accent,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: COLORS.white,
        marginTop: 10,
        textAlign: "center",
        lineHeight: 24,
    },
    heroSubtitle: {
        fontSize: 13,
        color: COLORS.gray[300],
        marginTop: 6,
        textAlign: "center",
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.gray[500],
        letterSpacing: 1,
        marginBottom: 10,
        marginTop: 4,
    },
    contactCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        gap: 12,
    },
    contactIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.secondary + "20",
        alignItems: "center",
        justifyContent: "center",
    },
    contactLabel: { fontSize: 12, color: COLORS.gray[500], marginBottom: 2 },
    contactValue: { fontSize: 15, fontWeight: "700", color: COLORS.white },
    contactHint: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
    socialRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    socialBtn: {
        flex: 1,
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        paddingVertical: 14,
        marginHorizontal: 5,
        gap: 6,
    },
    socialLabel: { fontSize: 12, fontWeight: "600", color: COLORS.gray[300] },
    faqCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    faqRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    faqQ: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.white,
        lineHeight: 20,
    },
    faqA: {
        fontSize: 13,
        color: COLORS.gray[400],
        marginTop: 10,
        lineHeight: 18,
    },
});

export default ContactScreen;
