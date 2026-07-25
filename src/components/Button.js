import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme/colors";

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
          {icon && (
            <Ionicons
              name={icon}
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
