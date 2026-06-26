import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface ProfileSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  subtitle,
  children,
  containerStyle,
}) => {
  return (
    <View style={[styles.section, containerStyle]}>
      {/* Section Title */}
      <View style={styles.titleContainer}>
        <View style={styles.titleBadge}>
          <View style={styles.titleDot} />
        </View>
        <View style={styles.titleContent}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.xl,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  titleBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  titleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});

export default ProfileSection;
