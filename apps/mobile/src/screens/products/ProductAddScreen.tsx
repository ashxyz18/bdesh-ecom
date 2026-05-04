import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";

export default function ProductAddScreen({ route, navigation }: any) {
  const { storeId } = route.params || {};
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price) { Alert.alert("Error", "Name and price are required"); return; }
    setSaving(true);
    try {
      await api.products.create(storeId, {
        name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        price: parseFloat(price),
        description: description || undefined,
        quantity: parseInt(quantity) || 0,
        status, images: [],
      });
      Alert.alert("Success", "Product created");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create");
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Add Product</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <TextInput style={styles.input} placeholder="Product Name *" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Price (৳) *" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <TextInput style={[styles.input, { height: 80, textAlignVertical: "top" }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
        <TextInput style={styles.input} placeholder="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
        <View style={styles.statusRow}>
          {["active", "draft"].map((s) => (
            <TouchableOpacity key={s} style={[styles.statusBtn, status === s && styles.statusActive]} onPress={() => setStatus(s)}>
              <Text style={[styles.statusText, status === s && styles.statusTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Create Product</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  back: { fontSize: 16, color: "#006A4E", fontWeight: "500" },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  input: { height: 48, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, fontSize: 14, backgroundColor: "#fff" },
  statusRow: { flexDirection: "row", gap: 8 },
  statusBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  statusActive: { backgroundColor: "#006A4E", borderColor: "#006A4E" },
  statusText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  statusTextActive: { color: "#fff" },
  saveBtn: { height: 48, backgroundColor: "#006A4E", borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 8 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
