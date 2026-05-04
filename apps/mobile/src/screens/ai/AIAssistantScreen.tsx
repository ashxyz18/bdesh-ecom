import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";

export default function AIAssistantScreen({ navigation }: any) {
  const [messages, setMessages] = useState<any[]>([
    { id: "welcome", role: "assistant", content: "Hello! I'm BdeshBot, your AI assistant. I can help you with:\n• Store setup & templates\n• Product descriptions\n• Marketing strategies\n• bKash/Nagad setup\n• SEO tips\n\nHow can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.ai.chat([...messages, userMsg].map((m) => ({ role: m.role, content: m.content })));
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: res.content }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I couldn't process that request." }]);
    } finally { setLoading(false); }
  };

  const quickActions = ["Recommend a template", "Marketing tips for BD", "Product description", "SEO help"];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>AI Assistant</Text>
        <View style={{ width: 30 }} />
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.bubbleText, item.role === "user" ? styles.userText : styles.botText]}>{item.content}</Text>
          </View>
        )}
        ListHeaderComponent={
          messages.length <= 1 ? (
            <View style={styles.quickRow}>
              {quickActions.map((a) => (
                <TouchableOpacity key={a} style={styles.quickBtn} onPress={() => setInput(`Give me ${a.toLowerCase()}`)}>
                  <Text style={styles.quickText}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Ask AI..." value={input} onChangeText={setInput} multiline />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading || !input.trim()}>
            <Text style={styles.sendText}>{loading ? "..." : "→"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  back: { fontSize: 20, color: "#006A4E" },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  bubble: { maxWidth: "85%", padding: 14, borderRadius: 16 },
  userBubble: { backgroundColor: "#006A4E", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: "#fff", alignSelf: "flex-start", borderBottomLeftRadius: 4, elevation: 1 },
  userText: { color: "#fff", fontSize: 14 },
  botText: { color: "#374151", fontSize: 14, lineHeight: 20 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  quickText: { fontSize: 12, color: "#374151", fontWeight: "500" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "#fff" },
  input: { flex: 1, minHeight: 44, maxHeight: 100, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, backgroundColor: "#f9fafb" },
  sendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#006A4E", justifyContent: "center", alignItems: "center" },
  sendText: { color: "#fff", fontSize: 20 },
});
