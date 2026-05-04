import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatBDT } from "../../utils/formatters";
import { useState } from "react";

export default function ProductDetailScreen({ route, navigation }: any) {
  const { product, store } = route.params;
  const [qty, setQty] = useState(1);

  const addToCart = () => {
    Alert.alert("Added to Cart", `${product.name} x${qty} added`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>{product.name}</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={styles.image}>
          <Text style={styles.imageText}>{product.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatBDT(Number(product.price))}</Text>
        {product.comparePrice && <Text style={styles.compare}>was {formatBDT(Number(product.comparePrice))}</Text>}
        {product.description && (
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.desc}>{product.description}</Text>
          </View>
        )}
        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Quantity:</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={addToCart}>
          <Text style={styles.cartBtnText}>Add to Cart — {formatBDT(Number(product.price) * qty)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={() => {
          addToCart();
          navigation.navigate("Cart");
        }}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  back: { fontSize: 20, color: "#006A4E" },
  title: { fontSize: 18, fontWeight: "bold", color: "#111827", flex: 1 },
  image: { width: "100%", height: 250, borderRadius: 20, backgroundColor: "#006A4E10", justifyContent: "center", alignItems: "center" },
  imageText: { fontSize: 60, fontWeight: "bold", color: "#006A4E" },
  name: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  price: { fontSize: 26, fontWeight: "bold", color: "#006A4E" },
  compare: { fontSize: 14, color: "#9ca3af", textDecorationLine: "line-through", marginTop: -8 },
  descCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 1 },
  descTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  desc: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
  qtyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  qtyLabel: { fontSize: 15, fontWeight: "500", color: "#374151" },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#e5e7eb", justifyContent: "center", alignItems: "center" },
  qtyBtnText: { fontSize: 18, fontWeight: "600", color: "#374151" },
  qtyValue: { fontSize: 18, fontWeight: "bold", color: "#111827", minWidth: 24, textAlign: "center" },
  cartBtn: { height: 50, borderRadius: 14, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center" },
  cartBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  buyBtn: { height: 50, borderRadius: 14, borderWidth: 2, borderColor: "#006A4E", justifyContent: "center", alignItems: "center" },
  buyBtnText: { color: "#006A4E", fontSize: 16, fontWeight: "bold" },
});
