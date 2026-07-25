import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";
import Avatar from "./Avatar";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme/colors";

export default function ChallengeCard({ post, onLike, isLiked }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const handleLike = () => {
    onLike?.(post.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar emoji={post.user?.avatar || "🙂"} ringColor={colors.primary} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={styles.name}>{post.user?.name || "Anonymous"}</Text>
          <Text style={styles.hashtag}>{post.hashtag}</Text>
        </View>
        <View style={styles.durationPill}>
          <Ionicons name="time-outline" size={10} color={colors.textMuted} style={{ marginRight: 3 }} />
          <Text style={styles.durationText}>{post.duration_sec ?? post.durationSec ?? 12}s</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.videoStub} onPress={togglePlay} activeOpacity={0.9}>
        {(post.video_url || post.videoUrl) ? (
          <Video
            ref={videoRef}
            style={StyleSheet.absoluteFillObject}
            source={{ uri: post.video_url || post.videoUrl }}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={playing}
            onPlaybackStatusUpdate={(status) => {
              if (status.isPlaying !== playing) {
                setPlaying(status.isPlaying);
              }
            }}
          />
        ) : null}

        {!playing && (
          <View style={styles.videoOverlay}>
            <View style={styles.playCircle}>
              <Ionicons name="play" size={32} color="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>
            <Text style={styles.playHint}>Tap to play challenge entry</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.caption}>{post.caption}</Text>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={18} color={isLiked ? colors.danger : colors.textMuted} />
          <Text style={[styles.actionText, isLiked && { color: colors.danger }]}>{post.likes}</Text>
        </TouchableOpacity>
        <View style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={17} color={colors.textMuted} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>
        <View style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={17} color={colors.textMuted} />
          <Text style={styles.actionText}>Share</Text>
        </View>
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
  hashtag: { color: colors.primary, fontSize: 12, marginTop: 2 },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  durationText: { color: colors.textMuted, fontSize: 11 },
  videoStub: {
    marginTop: spacing.md,
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    overflow: "hidden",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${colors.primary}CC`,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  playHint: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, fontWeight: "600" },
  caption: { color: colors.text, marginTop: spacing.sm, fontSize: 14 },
  footer: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 4, gap: 6 },
  actionText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
});
