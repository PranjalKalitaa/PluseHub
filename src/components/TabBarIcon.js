import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

const ICONS = {
  Home: { focused: "home-variant", default: "home-variant-outline" },
  Challenges: { focused: "video", default: "video-outline" },
  Voice: { focused: "microphone", default: "microphone-outline" },
  Stories: { focused: "book-open-page-variant", default: "book-open-outline" },
  Profile: { focused: "account-circle", default: "account-circle-outline" },
};

export default function TabBarIcon({ route, focused }) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 0.9,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [focused, scale]);

  const iconConfig = ICONS[route.name] || { focused: "circle", default: "circle-outline" };
  const iconName = focused ? iconConfig.focused : iconConfig.default;
  const iconColor = focused ? colors.primary : colors.textMuted;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={{ padding: 4, borderRadius: 14, backgroundColor: focused ? `${colors.primary}22` : "transparent" }}>
        <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
      </View>
    </Animated.View>
  );
}
