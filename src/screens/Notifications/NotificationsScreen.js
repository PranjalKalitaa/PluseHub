import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppData } from "../../context/DataContext";
import { colors, spacing, typography, radius } from "../../theme/colors";

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

const ICON_CONFIGS = {
  challenge: { name: "film", color: colors.primary },
  voice: { name: "mic", color: colors.secondary },
  story: { name: "book", color: colors.tertiary },
  referral: { name: "gift", color: colors.gold },
  follow: { name: "person-add", color: colors.success },
};

export default function NotificationsScreen() {
  const { notifications, markNotificationsRead, refreshData } = useAppData();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (markNotificationsRead) {
        markNotificationsRead();
      }
    }, [markNotificationsRead])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshData) await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
        renderItem={({ item }) => {
          const config = ICON_CONFIGS[item.kind] || { name: "notifications", color: colors.textMuted };
          return (
            <View style={styles.row}>
              <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
                <Ionicons name={config.name} size={18} color={config.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.text}>{item.text}</Text>
                <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { ...typography.h1, fontSize: 22, color: colors.text, padding: spacing.md },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, flexGrow: 1 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: colors.text, fontSize: 14 },
  time: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
