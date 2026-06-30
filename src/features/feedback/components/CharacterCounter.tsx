import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface CharacterCounterProps {
  current: number;
  max: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
}) => {
  const isNearLimit = current >= max * 0.9;
  const isAtLimit = current >= max;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View
          style={[
            styles.badge,
            isAtLimit && styles.badgeDanger,
            !isAtLimit && isNearLimit && styles.badgeWarning,
          ]}
        >
          <Text
            style={[
              styles.text,
              isAtLimit && styles.textDanger,
              !isAtLimit && isNearLimit && styles.textWarning,
            ]}
          >
            {current.toLocaleString()}
          </Text>
          <Text
            style={[
              styles.separator,
              isAtLimit && styles.textDanger,
              !isAtLimit && isNearLimit && styles.textWarning,
            ]}
          >
            /
          </Text>
          <Text
            style={[
              styles.maxText,
              isAtLimit && styles.textDanger,
              !isAtLimit && isNearLimit && styles.textWarning,
            ]}
          >
            {max.toLocaleString()}
          </Text>
        </View>
        {isNearLimit && (
          <Text
            style={[
              styles.hint,
              isAtLimit ? styles.hintDanger : styles.hintWarning,
            ]}
          >
            {isAtLimit ? "Character limit reached" : "Almost at limit"}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    marginTop: SPACING.sm,
  },
  content: {
    alignItems: "flex-end",
  },
  badge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  badgeWarning: {
    backgroundColor: "#FEF3C7",
  },
  badgeDanger: {
    backgroundColor: "#FEE2E2",
  },
  text: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  textWarning: {
    color: "#D97706",
  },
  textDanger: {
    color: COLORS.danger,
  },
  separator: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    marginHorizontal: 2,
  },
  maxText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
  },
  hint: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.h10,
    marginTop: SPACING.xs,
  },
  hintWarning: {
    color: "#D97706",
  },
  hintDanger: {
    color: COLORS.danger,
  },
});

export default CharacterCounter;
