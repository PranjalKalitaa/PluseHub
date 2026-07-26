import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Share, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button";
import PointsBadge from "../../components/PointsBadge";
import PostCard from "../../components/PostCard";
import VoiceNoteCard from "../../components/VoiceNoteCard";
import StoryThreadCard from "../../components/StoryThreadCard";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/DataContext";
import { uploadFile } from "../../utils/supabase";
import { badgeForSparks, nextBadgeProgress } from "../../utils/points";
import { colors, spacing, typography, radius } from "../../theme/colors";

const AVATAR_OPTIONS = ["🙂", "🎬", "🎤", "📖", "🎥", "✨", "😎", "🦊", "🚀"];

export default function ProfileScreen({ route, navigation }) {
  const { user: authUser, logOut, updateUser } = useAuth();
  const { challenges, voiceNotes, storyThreads, followUser, unfollowUser, isFollowing, likedChallenges, reactedVoiceNotes, likeChallenge, reactToVoice } = useAppData();
  
  const routeUser = route?.params?.user;
  const isOwnProfile = !routeUser || routeUser.id === authUser?.id;
  const user = isOwnProfile ? authUser : routeUser;
  
  const badge = badgeForSparks(user?.sparks || 0);
  const { next, remaining, progress } = nextBadgeProgress(user?.sparks || 0);

  const [activeTab, setActiveTab] = useState("challenges"); // challenges | voice | stories
  const followingThisUser = isFollowing ? isFollowing(user?.id) : false;

  // Edit Profile States
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow gallery access to upload a profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setUploading(true);
        const localUri = result.assets[0].uri;
        const filename = `avatar_${user.id}_${Date.now()}.jpg`;

        // Upload to 'avatars' bucket in Supabase
        const publicUrl = await uploadFile("avatars", filename, localUri);

        // We MUST update user data if the upload succeeds.
        const urlToUse = publicUrl || localUri;
        setEditAvatar(urlToUse);
        await updateUser({ avatar: urlToUse });
      }
    } catch (err) {
      console.warn("Pick image failed", err);
      Alert.alert("Error", "Could not load image.");
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = () => {
    setEditName(user?.name || "");
    setEditBio(user?.bio || "");
    setEditAvatar(user?.avatar || "🙂");
    setModalVisible(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({
        name: editName.trim() || "User",
        bio: editBio.trim(),
        avatar: editAvatar,
      });
      setModalVisible(false);
      Alert.alert("Profile updated", "Your changes have been saved.");
    } catch (error) {
      Alert.alert("Could not save profile", error.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const shareReferral = async () => {
    try {
      await Share.share({
        message: `Join me on PulseHub! Use my code ${user?.referral_code} to get bonus sparks.`,
      });
    } catch (e) {
      // ignore share cancellation
    }
  };

  const handleFollowToggle = () => {
    if (followingThisUser) {
      if (unfollowUser) unfollowUser(user?.id);
    } else {
      if (followUser) followUser(user?.id);
    }
  };

  const userChallenges = useMemo(() => challenges?.filter(c => c.user_id === user?.id) || [], [challenges, user?.id]);
  const userVoice = useMemo(() => voiceNotes?.filter(v => v.user_id === user?.id) || [], [voiceNotes, user?.id]);
  const userStories = useMemo(() => storyThreads?.filter(s => s.user_id === user?.id) || [], [storyThreads, user?.id]);

  const renderContent = () => {
    let data = [];
    if (activeTab === "challenges") data = userChallenges;
    if (activeTab === "voice") data = userVoice;
    if (activeTab === "stories") data = userStories;

    if (data.length === 0) {
      return <Text style={styles.emptyText}>No posts yet.</Text>;
    }

    return (
      <View style={{ gap: spacing.md, paddingHorizontal: spacing.md }}>
        {data.map(item => {
          if (activeTab === "challenges") {
            return (
              <PostCard
                key={item.id}
                item={{ ...item, type: 'challenge' }}
                onLikeChallenge={likeChallenge}
                likedChallenges={likedChallenges}
              />
            );
          }
          if (activeTab === "voice") {
            return (
              <VoiceNoteCard
                key={item.id}
                note={item}
                onReact={reactToVoice}
                onDuet={(note) => navigation.navigate("RecordVoice", { duetOf: note.id, topic: note.topic })}
              />
            );
          }
          if (activeTab === "stories") {
            return (
              <StoryThreadCard
                key={item.id}
                thread={item}
                onPress={(thread) => navigation.navigate("StoryThread", { threadId: thread.id })}
              />
            );
          }
          return null;
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Avatar emoji={user?.avatar || "🙂"} size={72} ringColor={colors.primary} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.handle}>@{user?.handle}</Text>
            {user?.bio ? <Text style={styles.bioText}>{user.bio}</Text> : null}
            <View style={{ marginTop: spacing.xs }}>
              <PointsBadge sparks={user?.sparks || 0} label={badge} />
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Followers" value={user?.followers ?? 0} />
          <Stat label="Following" value={user?.following ?? 0} />
          <Stat label="Sparks" value={user?.sparks ?? 0} />
        </View>

        {isOwnProfile ? (
          <Button
            title="Edit Profile"
            icon="create-outline"
            variant="outline"
            onPress={openEditModal}
            style={{ marginBottom: spacing.md }}
          />
        ) : (
          <Button
            title={followingThisUser ? "Following" : "Follow"}
            variant={followingThisUser ? "outline" : "primary"}
            color={followingThisUser ? colors.textMuted : colors.primary}
            onPress={handleFollowToggle}
            style={{ marginBottom: spacing.md }}
          />
        )}

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>
            {next ? `${remaining} sparks to "${next}"` : "Max badge reached 🎉"}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        </View>

        <View style={styles.referralCard}>
          <Text style={styles.referralLabel}>Your referral code</Text>
          <Text style={styles.referralCode}>{user?.referral_code}</Text>
          <Button title="Share invite" variant="outline" onPress={shareReferral} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={styles.badgesRow}>
          {(user?.badges || [badge]).map((b) => (
            <View key={b} style={styles.badgeChip}>
              <Ionicons name="ribbon-outline" size={14} color={colors.gold} style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setActiveTab("challenges")} style={[styles.tab, activeTab === "challenges" && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === "challenges" && styles.tabTextActive]}>Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("voice")} style={[styles.tab, activeTab === "voice" && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === "voice" && styles.tabTextActive]}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("stories")} style={[styles.tab, activeTab === "stories" && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === "stories" && styles.tabTextActive]}>Stories</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}

        {isOwnProfile && (
          <View style={{ marginTop: spacing.xl }}>
            <Button
              title="Notifications"
              variant="ghost"
              color={colors.text}
              onPress={() => navigation.navigate("Notifications")}
            />
            <Button
              title="Log out"
              variant="ghost"
              color={colors.danger}
              onPress={logOut}
            />
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalBg}>
          <SafeAreaView edges={["bottom"]} style={styles.modalSafeArea}>
            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.label}>Choose Avatar Icon or Upload Photo</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setEditAvatar(emoji)}
                  style={[
                    styles.avatarSelectBtn,
                    editAvatar === emoji && styles.avatarSelectBtnActive,
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={pickImage}
                style={[
                  styles.avatarSelectBtn,
                  typeof editAvatar === "string" && editAvatar.startsWith("http") && styles.avatarSelectBtnActive,
                  { backgroundColor: colors.surfaceAlt }
                ]}
                disabled={uploading}
                activeOpacity={0.7}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="image-outline" size={22} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              placeholder="Tell others about yourself..."
              placeholderTextColor={colors.textMuted}
              value={editBio}
              onChangeText={setEditBio}
              multiline
            />

            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              <Button title="Save Changes" onPress={handleSave} loading={saving} disabled={uploading} />
              <Button
                title="Cancel"
                variant="ghost"
                color={colors.textMuted}
                onPress={() => setModalVisible(false)}
              />
            </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  headerRow: { flexDirection: "row", alignItems: "center" },
  name: { ...typography.h1, fontSize: 20, color: colors.text },
  handle: { color: colors.textMuted, marginTop: 2, fontSize: 13 },
  bioText: { color: colors.text, fontSize: 13, marginTop: spacing.xs },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: spacing.md },
  statBox: { alignItems: "center" },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  progressCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  progressLabel: { color: colors.text, fontSize: 13, marginBottom: spacing.sm },
  progressTrack: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: colors.gold },
  referralCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: "center" },
  referralLabel: { color: colors.textMuted, fontSize: 12 },
  referralCode: { ...typography.h2, color: colors.primary, marginTop: spacing.xs, letterSpacing: 2 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  badgeChip: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill },
  badgeText: { color: colors.text, fontSize: 12 },
  
  tabsRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: colors.text },
  emptyText: { color: colors.textMuted, textAlign: "center", marginTop: spacing.lg },

  // Modal Styles
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSafeArea: { maxHeight: "92%" },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { ...typography.h1, color: colors.text, fontSize: 18, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: 6, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.sm,
    fontSize: 14,
  },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  avatarSelectBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  avatarSelectBtnActive: { borderColor: colors.primary, backgroundColor: colors.surface },
});
