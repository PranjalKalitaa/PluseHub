import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme/colors";

// Icon name mapping: maps legacy Ionicons names → MaterialCommunityIcons names
const ICON_MAP = {
  "create-outline": "pencil-outline",
  "create": "pencil",
  "mail-outline": "email-outline",
  "mail": "email",
  "logo-google": "google",
  "log-out-outline": "logout",
  "log-out": "logout",
  "person-outline": "account-outline",
  "person": "account",
  "mic-outline": "microphone-outline",
  "mic": "microphone",
  "videocam-outline": "video-outline",
  "videocam": "video",
  "book-outline": "book-open-outline",
  "book": "book-open-page-variant",
  "notifications-outline": "bell-outline",
  "notifications": "bell",
  "add-outline": "plus",
  "add": "plus",
  "share-outline": "share-variant-outline",
  "share": "share-variant",
  "settings-outline": "cog-outline",
  "settings": "cog",
  "search-outline": "magnify",
  "search": "magnify",
  "home-outline": "home-variant-outline",
  "home": "home-variant",
  "ribbon-outline": "medal-outline",
  "ribbon": "medal",
  "trophy-outline": "trophy-outline",
  "trophy": "trophy",
  "star-outline": "star-outline",
  "star": "star",
  "flash-outline": "lightning-bolt-outline",
  "flash": "lightning-bolt",
  "image-outline": "image-outline",
  "image": "image",
  "camera-outline": "camera-outline",
  "camera": "camera",
  "eye-outline": "eye-outline",
  "eye": "eye",
  "eye-off-outline": "eye-off-outline",
  "eye-off": "eye-off",
  "close-outline": "close",
  "close": "close",
  "checkmark-outline": "check",
  "checkmark": "check",
  "chevron-back": "chevron-left",
  "chevron-forward": "chevron-right",
  "arrow-back": "arrow-left",
  "send-outline": "send-outline",
  "send": "send",
  "chatbubble-outline": "chat-outline",
  "chatbubble": "chat",
  "heart-outline": "heart-outline",
  "heart": "heart",
};

export default function Button({
  title,
  onPress,
  variant = "primary", // primary | outline | ghost
  color = colors.primary,
  loading = false,
  disabled = false,
  icon,
  iconColor,
  style,
}) {
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";
  const textColor = isOutline || isGhost ? color : "#fff";

  // Resolve icon name to MaterialCommunityIcons
  const resolvedIcon = icon ? (ICON_MAP[icon] || icon) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        isOutline && { backgroundColor: "transparent", borderWidth: 1.5, borderColor: color },
        isGhost && { backgroundColor: "transparent" },
        !isOutline && !isGhost && { backgroundColor: color },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {resolvedIcon && (
            <MaterialCommunityIcons
              name={resolvedIcon}
              size={18}
              color={iconColor || textColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.text, { color: textColor }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
  },
});
