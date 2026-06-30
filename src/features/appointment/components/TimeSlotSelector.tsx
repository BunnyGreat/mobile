import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { getAvailableSlots } from "../services/appointmentSlot.service";

interface TimeSlotSelectorProps {
  selectedDate: string;
  selectedTime: string;
  onSelect: (value: string) => void;
}

interface Slot {
  value: string;
  label: string;
  available: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  selectedTime,
  onSelect,
}) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate) {
        setSlots([]);
        return;
      }

      setLoading(true);
      const nextSlots = await getAvailableSlots(selectedDate);
      setSlots(nextSlots);
      setLoading(false);
    };

    loadSlots();
  }, [selectedDate]);

  const availableCount = slots.filter((s) => s.available).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="small" />
        <Text style={styles.loadingText}>Loading available slots...</Text>
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="clock" size={24} color={COLORS.placeholder} />
        <Text style={styles.emptyText}>
          No time slots available for this date
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Availability Indicator */}
      <View style={styles.availabilityBadge}>
        <View style={[styles.dot, availableCount > 0 && styles.dotAvailable]} />
        <Text style={styles.availabilityText}>
          {availableCount} slot{availableCount !== 1 ? "s" : ""} available
        </Text>
      </View>

      {/* Time Slots Grid */}
      <View style={styles.slotGrid}>
        {slots.map((slot) => {
          const selected = slot.value === selectedTime;
          const available = slot.available;

          return (
            <Pressable
              key={slot.value}
              onPress={() => available && onSelect(slot.value)}
              disabled={!available}
              style={[
                styles.slotItem,
                selected && styles.slotItemSelected,
                !available && styles.slotItemDisabled,
              ]}
            >
              <Feather
                name="clock"
                size={14}
                color={
                  selected
                    ? COLORS.white
                    : available
                    ? COLORS.primary
                    : COLORS.placeholder
                }
                style={styles.slotIcon}
              />
              <Text
                style={[
                  styles.slotLabel,
                  selected && styles.slotLabelSelected,
                  !available && styles.slotLabelDisabled,
                ]}
              >
                {slot.label}
              </Text>
              {!available && (
                <Text style={styles.unavailableText}>Full</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Selected Slot Display */}
      {selectedTime && (
        <View style={styles.selectedDisplay}>
          <Feather name="check-circle" size={18} color={COLORS.success} />
          <Text style={styles.selectedText}>
            Selected: {selectedTime}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  emptyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  emptyText: {
    marginLeft: SPACING.sm,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.placeholder,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.placeholder,
    marginRight: SPACING.xs,
  },
  dotAvailable: {
    backgroundColor: COLORS.success,
  },
  availabilityText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  slotItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    minWidth: 100,
  },
  slotItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  slotItemDisabled: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
    opacity: 0.6,
  },
  slotIcon: {
    marginRight: SPACING.xs,
  },
  slotLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  slotLabelSelected: {
    color: COLORS.white,
  },
  slotLabelDisabled: {
    color: COLORS.placeholder,
  },
  unavailableText: {
    marginLeft: SPACING.xs,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.h10,
    color: COLORS.placeholder,
  },
  selectedDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: `${COLORS.success}15`,
    borderRadius: 8,
  },
  selectedText: {
    marginLeft: SPACING.xs,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.darkSuccess,
  },
});

export default TimeSlotSelector;
