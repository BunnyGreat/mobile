import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import type { FilterType } from "../types/status.types";

interface StatusFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: Array<{ key: FilterType; label: string }> = [
    { key: "all", label: "All" },
    { key: "certificates", label: "Certificates" },
    { key: "appointments", label: "Appointments" },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <TouchableOpacity
            key={filter.key}
            activeOpacity={0.8}
            style={[styles.chip, isActive && styles.activeChip]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text style={[styles.chipText, isActive && styles.activeChipText]}>
              {filter.label}
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
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  activeChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  activeChipText: {
    color: COLORS.white,
  },
});

export default StatusFilter;
