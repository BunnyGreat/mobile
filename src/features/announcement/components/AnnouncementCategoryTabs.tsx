import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import type { AnnouncementFilter } from "../types/announcement.types";

interface AnnouncementCategoryTabsProps {
  activeCategory: AnnouncementFilter;
  onCategoryChange: (category: AnnouncementFilter) => void;
}

export const AnnouncementCategoryTabs: React.FC<
  AnnouncementCategoryTabsProps
> = ({ activeCategory, onCategoryChange }) => {
  const tabs: Array<{ key: AnnouncementFilter; label: string }> = [
    { key: "latest", label: "Latest" },
    { key: "old", label: "Old" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeCategory === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onCategoryChange(tab.key)}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.placeholder,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
  },
});

export default AnnouncementCategoryTabs;
