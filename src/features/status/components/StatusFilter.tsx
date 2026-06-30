import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING, SHADOWS } from "../../../theme";
import type { FilterType } from "../types/status.types";

interface StatusFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: Array<{ key: FilterType; label: string; count?: number }> = [
    { key: "all", label: "All" },
    { key: "certificates", label: "Certificates" },
    { key: "appointments", label: "Appointments" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              activeOpacity={0.75}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 4,
  },
  chip: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: "center",
    borderRadius: 10,
  },
  activeChip: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  chipText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  activeChipText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
  },
});

export default StatusFilter;
