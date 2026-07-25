import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme/colors";

export default function StoryThreadCard({ thread, onPress }) {
  const entries = thread.entries || [];
  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(thread)} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{thread.title}</Text>
        <View style={styles.inkPill}>
          <Ionicons name="create-outline" size={12} color={colors.tertiary} style={{ marginRight: 4 }} />
          <Text style={styles.inkText}>{thread.ink_points || 0}</Text>
        </View>
      </View>

      <View style={styles.tagRow}>
        {(thread.tags || []).map((t) => (
          <Text key={t} style={styles.tag}>
            {t}
          </Text>
        ))}
      </View>

      {lastEntry ? (
        <>
          <Text style={styles.preview} numberOfLines={2}>
            "{lastEntry.text}"
          </Text>
          <Text style={styles.lastAuthor}>— {lastEntry.user?.name || "Anonymous"}</Text>
        </>
      ) : (
        <Text style={styles.preview} numberOfLines={2}>
          "No entries yet"
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.entryCount}>{entries.length} entries</Text>
        <View style={styles.ctaRow}>
          <Text style={styles.cta}>Continue the story</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.tertiary} style={{ marginLeft: 2 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { ...typography.h2, fontSize: 16, color: colors.text, flex: 1, marginRight: spacing.sm },
  inkPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  inkText: { color: colors.tertiary, fontSize: 11, fontWeight: "700" },
  tagRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  tag: { color: colors.tertiary, fontSize: 12 },
  preview: { color: colors.text, marginTop: spacing.sm, fontStyle: "italic" },
  lastAuthor: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  entryCount: { color: colors.textMuted, fontSize: 12 },
  ctaRow: { flexDirection: "row", alignItems: "center" },
  cta: { color: colors.tertiary, fontSize: 12, fontWeight: "700" },
});
