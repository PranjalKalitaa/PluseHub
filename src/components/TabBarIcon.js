import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

const ICONS = {
  Home: { focused: "home", default: "home-outline" },
  Challenges: { focused: "videocam", default: "videocam-outline" },
  Voice: { focused: "mic", default: "mic-outline" },
  Stories: { focused: "book", default: "book-outline" },
  Profile: { focused: "person", default: "person-outline" },
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

  const iconConfig = ICONS[route.name] || { focused: "ellipse", default: "ellipse-outline" };
  const iconName = focused ? iconConfig.focused : iconConfig.default;
  const iconColor = focused ? colors.primary : colors.textMuted;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={{ padding: 4, borderRadius: 14, backgroundColor: focused ? `${colors.primary}22` : "transparent" }}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
    </Animated.View>
  );
}
