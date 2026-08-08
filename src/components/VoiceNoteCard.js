import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import Avatar from "./Avatar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme/colors";

const REACTIONS = [
  { key: "heart", emoji: "❤️" },
  { key: "laugh", emoji: "😂" },
  { key: "clap", emoji: "👏" },
];

export default function VoiceNoteCard({ note, onReact, onDuet, activeReactions = {} }) {
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef(null);

  const togglePlay = async () => {
    try {
      if (playing) {
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
        }
        setPlaying(false);
      } else {
        const audioUrl = note.audio_url || note.audioUrl;
        if (!audioUrl) {
          setPlaying(true);
          return;
        }

        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setPlaying(false);
          }
        });
      }
    } catch (err) {
      console.warn("Audio playback error", err);
      setPlaying(!playing);
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar emoji={note.user?.avatar || "🎤"} ringColor={colors.secondary} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={styles.name}>{note.user?.name || "Anonymous"}</Text>
          <Text style={styles.topic}>
            {note.topic} {note.duet_of || note.duetOf ? "· duet" : ""}
          </Text>
        </View>
        {(note.duet_of || note.duetOf) && (
          <View style={styles.duetBadge}>
            <MaterialCommunityIcons name="source-merge" size={12} color={colors.secondary} />
            <Text style={styles.duetBadgeText}>Duet</Text>
          </View>
        )}
      </View>

      <Text style={styles.caption}>{note.caption}</Text>

      <TouchableOpacity style={styles.waveform} onPress={togglePlay} activeOpacity={0.8}>
        <View style={styles.playIconContainer}>
          <MaterialCommunityIcons name={playing ? "pause" : "play"} size={16} color="#FFFFFF" />
        </View>
        <View style={styles.bars}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                { height: 6 + ((i * 7919) % 20), opacity: playing ? 1 : 0.6 },
              ]}
            />
          ))}
        </View>
        <Text style={styles.duration}>{note.duration_sec ?? note.durationSec ?? 15}s</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        {REACTIONS.map((r) => {
          const isActive = !!activeReactions[r.key];
          return (
            <TouchableOpacity
              key={r.key}
              style={[
                styles.reactBtn,
                isActive && {
                  backgroundColor: `${colors.secondary}18`,
                  borderColor: `${colors.secondary}60`,
                  borderWidth: 1,
                },
              ]}
              onPress={() => onReact?.(note.id, r.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.reactText, isActive && { color: colors.secondary }]}>
                {r.emoji} {(note.reactions || {})[r.key] || 0}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.duetBtn} onPress={() => onDuet?.(note)} activeOpacity={0.85}>
          <MaterialCommunityIcons name="microphone-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.duetText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  header: { flexDirection: "row", alignItems: "center" },
  name: { ...typography.h2, fontSize: 15, color: colors.text },
  topic: { color: colors.secondary, fontSize: 12, marginTop: 2 },
  duetBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    gap: 4,
  },
  duetBadgeText: { color: colors.secondary, fontSize: 10, fontWeight: "700" },
  caption: { color: colors.text, marginTop: spacing.sm, fontSize: 14 },
  waveform: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  playIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  bars: { flexDirection: "row", alignItems: "center", flex: 1, gap: 3 },
  bar: { width: 3, backgroundColor: colors.secondary, borderRadius: 1.5 },
  duration: { color: colors.textMuted, fontSize: 11, marginLeft: spacing.sm, marginRight: 4 },
  footer: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.md,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  reactBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  reactText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  duetBtn: {
    marginLeft: "auto",
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
  },
  duetText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
