import React from "react";
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

interface SelectFieldProps {
  value: string;
  placeholder?: string;
  options: string[];
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  style?: ViewStyle;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  value,
  placeholder = "Select an option",
  options,
  onChange,
  label,
  error,
  style,
}) => {
  const [visible, setVisible] = React.useState(false);

  const handleSelect = (option: string) => {
    onChange(option);
    setVisible(false);
  };

  return (
    <>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={[styles.container, error && styles.containerError, style]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={COLORS.placeholder} />
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || "Select Option"}</Text>
              <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={20} color={COLORS.paragraph} />
              </Pressable>
            </View>
            {options.map((option, index) => (
              <Pressable
                key={option}
                style={[
                  styles.option,
                  index === 0 && styles.optionFirst,
                  index === options.length - 1 && styles.optionLast,
                  value === option && styles.optionSelected,
                ]}
                onPress={() => handleSelect(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {value === option && (
                  <Feather name="check" size={18} color={COLORS.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  containerError: {
    borderColor: COLORS.danger,
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
  },
  value: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    marginRight: SPACING.sm,
  },
  placeholder: {
    color: COLORS.placeholder,
  },
  errorText: {
    marginTop: SPACING.xs,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.danger,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.heading,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionFirst: {
    borderTopWidth: 0,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  optionText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  optionTextSelected: {
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.primary,
  },
});

export default SelectField;
