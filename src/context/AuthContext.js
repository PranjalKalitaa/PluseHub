import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { supabase } from "../utils/supabase";
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

  const persist = async (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  };

  const signUp = async ({ name, handle, email, password, referralCode }) => {
    const cleanHandle = handle.trim().toLowerCase().replace("@", "");

    try {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("handle", cleanHandle)
        .maybeSingle();

      if (existing) {
        Alert.alert("Handle Taken", "This handle is already registered. Try another one.");
        throw new Error("Handle taken");
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim() || "New User",
            handle: cleanHandle,
            referral_code: referralCode.trim().toUpperCase() || null,
          },
        },
      });

      if (authError) throw authError;

      const authUser = authData?.user;
      if (!authUser) throw new Error("Sign up failed");

      if (authData.session) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        if (profileError) throw profileError;
        await persist(profile);
        await registerPushToken(profile.id);
      } else {
        Alert.alert("Verify Email", "Verification email sent. Please check your inbox before logging in.");
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
      const { data, error } = await supabase
        .from("users")
        .update(patch)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      await persist(data);
    } catch (error) {
      console.error("Update profile error", error);
    }
  };

  const addSparks = async (amount) => {
    if (!user) return;
    await updateUser({ sparks: (user.sparks || 0) + amount });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut, updateUser, addSparks, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
