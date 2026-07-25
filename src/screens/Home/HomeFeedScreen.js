import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PostCard from "../../components/PostCard";
import PointsBadge from "../../components/PointsBadge";
import Avatar from "../../components/Avatar";
import { useAppData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, typography } from "../../theme/colors";

const timeAgo = (dateString) => {
  if (!dateString) return '';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

export default function HomeFeedScreen({ navigation }) {
  const { challenges, voiceNotes, storyThreads, likedChallenges, reactedVoiceNotes, likeChallenge, reactToVoice, refreshData, dailyChallenge } = useAppData();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all"); // all | challenge | voice | story
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshData) await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const feed = useMemo(() => {
    const safeChallenges = (challenges || []).map(c => ({...c, type: c.type || 'challenge'}));
    const safeVoice = (voiceNotes || []).map(v => ({...v, type: v.type || 'voice'}));
    const safeStories = (storyThreads || []).map(s => ({...s, type: s.type || 'story'}));
    const combined = [...safeChallenges, ...safeVoice, ...safeStories].map(item => ({
      ...item, 
      timeAgo: timeAgo(item.created_at)
    }));
    combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const filtered = filter === "all" ? combined : combined.filter((i) => i.type === filter);
    return filtered;
  }, [challenges, voiceNotes, storyThreads, filter]);

  if (!dailyChallenge) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.logo}>PulseHub</Text>
          <Text style={styles.greeting}>Hey {user?.name?.split(" ")[0] || "there"} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Avatar emoji={user?.avatar || "🙂"} size={40} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterRow}
      >
        {[
          { key: "all", label: "All", icon: "grid" },
          { key: "challenge", label: "Challenges", icon: "film" },
          { key: "voice", label: "Voice", icon: "mic" },
          { key: "story", label: "Stories", icon: "book" },
        ].map((f) => {
          const isActive = filter === f.key;
          const activeColor = isActive ? "#fff" : colors.textMuted;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <View style={styles.chipContent}>
                <Ionicons name={f.icon} size={14} color={activeColor} />
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={feed}
        style={styles.feedList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            onLikeChallenge={likeChallenge}
            onReactVoice={reactToVoice}
            onDuet={(note) => navigation.navigate("RecordVoice", { duetOf: note.id, topic: note.topic })}
            onOpenStory={(thread) => navigation.navigate("StoryThread", { threadId: thread.id })}
            likedChallenges={likedChallenges}
            reactedVoiceNotes={reactedVoiceNotes}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nothing here yet — be the first to post!</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  logo: { ...typography.h1, fontSize: 22, color: colors.text },
  greeting: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  filterScrollView: {
    flexGrow: 0,
  },
  feedList: {
    flex: 1,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterText: { color: colors.textMuted, fontSize: 12 },
  filterTextActive: { color: "#fff", fontWeight: "700" },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
