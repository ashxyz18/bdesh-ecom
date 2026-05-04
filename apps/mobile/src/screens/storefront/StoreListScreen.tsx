import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";

export default function StoreListScreen({ navigation }: any) {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stores.list().then((res) => setStores(res.stores || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BdeshShop</Text>
        <Text style={styles.subtitle}>Discover stores</Text>
      </View>
      <TextInput style={styles.search} placeholder="Search stores..." />
      {loading ? (
        <ActivityIndicator size="large" color="#006A4E" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("StoreDetail", { store: item })}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.badge}>{item.status}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>No stores available</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  search: { margin: 16, height: 44, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, fontSize: 14, backgroundColor: "#fff" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 1 },
  logo: { width: 50, height: 50, borderRadius: 14, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center" },
  logoText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  info: { flex: 1, marginLeft: 12 },
  storeName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  badge: { fontSize: 11, color: "#006A4E", fontWeight: "500", marginTop: 2 },
  arrow: { fontSize: 24, color: "#9ca3af" },
});
