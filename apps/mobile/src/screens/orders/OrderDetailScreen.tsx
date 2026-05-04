import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";
import { formatBDT, formatDate, statusColor } from "../../utils/formatters";

export default function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.stores.list();
        const sid = res.stores?.[0]?.id;
        if (sid) {
          const or = await api.orders.get(sid, orderId);
          setOrder(or.order);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const res = await api.stores.list();
      const sid = res.stores?.[0]?.id;
      if (sid) {
        await api.orders.updateStatus(sid, orderId, newStatus);
        setOrder({ ...order, status: newStatus });
        Alert.alert("Success", `Status updated to ${newStatus}`);
      }
    } catch { Alert.alert("Error", "Failed to update"); }
  };

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#006A4E" style={{ marginTop: 60 }} /></SafeAreaView>;
  if (!order) return <SafeAreaView style={styles.container}><Text style={{ textAlign: "center", marginTop: 60 }}>Order not found</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Order #{order.orderNumber}</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={styles.card}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, { color: statusColor(order.status) }]}>{order.status}</Text>
          <Text style={styles.date}>Placed {formatDate(order.createdAt)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items?.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.itemPrice}>{formatBDT(Number(item.price) * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatBDT(Number(order.total))}</Text>
          </View>
        </View>
        {order.shipping && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shipping</Text>
            <Text style={styles.text}>{order.shipping.name}</Text>
            <Text style={styles.textMuted}>{order.shipping.phone}</Text>
            <Text style={styles.textMuted}>{order.shipping.address}, {order.shipping.city}</Text>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={styles.text}>{order.paymentMethod?.replace(/_/g, " ")}</Text>
          <View style={[styles.badge, { backgroundColor: order.paymentStatus === "PAID" ? "#dcfce7" : "#fef3c7" }]}>
            <Text style={{ color: order.paymentStatus === "PAID" ? "#16a34a" : "#d97706", fontSize: 12, fontWeight: "600" }}>{order.paymentStatus}</Text>
          </View>
        </View>
        <Text style={styles.updateTitle}>Update Status</Text>
        <View style={styles.statusRow}>
          {["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
            <TouchableOpacity key={s} style={[styles.statusBtn, order.status === s && styles.statusBtnActive]} onPress={() => handleStatusUpdate(s)}>
              <Text style={[styles.statusBtnText, order.status === s && styles.statusBtnTextActive]}>{s.charAt(0) + s.slice(1).toLowerCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  back: { fontSize: 16, color: "#006A4E", fontWeight: "500" },
  title: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 1 },
  label: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  value: { fontSize: 20, fontWeight: "bold", marginTop: 2 },
  date: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  itemName: { fontSize: 14, color: "#374151", flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: "600", color: "#111827" },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 4 },
  totalLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#006A4E" },
  text: { fontSize: 14, color: "#374151", marginBottom: 2 },
  textMuted: { fontSize: 13, color: "#6b7280" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  updateTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginTop: 4 },
  statusRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  statusBtnActive: { backgroundColor: "#006A4E", borderColor: "#006A4E" },
  statusBtnText: { fontSize: 12, color: "#374151", fontWeight: "500" },
  statusBtnTextActive: { color: "#fff" },
});
