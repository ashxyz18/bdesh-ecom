import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SEOScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>SEO Settings</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={styles.field}>
          <Text style={styles.label}>Store Meta Title</Text>
          <TextInput style={styles.input} placeholder="My Store - Best Products in BD" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Meta Description</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: "top" }]} placeholder="Describe your store..." multiline />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Keywords</Text>
          <TextInput style={styles.input} placeholder="e-commerce, bangladesh, online store" />
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert("Saved", "SEO settings updated")}>
          <Text style={styles.saveText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
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
  saveBtn: { height: 48, backgroundColor: "#006A4E", borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 8 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
