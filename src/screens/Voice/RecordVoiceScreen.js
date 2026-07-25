import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Button from "../../components/Button";
import { uploadFile } from "../../utils/supabase";
import { useAppData } from "../../context/DataContext";
import { colors, spacing, typography, radius } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";

const TOPICS = ["#DailyHumor", "#Motivation", "#Confession", "#HotTake", "#General"];

export default function RecordVoiceScreen({ navigation, route }) {
  const { user } = useAuth();
  const { duetOf, topic: incomingTopic } = route?.params || {};
  const { recordVoiceNote } = useAppData();
  const [caption, setCaption] = useState("");
  const [topic, setTopic] = useState(incomingTopic || TOPICS[TOPICS.length - 1]);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordedUri, setRecordedUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (s >= 119) {
            stopRecording();
            return 120;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Microphone needed", "Please allow microphone access to record a voice note.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setSeconds(0);
      setIsRecording(true);
    } catch (e) {
      Alert.alert("Recording error", "Could not start recording. Try again.");
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordedUri(uri);
      }
    } catch (e) {
      console.warn("Stop recording error", e);
    }
    setRecording(null);
  };

  const onPost = async () => {
    if (!caption.trim()) {
      Alert.alert("Add a caption", "Give your voice note a short title.");
      return;
    }
    if (!recordedUri) {
      Alert.alert("No recording found", "Please record a message first.");
      return;
    }

    setSubmitting(true);
    try {
      const filename = `voice_${user?.id || 'anon'}_${Date.now()}.m4a`;
      // Try uploading to Supabase 'voice-notes' bucket
      const publicUrl = await uploadFile("voice-notes", filename, recordedUri);
      
      // Fallback to local recorded file so it plays immediately on this device!
      const finalUrl = publicUrl || recordedUri;

      await recordVoiceNote(caption.trim(), topic, duetOf || null, finalUrl, seconds || 5);
      Alert.alert("Posted!", `+${duetOf ? 20 : 15} sparks earned 🎉`, [
        { text: "Nice", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Upload/Post voice note error", err);
      Alert.alert("Error", "Could not save your recording. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{duetOf ? "Reply with your voice" : "New voice note"}</Text>

        <View style={styles.recordBox}>
          <TouchableOpacity
            style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={36}
              color={isRecording ? "#FFF" : colors.secondary}
            />
          </TouchableOpacity>
          <Text style={styles.timer}>{isRecording ? `Recording… ${120 - seconds}s left` : "Tap to record"}</Text>
        </View>

      <Text style={styles.label}>Topic</Text>
      <View style={styles.topicRow}>
        {TOPICS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTopic(t)}
            style={[styles.topicChip, topic === t && styles.topicChipActive]}
          >
            <Text style={[styles.topicText, topic === t && styles.topicTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Caption your voice note..."
        placeholderTextColor={colors.textMuted}
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      <Button
        title="Post voice note"
        icon="cloud-upload-outline"
        color={colors.secondary}
        onPress={onPost}
        loading={submitting}
        style={{ marginTop: spacing.sm }}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  recordBox: { alignItems: "center", paddingVertical: spacing.lg },
  recordBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  recordBtnActive: { backgroundColor: colors.secondary },
  recordIcon: { fontSize: 36 },
  timer: { color: colors.textMuted, marginTop: spacing.sm },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  topicRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  topicChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  topicText: { color: colors.textMuted, fontSize: 12 },
  topicTextActive: { color: "#fff", fontWeight: "700" },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    minHeight: 60,
  },
});
