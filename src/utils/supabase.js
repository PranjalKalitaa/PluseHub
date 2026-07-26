import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";

export const SUPABASE_URL = "https://btqwanpsxkjoflwzieqz.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cXdhbnBzeGtqb2Zsd3ppZXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzMyMTQsImV4cCI6MjA5OTM0OTIxNH0.uQ0FGwYgr7ZVac12Cxpyd3SJe_CgiCiigBAFnbABFQU";
export const AUTH_REDIRECT_URL = Linking.createURL("auth/callback");

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

export const uploadFile = async (bucket, filename, localUri) => {
  try {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const sizeMB = blob.size / (1024 * 1024);
    let mimeType = "image/jpeg";
    if (filename.endsWith(".mp4")) {
      mimeType = "video/mp4";
      if (sizeMB > 50) throw new Error("Video file too large (max 50MB)");
    } else if (filename.endsWith(".m4a")) {
      mimeType = "audio/m4a";
      if (sizeMB > 10) throw new Error("Audio file too large (max 10MB)");
    } else if (sizeMB > 2) throw new Error("Image file too large (max 2MB)");
    const { error } = await supabase.storage.from(bucket).upload(filename, blob, { contentType: mimeType, upsert: true });
    if (error) throw error;
    return getPublicUrl(bucket, filename);
  } catch (err) {
    console.warn("Storage upload failed, falling back to local file", err);
    return null;
  }
};

export const getPublicUrl = (bucket, filename) => supabase.storage.from(bucket).getPublicUrl(filename).data.publicUrl;
