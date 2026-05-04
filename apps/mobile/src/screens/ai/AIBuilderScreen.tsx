import { useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../services/api";

export default function AIBuilderScreen({ navigation }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Camera roll permission required"); return; }
    const picker = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });
    if (!picker.canceled && picker.assets[0]) {
      setImage(picker.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Camera permission required"); return; }
    const picker = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 });
    if (!picker.canceled && picker.assets[0]) {
      setImage(picker.assets[0].uri);
      setResult(null);
    }
  };

  const generateDesign = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await api.ai.generateFromImage({ imageBase64: image });
      setResult(res);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Generation failed");
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>AI Website Builder</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {!result ? (
          <>
            <Text style={styles.description}>
              Upload any image — logo, product photo, or mood board — and our AI will analyze the design and build a complete website for you.
            </Text>
            {image && <Image source={{ uri: image }} style={styles.preview} />}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.pickBtn} onPress={pickImage}><Text style={styles.pickBtnText}>📱 Gallery</Text></TouchableOpacity>
              <TouchableOpacity style={styles.pickBtn} onPress={takePhoto}><Text style={styles.pickBtnText}>📷 Camera</Text></TouchableOpacity>
            </View>
            {image && (
              <TouchableOpacity style={styles.generateBtn} onPress={generateDesign} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateText}>✨ Generate Website</Text>}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <Text style={styles.resultTitle}>✅ AI Design Ready</Text>
            <View style={styles.colorRow}>
              {result.previewColors?.map((color: string, i: number) => (
                <View key={i} style={[styles.colorSwatch, { backgroundColor: color }]} />
              ))}
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Industry</Text>
              <Text style={styles.detailValue}>{result.analysis?.detectedIndustry || "General"}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Style</Text>
              <Text style={styles.detailValue}>{result.analysis?.detectedStyle?.vibe || "Modern"}</Text>
            </View>
            {result.marketingTips?.map((tip: string, i: number) => (
              <View key={i} style={styles.tipCard}>
                <Text style={styles.tipText}>💡 {tip}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  back: { fontSize: 20, color: "#006A4E" },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  description: { fontSize: 14, color: "#6b7280", lineHeight: 20, textAlign: "center", paddingHorizontal: 12 },
  preview: { width: "100%", height: 250, borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  btnRow: { flexDirection: "row", gap: 12 },
  pickBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  pickBtnText: { fontSize: 15, color: "#374151", fontWeight: "500" },
  generateBtn: { height: 52, borderRadius: 16, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center" },
  generateText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  resultTitle: { fontSize: 18, fontWeight: "bold", color: "#16a34a", textAlign: "center" },
  colorRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  colorSwatch: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  detailCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, elevation: 1 },
  detailLabel: { fontSize: 11, color: "#6b7280", fontWeight: "500", marginBottom: 2 },
  detailValue: { fontSize: 16, fontWeight: "bold", color: "#111827", textTransform: "capitalize" },
  tipCard: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#bbf7d0" },
  tipText: { fontSize: 13, color: "#166534", lineHeight: 18 },
});
