import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { formatBDT } from "../../utils/formatters";

export default function ProductListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storeId, setStoreId] = useState("");

  useEffect(() => {
    loadStoreAndProducts();
  }, []);

  const loadStoreAndProducts = async () => {
    try {
      const res = await api.stores.list();
      const sid = res.stores?.[0]?.id;
      if (sid) {
        setStoreId(sid);
        const pr = await api.products.list(sid);
        setProducts(pr.products || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const onDelete = async (id: string) => {
    if (!storeId) return;
    await api.products.delete(storeId, id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("ProductAdd", { storeId })}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <TextInput style={styles.search} placeholder="Search products..." value={search} onChangeText={setSearch} />
      <View style={styles.filters}>
        {["all", "active", "draft"].map((f) => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#006A4E" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStoreAndProducts().then(() => setRefreshing(false)); }} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ProductDetail", { productId: item.id, storeId })}>
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>{formatBDT(Number(item.price))}</Text>
                <View style={styles.badges}>
                  <View style={[styles.badge, { backgroundColor: item.status === "active" ? "#dcfce7" : "#f3f4f6" }]}>
                    <Text style={[styles.badgeText, { color: item.status === "active" ? "#16a34a" : "#6b7280" }]}>{item.status}</Text>
                  </View>
                  <Text style={styles.stock}>{item.quantity} in stock</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>No products found</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  search: { margin: 16, height: 44, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, fontSize: 14, backgroundColor: "#fff" },
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  filterActive: { backgroundColor: "#006A4E", borderColor: "#006A4E" },
  filterText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 14, elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  imagePlaceholder: { width: 60, height: 60, borderRadius: 12, backgroundColor: "#006A4E10", justifyContent: "center", alignItems: "center" },
  imageText: { fontSize: 24, fontWeight: "bold", color: "#006A4E" },
  info: { flex: 1, marginLeft: 12, justifyContent: "center" },
  name: { fontSize: 15, fontWeight: "600", color: "#111827" },
  price: { fontSize: 16, fontWeight: "bold", color: "#006A4E", marginTop: 2 },
  badges: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  stock: { fontSize: 11, color: "#6b7280" },
});
