import React, { useState, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import Avatar from "../../components/Avatar";
import { useAppData } from "../../context/DataContext";
import { colors, spacing, typography, radius } from "../../theme/colors";

export default function StoryThreadScreen({ route, navigation }) {
  const { threadId } = route.params;
  const { storyThreads, addStoryEntry, refreshData } = useAppData();
  const thread = useMemo(() => storyThreads.find((t) => t.id === threadId), [storyThreads, threadId]);
  const [line, setLine] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshData) await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  if (!thread) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Story not found.</Text>
      </SafeAreaView>
    );
  }

  const onAddLine = async () => {
    if (!line.trim()) {
      Alert.alert("Write something", "Add a line to continue the story.");
      return;
    }
    setSubmitting(true);
    try {
      await addStoryEntry(thread.id, line.trim());
      setLine("");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not add entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>{thread.title}</Text>
        <View style={styles.tagRow}>
          {(thread.tags || []).map((t) => (
            <Text key={t} style={styles.tag}>
              {t}
            </Text>
          ))}
          <View style={styles.inkContainer}>
            <Ionicons name="create-outline" size={14} color={colors.gold} style={{ marginRight: 3 }} />
            <Text style={styles.ink}>{(thread.ink_points ?? thread.inkPoints ?? 0)} ink points</Text>
          </View>
        </View>

        {(!thread.entries || thread.entries.length === 0) ? (
          <Text style={{color: colors.textMuted, textAlign: "center", marginTop: 20}}>No entries yet. Be the first to start the story!</Text>
        ) : (
          (thread.entries || []).map((entry, i) => (
            <View key={entry.id || i} style={styles.entryRow}>
              <Avatar emoji={entry.user?.avatar || "🙂"} size={32} ringColor={colors.tertiary} />
              <View style={styles.entryBubble}>
                <Text style={styles.entryAuthor}>{entry.user?.name || "Anonymous"}</Text>
                <Text style={styles.entryText}>{entry.text}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Continue the story..."
          placeholderTextColor={colors.textMuted}
          value={line}
          onChangeText={setLine}
          multiline
        />
        <Button
          title="Add your line (+10 sparks)"
          icon="pencil-outline"
          color={colors.tertiary}
          onPress={onAddLine}
          loading={submitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { ...typography.h1, fontSize: 22, color: colors.text },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.md, alignItems: "center" },
  tag: { color: colors.tertiary, fontSize: 12 },
  inkContainer: { flexDirection: "row", alignItems: "center", marginLeft: "auto" },
  ink: { color: colors.gold, fontSize: 12, fontWeight: "600" },
  entryRow: { flexDirection: "row", marginBottom: spacing.md, alignItems: "flex-start" },
  entryBubble: {
    marginLeft: spacing.sm,
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryAuthor: { color: colors.tertiary, fontSize: 12, fontWeight: "700" },
  entryText: { color: colors.text, marginTop: 4 },
  composer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    minHeight: 50,
    marginBottom: spacing.sm,
  },
  notFound: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
