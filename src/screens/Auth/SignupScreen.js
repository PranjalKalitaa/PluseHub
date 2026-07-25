import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, typography, radius } from "../../theme/colors";

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Name cannot be empty.";
    if (!handle.trim().match(/^[a-zA-Z0-9_.]{3,20}$/)) nextErrors.handle = "Handle must be 3-20 characters and use only letters, numbers, underscores, or dots.";
    if (!email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) nextErrors.email = "Valid email is required.";
    if (password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate() || verificationSent) return;
    setSubmitting(true);
    try {
      const result = await signUp({
        name: name.trim(),
        handle: handle.trim(),
        email: email.trim(),
        password,
        referralCode: referralCode.trim(),
      });
      setVerificationSent(result.needsEmailVerification);
    } catch (error) {
      console.warn("Signup failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.iconBadge}>
            <Ionicons name="sparkles" size={22} color={colors.gold} />
          </View>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Verify your email before you can sign in.</Text>

          {verificationSent && (
            <View style={styles.verificationCard}>
              <Ionicons name="mail-unread-outline" size={22} color={colors.tertiary} style={styles.verificationIcon} />
              <View style={styles.verificationCopy}>
                <Text style={styles.verificationTitle}>Check your inbox</Text>
                <Text style={styles.verificationText}>Open the verification link sent to {email.trim()}, then sign in.</Text>
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Display name</Text>
            <TextInput style={[styles.input, errors.name && styles.inputError]} placeholder="e.g. Alex Rivera" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} editable={!verificationSent} />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Handle</Text>
            <TextInput style={[styles.input, errors.handle && styles.inputError]} placeholder="e.g. alex.codes" placeholderTextColor={colors.textMuted} autoCapitalize="none" value={handle} onChangeText={setHandle} editable={!verificationSent} />
            {errors.handle && <Text style={styles.errorText}>{errors.handle}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="e.g. alex@example.com" placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!verificationSent} />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={[styles.input, styles.passwordInput, errors.password && styles.inputError]} placeholder="Minimum 6 characters" placeholderTextColor={colors.textMuted} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} editable={!verificationSent} />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword((visible) => !visible)} disabled={verificationSent}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Referral code (optional, +20 sparks)</Text>
            <TextInput style={styles.input} placeholder="e.g. YOU-4F2A" placeholderTextColor={colors.textMuted} autoCapitalize="characters" value={referralCode} onChangeText={setReferralCode} editable={!verificationSent} />
          </View>

          <Button title={verificationSent ? "Email sent" : "Create account"} icon={verificationSent ? "mail-outline" : "person-add-outline"} onPress={onSubmit} loading={submitting} disabled={verificationSent} style={styles.createButton} />
          <Button title={verificationSent ? "Go to sign in" : "Back"} variant="ghost" color={colors.textMuted} onPress={() => verificationSent ? navigation.navigate("Login") : navigation.goBack()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  scrollContent: { padding: spacing.lg, justifyContent: "center", flexGrow: 1 },
  iconBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255, 194, 75, 0.12)", alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 12, color: colors.text },
  passwordContainer: { position: "relative" },
  passwordInput: { paddingRight: 40 },
  eyeIcon: { position: "absolute", right: spacing.md, top: 12 },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
  verificationCard: { backgroundColor: "rgba(61, 217, 194, 0.12)", borderColor: colors.tertiary, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, flexDirection: "row", marginBottom: spacing.lg },
  verificationIcon: { marginRight: spacing.sm },
  verificationCopy: { flex: 1 },
  verificationTitle: { color: colors.text, fontWeight: "700", marginBottom: 2 },
  verificationText: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  createButton: { marginTop: spacing.md },
});
