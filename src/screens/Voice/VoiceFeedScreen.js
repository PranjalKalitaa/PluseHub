import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VoiceNoteCard from "../../components/VoiceNoteCard";
import Button from "../../components/Button";
import { useAppData } from "../../context/DataContext";
import { colors, spacing, typography } from "../../theme/colors";

export default function VoiceFeedScreen({ navigation }) {
  const { voiceNotes, reactToVoice, refreshData } = useAppData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshData) await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice</Text>
        <Button title="New" icon="mic" onPress={() => navigation.navigate("RecordVoice")} style={styles.newBtn} />
      </View>

      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={voiceNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <VoiceNoteCard
            note={item}
            onReact={reactToVoice}
            onDuet={(note) =>
              navigation.navigate("RecordVoice", { duetOf: note.id, topic: note.topic })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  title: { ...typography.h1, fontSize: 22, color: colors.text },
  newBtn: { paddingHorizontal: spacing.md, paddingVertical: 8 },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
});
