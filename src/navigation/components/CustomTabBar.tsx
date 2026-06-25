import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, SHADOWS } from "../..//theme";

const digitalIdIcon = require("../../../assets/icons/digital-id.png");

type IconName = "home" | "bell" | "clipboard" | "settings";

type TabName = "Home" | "Notifications" | "DigitalID" | "Status" | "Settings";

interface TabItem {
  name: TabName;
  label: string;
  icon?: IconName;
}

const TAB_ITEMS: TabItem[] = [
  { name: "Home", label: "Home", icon: "home" },
  { name: "Notifications", label: "Notifications", icon: "bell" },
  { name: "DigitalID", label: "Digital ID" },
  { name: "Status", label: "Status", icon: "clipboard" },
  { name: "Settings", label: "Settings", icon: "settings" },
];

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tabItem = TAB_ITEMS[index];
          if (!tabItem) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          const isDigitalTab = tabItem.name === "DigitalID";
          const labelColor = isDigitalTab
            ? COLORS.primary
            : isFocused
              ? COLORS.primary
              : COLORS.paragraph;
          const iconColor = isFocused ? COLORS.primary : COLORS.paragraph;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabButton, isDigitalTab && styles.centerTabButton]}
              activeOpacity={0.7}
            >
              <View
                style={
                  isDigitalTab
                    ? [styles.centerButton, styles.centerButtonFloating]
                    : styles.iconWrapper
                }
              >
                {isDigitalTab ? (
                  <Image source={digitalIdIcon} style={styles.digitalIdIcon} />
                ) : (
                  <Feather name={tabItem.icon!} size={22} color={iconColor} />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: labelColor },
                  isFocused && !isDigitalTab && styles.tabLabelActive,
                  isDigitalTab && styles.centerLabel,
                ]}
                numberOfLines={1}
              >
                {tabItem.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 6,
    position: "relative",
  },
  centerTabButton: {
    paddingTop: 32,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  centerButtonFloating: {
    position: "absolute",
    top: -28,
    zIndex: 20,
  },
  tabIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  tabIconActive: {
    tintColor: COLORS.primary,
  },
  digitalIdIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: COLORS.white,
  },
  tabLabel: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    marginTop: 2,
    textAlign: "center",
  },
  tabLabelActive: {
    fontFamily: FONT_FAMILY.semibold,
  },
  centerLabel: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    marginTop: 2,
  },
});

export default CustomTabBar;
