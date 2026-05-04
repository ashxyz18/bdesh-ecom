import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BRIEF_PAYMENT_METHODS = ["Cash on Delivery", "bKash", "Nagad", "Rocket", "Card"];

export default function CheckoutScreen({ route, navigation }: any) {
  const { total } = route.params;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (!name || !phone || !address) { Alert.alert("Error", "Please fill all fields"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Order Placed!", "Your order has been placed successfully.");
      navigation.navigate("Orders");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 30 }} />
      </View>
      <View style={{ padding: 16, gap: 14 }}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total to Pay</Text>
          <Text style={styles.totalValue}>৳{total?.toLocaleString() || "0"}</Text>
        </View>
        <TextInput style={styles.input} placeholder="Full Name *" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Address *" value={address} onChangeText={setAddress} />
        <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.paymentRow}>
          {BRIEF_PAYMENT_METHODS.map((m) => (
            <TouchableOpacity key={m} style={[styles.paymentBtn, paymentMethod === m && styles.paymentActive]} onPress={() => setPaymentMethod(m)}>
              <Text style={[styles.paymentText, paymentMethod === m && styles.paymentTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.placeBtn} onPress={placeOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeText}>Place Order</Text>}
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
  totalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 1, alignItems: "center" },
  totalLabel: { fontSize: 14, color: "#6b7280" },
  totalValue: { fontSize: 28, fontWeight: "bold", color: "#006A4E", marginTop: 4 },
  input: { height: 48, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, fontSize: 14, backgroundColor: "#fff" },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 4 },
  paymentRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  paymentBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff" },
  paymentActive: { backgroundColor: "#006A4E", borderColor: "#006A4E" },
  paymentText: { fontSize: 12, color: "#374151", fontWeight: "500" },
  paymentTextActive: { color: "#fff" },
  placeBtn: { height: 50, borderRadius: 14, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center", marginTop: 8 },
  placeText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
