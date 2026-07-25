import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

const EMOJI_TO_ICON = {
  "🎬": "film",
  "🎤": "mic",
  "📖": "book",
  "🎥": "videocam",
  "✨": "sparkles",
  "🙂": "person",
  "👤": "person",
  "🔔": "notifications",
  "🎁": "gift",
  "🏆": "trophy",
};

export default function Avatar({ emoji = "🙂", size = 44, ringColor }) {
  const isUrl = typeof emoji === "string" && (emoji.startsWith("http://") || emoji.startsWith("https://") || emoji.startsWith("file://"));
  const iconName = EMOJI_TO_ICON[emoji] || "person";

  // Pick a subtle backdrop color based on the icon/emoji to make it feel premium
  const getBackgroundColor = () => {
    if (isUrl) return colors.surfaceAlt;
    if (emoji === "🎬" || emoji === "🎥") return `${colors.primary}20`;
    if (emoji === "🎤") return `${colors.secondary}20`;
    if (emoji === "📖") return `${colors.tertiary}20`;
    if (emoji === "✨" || emoji === "🏆") return `${colors.gold}20`;
    return colors.surfaceAlt;
  };

  const getIconColor = () => {
    if (emoji === "🎬" || emoji === "🎥") return colors.primary;
    if (emoji === "🎤") return colors.secondary;
    if (emoji === "📖") return colors.tertiary;
    if (emoji === "✨" || emoji === "🏆") return colors.gold;
    return colors.textMuted;
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: ringColor || colors.border,
          backgroundColor: getBackgroundColor(),
          overflow: "hidden",
        },
      ]}
    >
      {isUrl ? (
        <Image source={{ uri: emoji }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      ) : (
        <Ionicons name={iconName} size={size * 0.5} color={getIconColor()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
