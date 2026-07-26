import * as Notifications from "expo-notifications";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const isExpoGo = 
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.executionEnvironment === "storeClient" ||
  Constants.appOwnership === "expo";

export async function registerPushToken(userId) {
  if (isExpoGo) {
    // In Expo Go SDK 51+, remote push notification tokens require a custom dev build.
    // Suppress token fetching in Expo Go to prevent SDK warning modals.
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    if (userId && token) {
      await supabase.from("users").update({ push_token: token }).eq("id", userId);
    }
    return token;
  } catch (error) {
    return null;
  }
}

export async function scheduleDailyChallengeReminder(hoursFromNow = 12) {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;

    return Notifications.scheduleNotificationAsync({
      content: {
        title: "New PulseHub challenge!",
        body: "Today's prompt is live — film your clip before it expires.",
      },
      trigger: { seconds: hoursFromNow * 3600 },
    });
  } catch (err) {
    return null;
  }
}

export async function cancelAllScheduledReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {}
}
