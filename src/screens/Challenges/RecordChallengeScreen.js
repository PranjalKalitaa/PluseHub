import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import { uploadFile } from "../../utils/supabase";
import { useAppData } from "../../context/DataContext";
import { colors, spacing, typography, radius } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";

export default function RecordChallengeScreen({ navigation }) {
  const { user } = useAuth();
  const { dailyChallenge, postChallenge } = useAppData();
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [caption, setCaption] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [facing, setFacing] = useState("front");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const cameraRef = useRef(null);
  
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (s >= 59) {
            stopRecording();
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
    if (micPermission && !micPermission.granted) requestMicPermission();
  }, [permission, micPermission]);

  const stopRecording = useCallback(() => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (!isCameraReady) {
        Alert.alert("Camera Loading", "Please wait for the camera feed to load.");
        return;
      }
      if (cameraRef.current) {
        setIsRecording(true);
        setSeconds(0);
        try {
          // Zero-options parameter is the most compatible mode for Android
          const data = await cameraRef.current.recordAsync({ maxDuration: 60 });
          if (data && data.uri) {
            setVideoUri(data.uri);
          }
        } catch (err) {
          console.warn("Record video failed", err);
          setIsRecording(false);
        }
      }
    }
  };

  const onPost = async () => {
    if (!caption.trim()) {
      Alert.alert("Add a caption", "Tell people what your clip is about.");
      return;
    }
    if (!videoUri) {
      Alert.alert("No video recorded", "Please record a clip first.");
      return;
    }

    setSubmitting(true);
    try {
      const filename = `challenge_${user?.id || 'anon'}_${Date.now()}.mp4`;
      // Try uploading to 'videos' bucket
      const publicUrl = await uploadFile("videos", filename, videoUri);
      const finalUrl = publicUrl || videoUri;

      await postChallenge(caption.trim(), finalUrl, seconds || 10);
      Alert.alert("Posted!", "+25 sparks earned 🎉", [
        { text: "Nice", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Upload/Post video error", err);
      Alert.alert("Error", "Could not save your video. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{dailyChallenge.hashtag}</Text>
        <Text style={styles.prompt}>{dailyChallenge.prompt}</Text>

      <View style={styles.cameraBox}>
        {permission?.granted ? (
          <View style={StyleSheet.absoluteFillObject}>
            <CameraView
              ref={cameraRef}
              style={{ flex: 1, width: "100%" }}
              facing={facing}
              mode="video"
              onCameraReady={() => setIsCameraReady(true)}
            />
            <TouchableOpacity
              onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}
              style={styles.flipBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.permissionText}>Camera permission needed to record.</Text>
        )}
      </View>

      <Button
        title={isRecording ? `Stop recording (${60 - seconds}s left)` : "Start recording"}
        icon={isRecording ? "stop-circle-outline" : "videocam-outline"}
        color={isRecording ? colors.danger : colors.primary}
        onPress={toggleRecording}
        style={{ marginTop: spacing.md }}
      />

      <TextInput
        style={styles.input}
        placeholder="Write a caption..."
        placeholderTextColor={colors.textMuted}
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      <Button
        title="Post to challenge"
        icon="cloud-upload-outline"
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
  header: { color: colors.primary, fontWeight: "700" },
  prompt: { ...typography.h2, color: colors.text, marginTop: 4, marginBottom: spacing.md },
  cameraBox: {
    height: 320,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionText: { color: colors.textMuted, padding: spacing.md, textAlign: "center" },
  input: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    minHeight: 60,
  },
  flipBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
