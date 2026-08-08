import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Avatar from "../../components/Avatar";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, typography, radius } from "../../theme/colors";

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("sparks", { ascending: false });

      if (data) {
        const formatted = data.map((u, index) => ({
          ...u,
          rank: index + 1,
        }));
        setLeaderboard(formatted);
      }
    } catch (e) {
      console.error("Leaderboard fetch error", e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    (async () => {
      await fetchLeaderboard();
      setLoading(false);
    })();
  }, [user]);

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: colors.gold, text: "#000" };
    if (rank === 2) return { bg: "#E2E8F0", text: "#000" };
    if (rank === 3) return { bg: "#CD7F32", text: "#FFF" };
    return { bg: colors.surfaceAlt, text: colors.textMuted };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="trophy" size={26} color={colors.gold} />
        <Text style={styles.header}>Leaderboard</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          data={leaderboard}
          keyExtractor={(item) => `${item.rank}-${item.id}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isYou = item.handle === user?.handle;
            const rankStyle = getRankStyle(item.rank);
            return (
              <View style={[styles.row, isYou && styles.rowYou]}>
                <View style={[styles.rankCircle, { backgroundColor: rankStyle.bg }]}>
                  <Text style={[styles.rankText, { color: rankStyle.text }]}>{item.rank}</Text>
                </View>
                <Avatar emoji={item.avatar} size={36} />
                <Text style={styles.name}>{isYou ? "You" : item.name}</Text>
                <View style={styles.sparksContainer}>
                  <MaterialCommunityIcons name="lightning-bolt" size={15} color={colors.gold} style={{ marginRight: 2 }} />
                  <Text style={styles.sparks}>{item.sparks}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.sm },
  header: { ...typography.h1, fontSize: 22, color: colors.text },
  listContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  rowYou: { borderColor: colors.gold, borderWidth: 1.5 },
  rankCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 12, fontWeight: "800" },
  name: { flex: 1, color: colors.text, fontWeight: "600", fontSize: 14 },
  sparksContainer: { flexDirection: "row", alignItems: "center" },
  sparks: { color: colors.gold, fontWeight: "700", fontSize: 14 },
});
