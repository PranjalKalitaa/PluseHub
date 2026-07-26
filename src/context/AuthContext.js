import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Linking } from "react-native";
import { AUTH_REDIRECT_URL, supabase } from "../utils/supabase";
import { registerPushToken } from "../utils/notifications";

const AuthContext = createContext(null);
const SESSION_KEY = "pulsehub:session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from("users").select("*").eq("id", session.user.id).single().then(({ data }) => {
          setUser(data || null);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        setUser(data || null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


  useEffect(() => {
    const completeAuthRedirect = async (url) => {
      if (!url?.startsWith(AUTH_REDIRECT_URL)) return;
      try {
        const parsedUrl = new URL(url);
        const params = new URLSearchParams(`${parsedUrl.search}${parsedUrl.hash.replace("#", "&")}`);
        const code = params.get("code");
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const { error } = code
          ? await supabase.auth.exchangeCodeForSession(url)
          : await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) throw error;
      } catch (error) {
        console.error("Unable to complete authentication redirect", error);
        Alert.alert("Sign-in link failed", "This link is invalid or has expired. Please request a new one.");
      }
    };
    Linking.getInitialURL().then(completeAuthRedirect);
    const subscription = Linking.addEventListener("url", ({ url }) => completeAuthRedirect(url));
    return () => subscription.remove();
  }, []);
  const persist = async (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  };

  const signUp = async ({ name, handle, email, password, referralCode = "" }) => {
    const cleanHandle = handle.trim().toLowerCase().replace("@", "");

    try {
      // 1. Duplicate Username/Handle Check
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("handle", cleanHandle)
        .maybeSingle();

      if (existing) {
        Alert.alert("Handle Taken", "This handle (@" + cleanHandle + ") is already registered. Please choose another one.");
        throw new Error("Handle taken");
      }

      // 2. Supabase Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: AUTH_REDIRECT_URL,
          data: {
            name: name.trim() || "New User",
            handle: cleanHandle,
            referral_code: referralCode.trim().toUpperCase() || "",
          },
        },
      });

      if (authError) throw authError;

      const authUser = authData?.user;
      if (!authUser) throw new Error("Sign up failed");

      if (authData.session) {
        // Fetch or create profile fallback
        let { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (!profile) {
          // Manual fallback insert if trigger was delayed
          const refCode = authUser.id.substring(0, 8).toUpperCase();
          const { data: newProfile } = await supabase
            .from("users")
            .insert({
              id: authUser.id,
              handle: cleanHandle,
              name: name.trim() || "New User",
              avatar: "⚡",
              bio: "Hey there! I am using PulseHub.",
              sparks: 50,
              referral_code: refCode,
            })
            .select()
            .single();

          profile = newProfile;
        }

        await persist(profile);
        if (profile?.id) await registerPushToken(profile.id);
      } else {
        Alert.alert("Account Created! 📧", "A verification email has been sent to " + email + ". Please confirm your email to complete registration.");
      }

      return { needsEmailVerification: !authData.session };
    } catch (error) {
      console.error("Signup error", error);
      if (error.message !== "Handle taken") {
        Alert.alert("Sign Up Error", error.message || "Could not complete signup. Try again.");
      }
      throw error;
    }
  };

  const logIn = async ({ email, password }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) throw authError;

      const authUser = authData?.user;
      if (!authUser) throw new Error("Login failed");

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Your profile is still being created. Please try again in a moment.");

      await persist(profile);
      await registerPushToken(profile.id);
      return profile;
    } catch (error) {
      console.error("Login error", error);
      Alert.alert("Login Failed", error.message || "Invalid email or password.");
      throw error;
    }
  };


  const sendEmailSignInLink = async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: AUTH_REDIRECT_URL, shouldCreateUser: false },
      });
      if (error) throw error;
      Alert.alert("Email sent", "Open the sign-in link on this phone to continue.");
    } catch (error) {
      console.error("Email sign-in link error", error);
      Alert.alert("Could not send link", error.message || "Try again in a moment.");
      throw error;
    }
  };

  const logInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: AUTH_REDIRECT_URL, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Google sign-in could not be started.");
      await Linking.openURL(data.url);
    } catch (error) {
      console.error("Google sign-in error", error);
      Alert.alert("Google sign-in failed", error.message || "Try again in a moment.");
      throw error;
    }
  };
  const logOut = async () => {
    await supabase.auth.signOut();
    await persist(null);
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: "pulsehub://reset-password",
      });
      if (error) throw error;
      Alert.alert("Reset Link Sent", "We sent a password reset link to your email.");
    } catch (error) {
      console.error("Reset password error", error);
      Alert.alert("Reset Failed", error.message || "Could not send reset link. Try again.");
      throw error;
    }
  };

  const updateUser = async (patch) => {
    if (!user) return;
    try {
      const updated = { ...user, ...patch };
      await persist(updated);

      const { data, error } = await supabase
        .from("users")
        .update(patch)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      if (data) await persist(data);
      return data || updated;
    } catch (error) {
      console.error("Update profile error", error);
      throw error;
    }
  };

  const addSparks = async (amount) => {
    if (!user) return;
    await updateUser({ sparks: (user.sparks || 0) + amount });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, sendEmailSignInLink, logInWithGoogle, logOut, updateUser, addSparks, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
