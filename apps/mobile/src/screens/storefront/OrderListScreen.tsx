import { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_ORDERS = [
  { id: "1", orderNumber: "ORD-001", status: "SHIPPED", total: 1250, items: 3, date: "2026-05-01" },
  { id: "2", orderNumber: "ORD-002", status: "DELIVERED", total: 800, items: 1, date: "2026-04-28" },
];

export default function OrderListScreen({ navigation }: any) {
  const [orders] = useState(MOCK_ORDERS);

  const statusColor = (s: string) => {
    const colors: Record<string, string> = { PENDING: "#f59e0b", SHIPPED: "#8b5cf6", DELIVERED: "#22c55e", CANCELLED: "#ef4444" };
    return colors[s] || "#6b7280";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.orderNum}>{item.orderNumber}</Text>
              <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
            </View>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.total}>৳{item.total.toLocaleString()}</Text>
              <Text style={styles.items}>{item.items} item{item.items > 1 ? "s" : ""}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>No orders yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderNum: { fontSize: 15, fontWeight: "600", color: "#111827" },
  status: { fontSize: 12, fontWeight: "600" },
  date: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 8 },
  total: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  items: { fontSize: 12, color: "#6b7280" },
});
