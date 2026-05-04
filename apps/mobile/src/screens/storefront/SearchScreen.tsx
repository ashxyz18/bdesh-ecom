import { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ALL_CATEGORIES = ["Fashion", "Electronics", "Food", "Grocery", "Salon", "Healthcare", "Education", "Corporate", "Portfolio"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  const filtered = query ? ALL_CATEGORIES.filter((c) => c.toLowerCase().includes(query.toLowerCase())) : ALL_CATEGORIES;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        style={styles.search}
        placeholder="Search stores, products..."
        value={query}
        onChangeText={setQuery}
      />
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", paddingHorizontal: 16, paddingTop: 8 },
  search: { margin: 16, height: 44, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, fontSize: 14, backgroundColor: "#fff" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#374151", paddingHorizontal: 16 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: "#fff", elevation: 1 },
  chipText: { fontSize: 14, color: "#374151", fontWeight: "500" },
});
