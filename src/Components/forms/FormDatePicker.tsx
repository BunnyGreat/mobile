import React, { useState } from "react";
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export interface FormDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  value = new Date(),
  onChange,
  label,
  containerStyle,
  accessibilityLabel,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);

  const handleIncrement = (field: "day" | "month" | "year", amount: number) => {
    const nextDate = new Date(selectedDate);
    if (field === "day") {
      nextDate.setDate(nextDate.getDate() + amount);
    } else if (field === "month") {
      nextDate.setMonth(nextDate.getMonth() + amount);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + amount);
    }
    setSelectedDate(nextDate);
  };

  const handleConfirm = () => {
    setShowPicker(false);
    onChange(selectedDate);
  };

  const handleCancel = () => {
    setShowPicker(false);
    setSelectedDate(value);
  };

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? "Date picker"}
      style={containerStyle}
    >
      {label ? (
        <Text
          style={{
            marginBottom: SPACING.xs,
            color: COLORS.heading,
            fontFamily: FONT_FAMILY.medium,
            fontSize: FONT_SIZE.body12,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
        style={{
          padding: SPACING.md,
          backgroundColor: COLORS.white,
          borderColor: COLORS.border,
          borderWidth: 1,
          borderRadius: SPACING.sm,
        }}
      >
        <Text
          style={{
            color: COLORS.paragraph,
            fontFamily: FONT_FAMILY.regular,
            fontSize: FONT_SIZE.body14,
          }}
        >
          {selectedDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showPicker ? (
        <View
          style={{
            marginTop: SPACING.md,
            padding: SPACING.md,
            backgroundColor: COLORS.white,
            borderColor: COLORS.border,
            borderWidth: 1,
            borderRadius: SPACING.sm,
          }}
        >
          {(["day", "month", "year"] as const).map((field) => {
            const labelText =
              field === "day" ? "Day" : field === "month" ? "Month" : "Year";
            const valueText =
              field === "day"
                ? selectedDate.getDate()
                : field === "month"
                  ? selectedDate.getMonth() + 1
                  : selectedDate.getFullYear();
            return (
              <View
                key={field}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: SPACING.sm,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.regular,
                    color: COLORS.heading,
                    fontSize: FONT_SIZE.body14,
                  }}
                >
                  {labelText}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => handleIncrement(field, -1)}
                    activeOpacity={0.7}
                    style={{ padding: SPACING.xs, marginRight: SPACING.sm }}
                  >
                    <Text
                      style={{
                        fontSize: FONT_SIZE.body14,
                        color: COLORS.primary,
                      }}
                    >
                      -
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: FONT_SIZE.body14,
                      fontFamily: FONT_FAMILY.semibold,
                      color: COLORS.heading,
                      minWidth: 36,
                      textAlign: "center",
                    }}
                  >
                    {valueText}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleIncrement(field, 1)}
                    activeOpacity={0.7}
                    style={{ padding: SPACING.xs, marginLeft: SPACING.sm }}
                  >
                    <Text
                      style={{
                        fontSize: FONT_SIZE.body14,
                        color: COLORS.primary,
                      }}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: SPACING.sm,
            }}
          >
            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.7}
              style={{ marginRight: SPACING.md, padding: SPACING.sm }}
            >
              <Text
                style={{
                  color: COLORS.paragraph,
                  fontFamily: FONT_FAMILY.semibold,
                  fontSize: FONT_SIZE.body14,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.7}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: SPACING.sm,
                padding: SPACING.sm,
                paddingHorizontal: SPACING.lg,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontFamily: FONT_FAMILY.semibold,
                  fontSize: FONT_SIZE.body14,
                }}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default FormDatePicker;
