import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";
import { formatBDT } from "../../utils/formatters";

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId, storeId } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId && productId) {
      api.products.get(storeId, productId).then((res) => setProduct(res.product)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [storeId, productId]);

  const handleToggleStatus = async () => {
    if (!product || !storeId) return;
    const newStatus = product.status === "active" ? "draft" : "active";
    await api.products.update(storeId, productId, { status: newStatus });
    setProduct({ ...product, status: newStatus });
  };

  const handleDelete = async () => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await api.products.delete(storeId, productId);
        navigation.goBack();
      }},
    ]);
  };

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#006A4E" style={{ marginTop: 60 }} /></SafeAreaView>;
  if (!product) return <SafeAreaView style={styles.container}><Text style={{ textAlign: "center", marginTop: 60 }}>Product not found</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Product Details</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={styles.card}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>{product.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatBDT(Number(product.price))}</Text>
          {product.comparePrice && <Text style={styles.compare}>was {formatBDT(Number(product.comparePrice))}</Text>}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: product.status === "active" ? "#dcfce7" : "#f3f4f6" }]}>
              <Text style={{ color: product.status === "active" ? "#16a34a" : "#6b7280", fontSize: 12, fontWeight: "600" }}>{product.status}</Text>
            </View>
            <Text style={styles.stock}>Stock: {product.quantity}</Text>
          </View>
        </View>
        {product.description && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.desc}>{product.description}</Text>
          </View>
        )}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#006A4E" }]} onPress={handleToggleStatus}>
            <Text style={styles.actionText}>{product.status === "active" ? "Set as Draft" : "Activate"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#ef4444" }]} onPress={handleDelete}>
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  back: { fontSize: 16, color: "#006A4E", fontWeight: "500" },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 1 },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 16, backgroundColor: "#006A4E10", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  imageText: { fontSize: 32, fontWeight: "bold", color: "#006A4E" },
  name: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  price: { fontSize: 22, fontWeight: "bold", color: "#006A4E", marginTop: 4 },
  compare: { fontSize: 13, color: "#9ca3af", textDecorationLine: "line-through", marginTop: 2 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stock: { fontSize: 13, color: "#6b7280" },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  desc: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
  actions: { gap: 12 },
  actionBtn: { height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  actionText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
