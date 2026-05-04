import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderTrackingScreen({ route }: any) {
  const { order } = route?.params || {};
  const steps = [
    { label: "Order Placed", done: true },
    { label: "Confirmed", done: true },
    { label: "Processing", done: order?.status !== "PENDING" },
    { label: "Shipped", done: order?.status === "SHIPPED" || order?.status === "DELIVERED" },
    { label: "Delivered", done: order?.status === "DELIVERED" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Track Order</Text>
      <Text style={styles.orderNum}>{order?.orderNumber || "ORD-000"}</Text>
      <View style={styles.timeline}>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={[styles.dot, step.done ? styles.dotDone : styles.dotPending]}>
              <Text style={styles.dotText}>{step.done ? "✓" : i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, step.done && styles.stepDone]}>{step.label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 4 },
  orderNum: { fontSize: 14, color: "#6b7280", marginBottom: 24 },
  timeline: { gap: 4 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  dot: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  dotDone: { backgroundColor: "#006A4E" },
  dotPending: { backgroundColor: "#e5e7eb" },
  dotText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  stepLabel: { fontSize: 16, color: "#9ca3af" },
  stepDone: { color: "#111827", fontWeight: "500" },
});
