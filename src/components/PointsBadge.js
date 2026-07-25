import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme/colors";

export default function PointsBadge({ sparks, label }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.spark}>✨ {sparks}</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 6,
  },
  spark: { color: colors.gold, fontWeight: "700", fontSize: 12 },
  label: { color: colors.textMuted, fontSize: 11 },
});
