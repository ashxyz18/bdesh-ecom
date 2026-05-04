import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";
import { formatBDT } from "../../utils/formatters";

export default function StoreDetailScreen({ route, navigation }: any) {
  const { store } = route.params;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.storefront.products(store.id);
        setProducts(res.products || []);
      } catch {} finally { setLoading(false); }
    })();
  }, [store.id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <View style={styles.storeInfo}>
          <View style={styles.logo}><Text style={styles.logoText}>{store.name.charAt(0)}</Text></View>
          <View>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.subdomain}>{store.subdomain}.bdesh.shop</Text>
          </View>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#006A4E" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={products.filter((p: any) => p.status === "active")}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Products ({products.filter((p: any) => p.status === "active").length})</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ProductDetail", { product: item, store })}>
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>{item.name.charAt(0)}</Text>
              </View>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.price}>{formatBDT(Number(item.price))}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center", color: "#9ca3af", marginTop: 40, paddingBottom: 40 }}>No products yet</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  back: { fontSize: 20, color: "#006A4E" },
  storeInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center" },
  logoText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  storeName: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  subdomain: { fontSize: 11, color: "#6b7280" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 4 },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 12, elevation: 1, maxWidth: "48%" },
  imagePlaceholder: { width: "100%", aspectRatio: 1, borderRadius: 10, backgroundColor: "#006A4E10", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  imageText: { fontSize: 28, fontWeight: "bold", color: "#006A4E" },
  productName: { fontSize: 13, fontWeight: "500", color: "#374151", lineHeight: 18 },
  price: { fontSize: 16, fontWeight: "bold", color: "#006A4E", marginTop: 4 },
});
