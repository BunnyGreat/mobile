import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const AppointmentFooter: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Important Notice */}
      <View style={styles.noticeCard}>
        <View style={styles.noticeIconContainer}>
          <Feather name="info" size={18} color={COLORS.primary} />
        </View>
        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>Before You Book</Text>
          <Text style={styles.noticeText}>
            Please ensure all uploaded documents are valid and readable.
          </Text>
        </View>
      </View>

      {/* Guidelines */}
      <View style={styles.guidelinesContainer}>
        <View style={styles.guidelineItem}>
          <View style={styles.guidelineNumber}>
            <Text style={styles.guidelineNumberText}>1</Text>
          </View>
          <Text style={styles.guidelineText}>
            Arrive at least 15 minutes before your scheduled appointment
          </Text>
        </View>

        <View style={styles.guidelineItem}>
          <View style={styles.guidelineNumber}>
            <Text style={styles.guidelineNumberText}>2</Text>
          </View>
          <Text style={styles.guidelineText}>
            Late arrivals may be rescheduled depending on office availability
          </Text>
        </View>

        <View style={styles.guidelineItem}>
          <View style={styles.guidelineNumber}>
            <Text style={styles.guidelineNumberText}>3</Text>
          </View>
          <Text style={styles.guidelineText}>
            Bring a valid ID for verification at the barangay office
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactCard}>
        <Feather name="phone" size={16} color={COLORS.primary} />
        <Text style={styles.contactText}>
          Need help? Contact the Barangay Office at (02) 8888-8888
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  noticeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    marginBottom: 4,
  },
  noticeText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    lineHeight: 18,
  },
  guidelinesContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  guidelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  guidelineNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  guidelineNumberText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
  },
  guidelineText: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
  },
  contactText: {
    marginLeft: SPACING.sm,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    textAlign: "center",
  },
});

export default AppointmentFooter;
