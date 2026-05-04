import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MarketingScreen({ navigation }: any) {
  const features = [
    { title: "SEO Settings", desc: "Optimize for search engines", icon: "🔍", onPress: () => navigation.navigate("SEO") },
    { title: "Discounts", desc: "Create coupon codes", icon: "🏷️", onPress: () => navigation.navigate("Discounts") },
    { title: "Email Campaigns", desc: "Coming soon", icon: "📧", onPress: () => {} },
    { title: "Social Media", desc: "Coming soon", icon: "📱", onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Marketing</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {features.map((f) => (
          <TouchableOpacity key={f.title} style={styles.card} onPress={f.onPress}>
            <Text style={styles.icon}>{f.icon}</Text>
            <View style={styles.info}>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardDesc}>{f.desc}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  back: { fontSize: 20, color: "#006A4E" },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 16, elevation: 1 },
  icon: { fontSize: 24, marginRight: 12 },
  info: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  cardDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  arrow: { fontSize: 22, color: "#9ca3af" },
});
