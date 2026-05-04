import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const links = [
    { label: "Store Settings", icon: "⚙️", onPress: () => {} },
    { label: "Payment Methods", icon: "💳", onPress: () => {} },
    { label: "Delivery Settings", icon: "🚚", onPress: () => {} },
    { label: "Notification Settings", icon: "🔔", onPress: () => {} },
    { label: "Language: English", icon: "🌐", onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || "M"}</Text>
          </View>
          <Text style={styles.name}>{user?.name || "Merchant"}</Text>
          <Text style={styles.email}>{user?.email || ""}</Text>
        </View>
        {links.map((link) => (
          <TouchableOpacity key={link.label} style={styles.linkCard} onPress={link.onPress}>
            <Text style={styles.linkIcon}>{link.icon}</Text>
            <Text style={styles.linkLabel}>{link.label}</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  back: { fontSize: 20, color: "#006A4E" },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  profileCard: { alignItems: "center", backgroundColor: "#fff", borderRadius: 20, padding: 24, elevation: 1 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  name: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  email: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  linkCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 16, elevation: 1 },
  linkIcon: { fontSize: 20, marginRight: 12 },
  linkLabel: { flex: 1, fontSize: 15, color: "#374151", fontWeight: "500" },
  linkArrow: { fontSize: 22, color: "#9ca3af" },
  logoutBtn: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#ef4444", justifyContent: "center", alignItems: "center", marginTop: 8 },
  logoutText: { color: "#ef4444", fontSize: 15, fontWeight: "600" },
});
