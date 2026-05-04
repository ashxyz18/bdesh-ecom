import { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";
import { formatBDT } from "../../utils/formatters";

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.stores.list();
        const sid = res.stores?.[0]?.id;
        if (sid) {
          const r = await api.analytics.get(sid, 30);
          setData(r.analytics || []);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const totals = data.reduce((acc, d) => ({
    visitors: acc.visitors + (d.visitors || 0),
    pageviews: acc.pageviews + (d.pageviews || 0),
    orders: acc.orders + (d.orders || 0),
    revenue: acc.revenue + (d.revenue || 0),
  }), { visitors: 0, pageviews: 0, orders: 0, revenue: 0 });

  const stats = [
    { label: "Visitors", value: totals.visitors.toLocaleString(), color: "#3b82f6" },
    { label: "Page Views", value: totals.pageviews.toLocaleString(), color: "#8b5cf6" },
    { label: "Orders", value: totals.orders.toLocaleString(), color: "#f59e0b" },
    { label: "Revenue", value: formatBDT(totals.revenue), color: "#22c55e" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#006A4E" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <View style={styles.grid}>
            {stats.map((s) => (
              <View key={s.label} style={[styles.card, { borderLeftColor: s.color }]}>
                <Text style={[styles.value, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.label}>{s.label}</Text>
              </View>
            ))}
          </View>
          {data.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Last 30 Days Activity</Text>
              <View style={styles.chart}>
                {data.map((d: any, i: number) => {
                  const max = Math.max(...data.map((x: any) => x.visitors || 0), 1);
                  const h = ((d.visitors || 0) / max) * 100;
                  return (
                    <View key={i} style={styles.barWrapper}>
                      <View style={[styles.bar, { height: `${h}%` }]} />
                      <Text style={styles.barLabel}>{new Date(d.date).getDate()}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f7" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", paddingHorizontal: 16, paddingTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { flex: 1, minWidth: "45%", backgroundColor: "#fff", borderRadius: 16, padding: 16, borderLeftWidth: 4, elevation: 1 },
  label: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  value: { fontSize: 20, fontWeight: "bold" },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 12 },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 2 },
  barWrapper: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "80%", backgroundColor: "#006A4E", borderRadius: 4, minHeight: 2 },
  barLabel: { fontSize: 8, color: "#9ca3af", marginTop: 4 },
});
