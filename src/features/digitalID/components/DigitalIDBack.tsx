import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import type { DigitalIDDisplayData } from "../types/digitalID.types";

const LOGO = require("../../../../assets/images/logo.png");

interface DigitalIDBackProps {
  data: DigitalIDDisplayData;
  showPlaceholder?: boolean;
}

export const DigitalIDBack: React.FC<DigitalIDBackProps> = ({
  data,
  showPlaceholder = false,
}) => {
  const firstAddressLine = [data.residencyInfo, data.purok, data.barangay]
    .filter(Boolean)
    .join(", ");

  const secondAddressLine = [data.municipality, data.province]
    .filter(Boolean)
    .join(", ");

  const residentAddress =
    [firstAddressLine, secondAddressLine].filter(Boolean).join("\n") || "-";

  if (showPlaceholder) {
    return (
      <View style={[styles.container, styles.placeholderContainer]}>
        <View style={styles.skeletonContent} />
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel="Digital ID Back"
      accessibilityRole="image"
    >
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Image source={LOGO} style={styles.watermark} />
      </View>

      <View style={styles.content}>
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.cellDivider]}>
              <Text style={styles.label}>SSS/GSIS:</Text>
              <Text style={styles.value}>-</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.label}>PAGIBIG:</Text>
              <Text style={styles.value}>-</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.cellDivider]}>
              <Text style={styles.label}>TIN:</Text>
              <Text style={styles.value}>-</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.label}>PRECINCT NO.:</Text>
              <Text style={styles.value}>-</Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowTall]}>
            <View style={styles.tableCell}>
              <Text style={styles.inlineLabelValue} numberOfLines={5}>
                <Text style={styles.label}>ADDRESS: </Text>
                <Text style={styles.value}>{residentAddress}</Text>
              </Text>
              <Text
                style={[styles.inlineLabelValue, styles.topSpacing]}
                numberOfLines={1}
              >
                <Text style={styles.label}>CONTACT: </Text>
                <Text style={styles.value}>{data.contactNumber || "-"}</Text>
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.inlineLabelValue} numberOfLines={1}>
                <Text style={styles.label}>BIRTH DATE: </Text>
                <Text style={styles.value}>{data.birthDate || "-"}</Text>
              </Text>
              <Text
                style={[styles.inlineLabelValue, styles.topSpacing]}
                numberOfLines={1}
              >
                <Text style={styles.label}>BIRTH PLACE: </Text>
                <Text style={styles.value}>{data.birthPlace || "-"}</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.emergencyBlock]}>
            <View style={[styles.tableCell, styles.emergencyCell]}>
              <Text style={styles.emergencyHeading} numberOfLines={2}>
                PERSONAL TO BE NOTIFIED IN CASE OF EMERGENCY
              </Text>

              <View style={styles.emergencyRow}>
                <View style={styles.emergencyInnerCell}>
                  <Text style={styles.label}>NAME:</Text>
                  <Text style={styles.blankValue} numberOfLines={1}>
                    {" "}
                  </Text>
                </View>
                <View style={styles.emergencyInnerCell}>
                  <Text style={styles.label}>CONTACT:</Text>
                  <Text style={styles.blankValue} numberOfLines={1}>
                    {" "}
                  </Text>
                </View>
              </View>

              <View style={styles.emergencyAddressRow}>
                <Text style={styles.label}>ADDRESS:</Text>
                <Text style={styles.blankValue} numberOfLines={2}>
                  {" "}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.yellowBox}>
          <Text style={styles.yellowText} numberOfLines={2}>
            THIS IS TO CERTIFY THAT THE PERSON WHOSE NAME, PHOTO AND SIGNATURE
            APPEAR HERE WITH IS A RESIDENT OF THIS LOCAL GOVERNMENT UNIT.
          </Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>SIGNATURE</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>DENNIS L. HERNANDEZ</Text>
            <Text style={styles.signatureSub}>PUNONG BARANGAY</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: SPACING.sm,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  watermarkContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.08,
  },
  watermark: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  content: {
    zIndex: 1,
    flex: 1,
    justifyContent: "flex-start",
  },
  skeletonContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 78, 159, 0.05)",
    borderRadius: SPACING.sm,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 28,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },
  tableRowBottom: {
    flexDirection: "row",
    minHeight: 28,
  },
  tableRowTall: {
    minHeight: 48,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 1,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  cellDivider: {
    borderRightWidth: 1,
    borderRightColor: COLORS.primary,
  },
  label: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body11,
    letterSpacing: 0.9,
    marginBottom: 2,
  },
  inlineLabelValue: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  topSpacing: {
    marginTop: SPACING.xs,
  },
  value: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    lineHeight: FONT_SIZE.body12 * 1.05,
  },
  emergencyHeading: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body11,
    textAlign: "center",
    letterSpacing: 0.8,
    marginTop: 0,
    marginBottom: SPACING.xs / 2,
  },
  emergencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.xs,
    marginTop: 0,
  },
  emergencyBlock: {
    borderBottomWidth: 0,
    paddingVertical: 0,
  },
  emergencyCell: {
    flex: 1,
    justifyContent: "flex-start",
  },
  emergencyInnerCell: {
    flex: 1,
  },
  emergencyAddressRow: {
    paddingVertical: 0,
    marginTop: SPACING.xs / 4,
  },
  blankValue: {
    color: "transparent",
    height: SPACING.xs,
  },
  yellowBox: {
    backgroundColor: "#FFD700",
    borderRadius: 6,
    paddingVertical: SPACING.xs / 2,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.xs / 2,
    marginBottom: SPACING.xs / 2,
  },
  yellowText: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body11,
    textAlign: "center",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.xs,
    marginTop: SPACING.xs / 2,
  },
  signatureBlock: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.xs / 2,
  },
  signatureLine: {
    width: "80%",
    height: 1,
    backgroundColor: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  signatureLabel: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body11,
    textAlign: "center",
    letterSpacing: 0.6,
  },
  signatureName: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body11,
    textAlign: "center",
    marginBottom: SPACING.xs / 2,
  },
  signatureSub: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body11,
    textAlign: "center",
    letterSpacing: 0.6,
  },
});
