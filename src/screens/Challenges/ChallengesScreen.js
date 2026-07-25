import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ChallengeCard from "../../components/ChallengeCard";
import Button from "../../components/Button";
import { useAppData } from "../../context/DataContext";
import { colors, spacing, typography, radius } from "../../theme/colors";

export default function ChallengesScreen({ navigation }) {
  const { dailyChallenge, challenges, likeChallenge, refreshData } = useAppData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshData) await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  if (!dailyChallenge) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{color: colors.textMuted, marginTop: 10}}>No challenge today</Text>
      </SafeAreaView>
    );
  }

  const hoursUntilMidnight = 24 - new Date().getHours();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Challenges</Text>

      <View style={styles.promptCard}>
        <Text style={styles.promptLabel}>TODAY'S CHALLENGE</Text>
        <Text style={styles.promptText}>{dailyChallenge.prompt}</Text>
        <Text style={styles.promptHashtag}>{dailyChallenge.hashtag}</Text>
        <Text style={styles.expires}>Expires in {hoursUntilMidnight}h</Text>
        <Button
          title="Film your entry"
          icon="videocam"
          onPress={() => navigation.navigate("RecordChallenge")}
          style={{ marginTop: spacing.md }}
        />
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("Leaderboard")}
        style={styles.leaderboardLinkContainer}
        activeOpacity={0.8}
      >
        <Ionicons name="trophy-outline" size={16} color={colors.gold} />
        <Text style={styles.leaderboardLink}>View leaderboard</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.gold} />
      </TouchableOpacity>

      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={challenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ChallengeCard post={item} onLike={likeChallenge} />}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Submissions</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { ...typography.h1, fontSize: 22, color: colors.text, padding: spacing.md, paddingBottom: 0 },
  promptCard: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  promptLabel: { color: colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  promptText: { ...typography.h2, color: colors.text, marginTop: spacing.xs },
  promptHashtag: { color: colors.primary, marginTop: 4 },
  expires: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  leaderboardLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    gap: 4,
  },
  leaderboardLink: { color: colors.gold, fontWeight: "600", fontSize: 14 },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { ...typography.h2, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
});
