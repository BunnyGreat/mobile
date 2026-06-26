import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface InformationRowProps {
  label: string;
  value: string;
  icon?: string;
}

const InformationRow: React.FC<InformationRowProps> = ({
  label,
  value,
  icon,
}) => {
  return (
    <View style={styles.row}>
      {icon ? (
        <View style={styles.iconContainer}>
          <Feather name={icon as any} size={18} color={COLORS.primary} />
        </View>
      ) : null}
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "Not Available"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    lineHeight: 20,
  },
});

export default InformationRow;
