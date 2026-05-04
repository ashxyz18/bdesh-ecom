import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiscountsScreen({ navigation }: any) {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("PERCENTAGE");

  const createCoupon = () => {
    if (!code || !discount) { Alert.alert("Error", "Code and discount value required"); return; }
    Alert.alert("Success", `Coupon ${code} created!`);
    setCode(""); setDiscount("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Discounts</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={{ padding: 16, gap: 14 }}>
        <View style={styles.field}>
          <Text style={styles.label}>Coupon Code</Text>
          <TextInput style={styles.input} placeholder="SAVE20" value={code} onChangeText={setCode} autoCapitalize="characters" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {["PERCENTAGE", "FIXED"].map((t) => (
              <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeActive]} onPress={() => setType(t)}>
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t === "PERCENTAGE" ? "% Off" : "৳ Off"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{type === "PERCENTAGE" ? "Percentage" : "Amount (৳)"}</Text>
          <TextInput style={styles.input} placeholder="20" value={discount} onChangeText={setDiscount} keyboardType="decimal-pad" />
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={createCoupon}>
          <Text style={styles.createText}>Create Coupon</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  back: { fontSize: 20, color: "#006A4E" },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "500", color: "#374151" },
  input: { height: 48, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, fontSize: 14, backgroundColor: "#fff" },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  typeActive: { backgroundColor: "#006A4E", borderColor: "#006A4E" },
  typeText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  typeTextActive: { color: "#fff" },
  createBtn: { height: 48, backgroundColor: "#006A4E", borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 8 },
  createText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
