import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CLEARANCE_REQUIREMENTS } from "../../constants/requirements";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

interface CertificateSectionProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isFirst?: boolean;
}

export const CertificateSection: React.FC<CertificateSectionProps> = ({
  icon,
  title,
  subtitle,
  children,
  isFirst = false,
}) => (
  <View style={[styles.sectionBlock, isFirst && styles.sectionBlockFirst]}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBadge}>
        <Feather name={icon} size={16} color={COLORS.primary} />
      </View>
      <View style={styles.sectionTitleGroup}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

export const RequiredDocuments: React.FC = () => (
  <CertificateSection icon="check-circle" title="Required Documents">
    {CLEARANCE_REQUIREMENTS.length ? (
      <View style={styles.requirementsList}>
        {CLEARANCE_REQUIREMENTS.map((requirement, index) => (
          <View key={requirement} style={styles.requirementRow}>
            <View style={styles.requirementNumber}>
              <Text style={styles.requirementNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.requirementText}>{requirement}</Text>
          </View>
        ))}
      </View>
    ) : (
      <View style={styles.emptyRequirements}>
        <Feather
          name="check-circle"
          size={24}
          color={COLORS.success}
          style={styles.emptyRequirementsIcon}
        />
        <Text style={styles.emptyRequirementsText}>
          No additional documents required
        </Text>
      </View>
    )}
  </CertificateSection>
);

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: SPACING.xxl + 4,
  },
  sectionBlockFirst: {
    marginTop: SPACING.sm,
  },
  sectionContent: {
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}0D`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sectionTitleGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.h16,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    marginTop: 2,
    lineHeight: 17,
  },
  requirementsList: {
    gap: SPACING.md,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    padding: SPACING.md,
  },
  requirementNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}12`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  requirementNumberText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
  },
  requirementText: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: 20,
    paddingTop: 2,
  },
  emptyRequirements: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyRequirementsIcon: {
    marginBottom: SPACING.sm,
  },
  emptyRequirementsText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.placeholder,
    textAlign: "center",
  },
});
