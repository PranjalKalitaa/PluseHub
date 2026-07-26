import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeFeedScreen from "../screens/Home/HomeFeedScreen";
import ChallengesScreen from "../screens/Challenges/ChallengesScreen";
import RecordChallengeScreen from "../screens/Challenges/RecordChallengeScreen";
import VoiceFeedScreen from "../screens/Voice/VoiceFeedScreen";
import RecordVoiceScreen from "../screens/Voice/RecordVoiceScreen";
import StoriesScreen from "../screens/Stories/StoriesScreen";
import NewStoryScreen from "../screens/Stories/NewStoryScreen";
import StoryThreadScreen from "../screens/Stories/StoryThreadScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import LeaderboardScreen from "../screens/Leaderboard/LeaderboardScreen";
import NotificationsScreen from "../screens/Notifications/NotificationsScreen";

import TabBarIcon from "../components/TabBarIcon";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ChallengesStack = createNativeStackNavigator();
const VoiceStack = createNativeStackNavigator();
const StoriesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const stackScreenOptions = { headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false };

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeFeed" component={HomeFeedScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="RecordVoice" component={RecordVoiceScreen} options={{ title: "Record" }} />
      <HomeStack.Screen name="StoryThread" component={StoryThreadScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
}

function ChallengesStackScreen() {
  return (
    <ChallengesStack.Navigator screenOptions={stackScreenOptions}>
      <ChallengesStack.Screen name="ChallengesMain" component={ChallengesScreen} options={{ headerShown: false }} />
      <ChallengesStack.Screen name="RecordChallenge" component={RecordChallengeScreen} options={{ title: "Record" }} />
      <ChallengesStack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: false }} />
    </ChallengesStack.Navigator>
  );
}

function VoiceStackScreen() {
  return (
    <VoiceStack.Navigator screenOptions={stackScreenOptions}>
      <VoiceStack.Screen name="VoiceMain" component={VoiceFeedScreen} options={{ headerShown: false }} />
      <VoiceStack.Screen name="RecordVoice" component={RecordVoiceScreen} options={{ title: "Record" }} />
    </VoiceStack.Navigator>
  );
}

function StoriesStackScreen() {
  return (
    <StoriesStack.Navigator screenOptions={stackScreenOptions}>
      <StoriesStack.Screen name="StoriesMain" component={StoriesScreen} options={{ headerShown: false }} />
      <StoriesStack.Screen name="NewStory" component={NewStoryScreen} options={{ title: "New story" }} />
      <StoriesStack.Screen name="StoryThread" component={StoryThreadScreen} options={{ headerShown: false }} />
    </StoriesStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: false }} />
    </ProfileStack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabBarIcon route={route} focused={focused} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingTop: 6,
          paddingBottom: bottomPadding,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginBottom: 2 },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Challenges" component={ChallengesStackScreen} />
      <Tab.Screen name="Voice" component={VoiceStackScreen} />
      <Tab.Screen name="Stories" component={StoriesStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}
