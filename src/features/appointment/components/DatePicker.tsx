import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const APPOINTMENT_TIME_ZONE = "Asia/Manila";

const getManilaToday = (): Date => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APPOINTMENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error("Unable to determine the current date in Asia/Manila.");
  }

  return new Date(year, month - 1, day);
};

const getWeekdays = (today: Date): Date[] => {
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    date.setHours(12, 0, 0, 0);
    return date;
  });
};

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const manilaToday = getManilaToday();
  const weekdays = getWeekdays(manilaToday);
  const selectedDate = value ? new Date(value) : null;

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickDates}
      >
        {weekdays.map((date) => {
          const isSelected =
            selectedDate?.toDateString() === date.toDateString();
          const isPastDate = date < manilaToday;

          return (
            <Pressable
              key={date.toISOString()}
              style={[
                styles.quickDateItem,
                isSelected && styles.quickDateItemSelected,
                isPastDate && styles.quickDateItemDisabled,
              ]}
              disabled={isPastDate}
              onPress={() => onChange(date.toISOString())}
            >
              <Text
                style={[
                  styles.quickDateDay,
                  isSelected && styles.quickDateDaySelected,
                  isPastDate && styles.quickDateTextDisabled,
                ]}
              >
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <Text
                style={[
                  styles.quickDateNum,
                  isSelected && styles.quickDateNumSelected,
                  isPastDate && styles.quickDateTextDisabled,
                ]}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={selectedDate ?? manilaToday}
          mode="date"
          minimumDate={manilaToday}
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
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingRight: SPACING.xs,
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
  quickDateItemDisabled: {
    opacity: 0.45,
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
  quickDateTextDisabled: {
    color: COLORS.placeholder,
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
