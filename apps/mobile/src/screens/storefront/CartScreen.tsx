import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatBDT } from "../../utils/formatters";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CartScreen({ navigation }: any) {
  const [items, setItems] = useState<CartItem[]>([]);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.count}>{items.length} item{items.length !== 1 ? "s" : ""}</Text>
      </View>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate("Stores")}>
            <Text style={styles.shopBtnText}>Browse Stores</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatBDT(total)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("Checkout", { total })}>
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  count: { fontSize: 14, color: "#6b7280" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyIcon: { fontSize: 60 },
  emptyText: { fontSize: 16, color: "#6b7280" },
  shopBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: "#006A4E" },
  shopBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  totalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 1, alignItems: "center" },
  totalLabel: { fontSize: 14, color: "#6b7280" },
  totalValue: { fontSize: 32, fontWeight: "bold", color: "#006A4E", marginTop: 4 },
  checkoutBtn: { height: 52, borderRadius: 14, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center" },
  checkoutText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
