import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const handleChange = (_event: unknown, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const nextDate = new Date(selectedDate);
      nextDate.setHours(12, 0, 0, 0);
      onChange(nextDate.toISOString());
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
        <View style={styles.iconContainer}>
          <Feather name="calendar" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          {value ? (
            <Text style={styles.selectedDate}>{formatDate(value)}</Text>
          ) : (
            <Text style={styles.placeholder}>Select a date</Text>
          )}
        </View>
        <View style={styles.arrowContainer}>
          <Feather name="chevron-right" size={20} color={COLORS.placeholder} />
        </View>
      </Pressable>

      {/* Quick Date Selection */}
      <View style={styles.quickDates}>
        {[1, 2, 3].map((daysAhead) => {
          const date = new Date();
          date.setDate(date.getDate() + daysAhead);
          const dateStr = date.toISOString();
          const isSelected = value && new Date(value).toDateString() === date.toDateString();

          return (
            <Pressable
              key={daysAhead}
              style={[styles.quickDateItem, isSelected && styles.quickDateItemSelected]}
              onPress={() => {
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + daysAhead);
                nextDate.setHours(12, 0, 0, 0);
                onChange(nextDate.toISOString());
              }}
            >
              <Text style={[styles.quickDateDay, isSelected && styles.quickDateDaySelected]}>
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <Text style={[styles.quickDateNum, isSelected && styles.quickDateNumSelected]}>
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  input: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  selectedDate: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  placeholder: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.placeholder,
  },
  arrowContainer: {
    marginLeft: SPACING.sm,
  },
  quickDates: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  quickDateItem: {
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    minWidth: 60,
  },
  quickDateItemSelected: {
    backgroundColor: COLORS.primary,
  },
  quickDateDay: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    marginBottom: 2,
  },
  quickDateDaySelected: {
    color: COLORS.white,
  },
  quickDateNum: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
  },
  quickDateNumSelected: {
    color: COLORS.white,
  },
});

export default DatePicker;
