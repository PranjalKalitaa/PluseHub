import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import { useAppData } from "../../context/DataContext";
import { colors, spacing, typography, radius } from "../../theme/colors";

export default function NewStoryScreen({ navigation }) {
  const { startStoryThread } = useAppData();
  const [title, setTitle] = useState("");
  const [firstLine, setFirstLine] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!title.trim() || !firstLine.trim()) {
      Alert.alert("Missing info", "Give your story a title and an opening line.");
      return;
    }
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));
    
    setSubmitting(true);
    try {
      await startStoryThread(title.trim(), firstLine.trim(), tagList);
      Alert.alert("Story started!", "+20 sparks earned 🎉", [
        { text: "Nice", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not start story.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Start a story thread</Text>

        <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The door that shouldn't open"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Opening line</Text>
        <TextInput
          style={[styles.input, { minHeight: 70 }]}
          placeholder="Set the scene..."
          placeholderTextColor={colors.textMuted}
          value={firstLine}
          onChangeText={setFirstLine}
          multiline
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Horror, PlotTwist"
          placeholderTextColor={colors.textMuted}
          value={tags}
          onChangeText={setTags}
        />
      </View>

      <Button title="Publish thread" icon="send-outline" color={colors.tertiary} onPress={onSubmit} loading={submitting} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  field: { marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
  },
});
