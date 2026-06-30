import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface PurposeDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const purposes = [
  { label: "Barangay Clearance", icon: "file-text" },
  { label: "Certificate of Indigency", icon: "heart" },
  { label: "Barangay Certification", icon: "award" },
  { label: "Barangay ID", icon: "credit-card" },
  { label: "Business Clearance", icon: "briefcase" },
  { label: "Building Permit", icon: "home" },
  { label: "Complaint / Mediation", icon: "message-square" },
  { label: "Other", icon: "more-horizontal" },
];

const PurposeDropdown: React.FC<PurposeDropdownProps> = ({
  value,
  onChange,
}) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <Pressable style={styles.container} onPress={() => setVisible(true)}>
        <View style={styles.content}>
          {value ? (
            <>
              {(() => {
                const selected = purposes.find((p) => p.label === value);
                return (
                  <>
                    <View style={styles.iconContainer}>
                      <Feather
                        name={(selected?.icon as keyof typeof Feather.glyphMap) || "file"}
                        size={18}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text style={styles.selectedText}>{value}</Text>
                  </>
                );
              })()}
            </>
          ) : (
            <Text style={styles.placeholderText}>Select purpose...</Text>
          )}
        </View>
        <Feather name="chevron-right" size={20} color={COLORS.placeholder} />
      </Pressable>

      <Modal
        transparent
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContainer}>
            <Pressable onPress={() => setVisible(false)}>
              <View style={styles.handle} />
            </Pressable>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Purpose</Text>
              <Text style={styles.modalSubtitle}>
                Choose the type of service you need
              </Text>
            </View>

            <View style={styles.optionsList}>
              {purposes.map((purpose, index) => (
                <Pressable
                  key={purpose.label}
                  style={[
                    styles.optionItem,
                    index === 0 && styles.optionFirst,
                    index === purposes.length - 1 && styles.optionLast,
                    value === purpose.label && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(purpose.label);
                    setVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.optionIconContainer,
                      value === purpose.label && styles.optionIconSelected,
                    ]}
                  >
                    <Feather
                      name={purpose.icon as keyof typeof Feather.glyphMap}
                      size={20}
                      color={
                        value === purpose.label
                          ? COLORS.white
                          : COLORS.primary
                      }
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        value === purpose.label && styles.optionLabelSelected,
                      ]}
                    >
                      {purpose.label}
                    </Text>
                  </View>
                  {value === purpose.label && (
                    <View style={styles.checkContainer}>
                      <Feather
                        name="check-circle"
                        size={22}
                        color={COLORS.primary}
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
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
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  selectedText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  placeholderText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.placeholder,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: SPACING.huge,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  optionsList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  optionFirst: {},
  optionLast: {
    marginBottom: 0,
  },
  optionSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  optionIconSelected: {
    backgroundColor: COLORS.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  optionLabelSelected: {
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.primary,
  },
  checkContainer: {
    marginLeft: SPACING.sm,
  },
});

export default PurposeDropdown;
