import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerPushToken(userId) {
  const isExpoGo = Constants.executionEnvironment === "storeClient" || Constants.appOwnership === "expo";
  if (isExpoGo) return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    if (userId) {
      await supabase.from("users").update({ push_token: token }).eq("id", userId);
    }
    return token;
  } catch (error) {
    console.warn("Push token registration skipped", error);
    return null;
  }
}

export async function scheduleDailyChallengeReminder(hoursFromNow = 12) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "New PulseHub challenge!",
      body: "Today's prompt is live — film your clip before it expires.",
    },
    trigger: { seconds: hoursFromNow * 3600 },
  });
}

export async function cancelAllScheduledReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
