import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import AppInput from "../../../../../components/ui/AppInput";
import AppButton from "../../../../../components/ui/AppButton";
import { SPACING, COLORS, FONT_FAMILY, FONT_SIZE } from "../../../../../theme";

type ResidenceInfoFormState = {
  blockNumber: string;
  lotNumber: string;
  subdivision: string;
  barangay: string;
};

type Props = {
  onNext?: () => void;
  onBack?: () => void;
};

const barangayOptions = ["San Isidro", "San Roque", "Poblacion", "Mabini"];

const ResidenceInfoForm: React.FC<Props> = ({ onNext, onBack }) => {
  const [form, setForm] = useState<ResidenceInfoFormState>({
    blockNumber: "",
    lotNumber: "",
    subdivision: "",
    barangay: "San Isidro",
  });
  const [barangayOpen, setBarangayOpen] = useState(false);

  const handleChange = (key: keyof ResidenceInfoFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (onNext) onNext();
  };

  const handleBack = () => {
    if (onBack) onBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>STEP 3 OF 4</Text>
          <Text style={styles.progressText}>75% Complete</Text>
        </View>
        <View style={styles.progressBarRow}>
          <View
            style={[styles.progressSegment, styles.progressSegmentActive]}
          />
          <View
            style={[styles.progressSegment, styles.progressSegmentActive]}
          />
          <View
            style={[styles.progressSegment, styles.progressSegmentActive]}
          />
          <View style={[styles.progressSegment, styles.progressSegmentLast]} />
        </View>
      </View>

      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../../../../../assets/icons/location.png")}
            resizeMode="contain"
            style={styles.iconImage}
          />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Residence Details</Text>
          <Text style={styles.headerSubtitle}>
            Please provide your current address and residency information below.
          </Text>
        </View>
      </View>

      <AppInput
        label="Block Number"
        placeholder="e.g. Blk 24"
        value={form.blockNumber}
        onChangeText={(value) => handleChange("blockNumber", value)}
      />
      <AppInput
        label="Lot Number"
        placeholder="e.g. Lot 12"
        value={form.lotNumber}
        onChangeText={(value) => handleChange("lotNumber", value)}
      />
      <AppInput
        label="Phase / Subdivision"
        placeholder="e.g. Phase 3A / Eastwood Greenview"
        value={form.subdivision}
        onChangeText={(value) => handleChange("subdivision", value)}
      />

      <View style={styles.dropdownWrapper}>
        <Text style={styles.fieldLabel}>Barangay</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          activeOpacity={0.8}
          onPress={() => setBarangayOpen((prev) => !prev)}
        >
          <Text style={styles.dropdownButtonText}>{form.barangay}</Text>
          <Text style={styles.dropdownChevron}>{barangayOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {barangayOpen && (
          <View style={styles.dropdownMenu}>
            {barangayOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownOption}
                activeOpacity={0.8}
                onPress={() => {
                  handleChange("barangay", option);
                  setBarangayOpen(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <AppInput
        label="Municipality"
        value="Rodriguez (Montalban)"
        editable={false}
        inputStyle={{ backgroundColor: COLORS.background }}
      />
      <AppInput
        label="Province"
        value="Rizal"
        editable={false}
        inputStyle={{ backgroundColor: COLORS.background }}
      />

      <View style={styles.actionsRow}>
        <AppButton
          label="Next Step"
          onPress={handleNext}
          variant="primary"
          fullWidth
        />
      </View>
      <TouchableOpacity
        style={styles.backButtonTouch}
        activeOpacity={0.8}
        onPress={handleBack}
      >
        <Text style={styles.backText}>← Back to Previous Step</Text>
      </TouchableOpacity>

      <View style={styles.noticeCard}>
        <View style={styles.noticeIcon}>
          <Image
            source={require("../../../../../assets/icons/shield-check.png")}
            resizeMode="contain"
            style={styles.noticeIconImage}
          />
        </View>
        <Text style={styles.noticeText}>
          Your data is encrypted and protected under the Data Privacy Act of
          2012. We only use this information for official Barangay services.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  stepText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
  },
  progressText: {
    color: COLORS.paragraph,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
  },
  progressBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.border,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  progressSegmentLast: {
    backgroundColor: COLORS.border,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: SPACING.lg,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.h20,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  dropdownWrapper: {
    marginBottom: SPACING.md,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.md,
    backgroundColor: COLORS.white,
  },
  dropdownButtonText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
  },
  dropdownChevron: {
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  dropdownMenu: {
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.md,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  dropdownOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  dropdownOptionText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.heading,
  },
  actionsRow: {
    marginTop: SPACING.lg,
  },
  backButtonTouch: {
    marginTop: SPACING.md,
    alignSelf: "center",
  },
  backText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  noticeCard: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: SPACING.xl,
    backgroundColor: "rgba(249, 246, 234, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(249, 232, 153, 0.5)",
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  noticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeIconImage: {
    width: 18,
    height: 18,
  },
  noticeText: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body14 * 1.6,
  },
});

export default ResidenceInfoForm;
