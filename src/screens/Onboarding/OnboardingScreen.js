import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import { colors, spacing, typography, radius } from "../../theme/colors";

const PILLARS = [
  { icon: "film-outline", color: colors.primary, title: "Daily Challenges", desc: "Film a quick clip for today's trend and climb the leaderboard." },
  { icon: "mic-outline", color: colors.secondary, title: "Voice Notes", desc: "Share a 15–30s thought and get duet replies from friends." },
  { icon: "book-outline", color: colors.tertiary, title: "Story Threads", desc: "Co-write micro-stories with the community, one line at a time." },
];

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>PulseHub</Text>
        <Text style={styles.tagline}>One app. Three ways to go viral.</Text>

        <View style={styles.pillars}>
          {PILLARS.map((p) => (
            <View key={p.title} style={[styles.pillarCard, { borderColor: p.color }]}>
              <View style={[styles.iconContainer, { backgroundColor: `${p.color}15` }]}>
                <Ionicons name={p.icon} size={24} color={p.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pillarTitle}>{p.title}</Text>
                <Text style={styles.pillarDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button title="Get Started" onPress={() => navigation.navigate("Signup")} />
          <Button
            title="I already have an account"
            variant="ghost"
            color={colors.textMuted}
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, justifyContent: "center", flexGrow: 1 },
  logo: { ...typography.h1, color: colors.text, textAlign: "center" },
  tagline: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.xl },
  pillars: { gap: spacing.md },
  pillarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  pillarTitle: { ...typography.h2, fontSize: 16, color: colors.text },
  pillarDesc: { color: colors.textMuted, marginTop: 4, fontSize: 13 },
  actions: { marginTop: spacing.xl, gap: spacing.sm },
});
