import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { formatBDT, statusColor } from "../../utils/formatters";

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, pendingOrders: 0, revenue: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.stores.list();
      const storeList = res.stores || [];
      setStores(storeList);

      if (storeList.length > 0) {
        let tp = 0, to = 0, po = 0, rev = 0;
        for (const s of storeList) {
          try {
            const pr = await api.products.list(s.id);
            tp += (pr.products || []).length;
            const or = await api.orders.list(s.id);
            const orders = or.orders || [];
            to += orders.length;
            po += orders.filter((o: any) => o.status === "PENDING").length;
            rev += orders.reduce((sum: number, o: any) => sum + (o.status !== "CANCELLED" ? Number(o.total) : 0), 0);
          } catch {}
        }
        setStats({ totalProducts: tp, totalOrders: to, pendingOrders: po, revenue: rev });
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const statCards = [
    { label: "Stores", value: stores.length.toString(), color: "#006A4E" },
    { label: "Products", value: stats.totalProducts.toString(), color: "#3b82f6" },
    { label: "Orders", value: stats.totalOrders.toString(), color: "#f59e0b" },
    { label: "Revenue", value: formatBDT(stats.revenue), color: "#8b5cf6" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name?.split(" ")[0] || "Merchant"}</Text>
          <Text style={styles.subtitle}>{stores.length} store{stores.length !== 1 ? "s" : ""}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#006A4E" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={statCards}
          numColumns={2}
          keyExtractor={(item) => item.label}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 20 }}
          ListHeaderComponent={
            <>
              {/* Pending Orders Alert */}
              {stats.pendingOrders > 0 && (
                <TouchableOpacity style={styles.alert} onPress={() => navigation.navigate("Orders")}>
                  <Text style={styles.alertText}>⚠️ {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? "s" : ""} need attention</Text>
                </TouchableOpacity>
              )}
            </>
          }
          renderItem={({ item }) => (
            <View style={[styles.statCard, { borderLeftColor: item.color }]}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Products")}>
                  <Text style={styles.actionIcon}>📦</Text>
                  <Text style={styles.actionLabel}>Products</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Orders")}>
                  <Text style={styles.actionIcon}>🛒</Text>
                  <Text style={styles.actionLabel}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Analytics")}>
                  <Text style={styles.actionIcon}>📊</Text>
                  <Text style={styles.actionLabel}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("AIAssistant")}>
                  <Text style={styles.actionIcon}>🤖</Text>
                  <Text style={styles.actionLabel}>AI Help</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  logoutBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  logoutText: { color: "#ef4444", fontSize: 13, fontWeight: "500" },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderLeftWidth: 4, elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  statLabel: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  alert: { backgroundColor: "#fef3c7", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#fde68a" },
  alertText: { color: "#92400e", fontSize: 14, fontWeight: "500" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 12 },
  quickActions: { marginTop: 8 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 12, color: "#374151", fontWeight: "500" },
});
