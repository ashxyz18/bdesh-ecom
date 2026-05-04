import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";
import { formatBDT, formatRelativeTime, statusColor, statusBg } from "../../utils/formatters";

export default function OrderListScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.stores.list();
      const sid = res.stores?.[0]?.id;
      if (sid) {
        const or = await api.orders.list(sid);
        setOrders(or.orders || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      <View style={styles.filters}>
        {["all", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((f) => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#006A4E" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders().then(() => setRefreshing(false)); }} />}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusBg(item.status) }]}>
                  <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.date}>{formatRelativeTime(item.createdAt)}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.total}>{formatBDT(Number(item.total))}</Text>
                <Text style={styles.items}>{item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? "s" : ""}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>No orders found</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  filters: { flexDirection: "row", paddingHorizontal: 16, gap: 6, flexWrap: "wrap", marginBottom: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  filterActive: { backgroundColor: "#006A4E", borderColor: "#006A4E" },
  filterText: { fontSize: 12, color: "#374151", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderNumber: { fontSize: 15, fontWeight: "600", color: "#111827" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  date: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  total: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  items: { fontSize: 12, color: "#6b7280" },
});
