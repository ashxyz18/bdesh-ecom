import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function StoreSelectorScreen({ navigation }: any) {
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    api.stores.list().then((res) => setStores(res.stores || [])).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Store</Text>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Dashboard", { storeId: item.id })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subdomain}>{item.subdomain}.bdesh.shop</Text>
            </View>
            <Text style={styles.status}>{item.status}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>No stores created yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1 },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "600", color: "#111827" },
  subdomain: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  status: { fontSize: 11, color: "#006A4E", fontWeight: "600" },
});
