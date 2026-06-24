import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import AppInput from "../../../components/ui/AppInput";
import AppButton from "../../../components/ui/AppButton";
import { SPACING, COLORS, FONT_FAMILY, FONT_SIZE } from "../../../theme";

type Props = {
  defaultValues?: any;
  onSubmit?: (data: any) => void;
  onBack?: () => void;
};

const PersonalInformationForm: React.FC<Props> = ({
  defaultValues = {},
  onSubmit,
  onBack,
}) => {
  const [firstName, setFirstName] = useState(defaultValues.firstName || "");
  const [middleName, setMiddleName] = useState(defaultValues.middleName || "");
  const [lastName, setLastName] = useState(defaultValues.lastName || "");
  const [suffix, setSuffix] = useState(defaultValues.suffix || "");

  const [dateOfBirth, setDateOfBirth] = useState(
    defaultValues.dateOfBirth || "",
  );
  const [contactNumber, setContactNumber] = useState(
    defaultValues.contactNumber || "",
  );

  const [gender, setGender] = useState<string>(defaultValues.gender || "male");
  const [civilStatus, setCivilStatus] = useState<string>(
    defaultValues.civilStatus || "single",
  );
  const [statusOpen, setStatusOpen] = useState(false);

  const formatContactNumber = (digits: string) => {
    const cleaned = digits.replace(/[^0-9]/g, "").slice(0, 10);
    let formatted = "";
    if (cleaned.length > 0) formatted += "+63 ";
    if (cleaned.length <= 3) formatted += cleaned;
    else if (cleaned.length <= 6)
      formatted += `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    else
      formatted += `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return formatted.trim();
  };

  const formatDOB = (digits: string) => {
    const cleaned = digits.replace(/[^0-9]/g, "").slice(0, 8);
    let out = "";
    if (cleaned.length > 0) out += cleaned.slice(0, 2);
    if (cleaned.length > 2) out += "/" + cleaned.slice(2, 4);
    if (cleaned.length > 4) out += "/" + cleaned.slice(4, 8);
    return out;
  };

  const formattedContact = useMemo(
    () => formatContactNumber(contactNumber),
    [contactNumber],
  );
  const formattedDOB = useMemo(() => formatDOB(dateOfBirth), [dateOfBirth]);

  const handleNext = () => {
    const payload = {
      firstName,
      middleName,
      lastName,
      suffix,
      dateOfBirth: formattedDOB,
      contactNumber: formattedContact,
      gender,
      civilStatus,
    };
    if (onSubmit) onSubmit(payload);
  };

  return (
    <View>
      <View style={styles.photoSection}>
        <View style={styles.photoPlaceholder}>
          <Image
            source={require("../../../../assets/icons/user.png")}
            style={styles.photoImage}
          />
        </View>
        <Text style={styles.photoLabel}>No Photo Selected</Text>

        <TouchableOpacity
          style={styles.cameraButton}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <Image
            source={require("../../../../assets/icons/camera.png")}
            style={styles.cameraIcon}
          />
        </TouchableOpacity>

        <View style={styles.photoActionsRow}>
          <TouchableOpacity
            style={[styles.photoActionButton, styles.photoActionPrimary]}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Text style={styles.photoActionPrimaryText}>Upload Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.photoActionButton, styles.photoActionSecondary]}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Text style={styles.photoActionSecondaryText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AppInput
        label="First Name"
        placeholder="e.g. Juan"
        value={firstName}
        onChangeText={setFirstName}
      />
      <AppInput
        label="Middle Name"
        placeholder="e.g. Santos"
        value={middleName}
        onChangeText={setMiddleName}
      />
      <AppInput
        label="Last Name"
        placeholder="e.g. Dela Cruz"
        value={lastName}
        onChangeText={setLastName}
      />
      <AppInput
        label="Suffix (Optional)"
        placeholder="e.g. Jr., Sr."
        value={suffix}
        onChangeText={setSuffix}
      />

      <View style={styles.dateOfBirthContainer}>
        <Text style={styles.fieldLabel}>Date of Birth</Text>
        <TextInput
          value={formattedDOB}
          onChangeText={(t) => setDateOfBirth(t.replace(/[^0-9]/g, ""))}
          placeholder="MM/DD/YYYY"
          placeholderTextColor={COLORS.border}
          keyboardType="numeric"
          style={styles.dateInput}
        />
      </View>

      <View style={styles.contactContainer}>
        <Text style={styles.fieldLabel}>Contact Number</Text>
        <View style={styles.contactInputRow}>
          <View style={styles.countryPrefix}>
            <Text style={styles.countryPrefixText}>🇵🇭 +63</Text>
          </View>
          <TextInput
            value={formattedContact.replace(/^\+63\s*/, "")}
            onChangeText={(t) => setContactNumber(t)}
            placeholder="923 323 2323"
            placeholderTextColor={COLORS.border}
            keyboardType="phone-pad"
            style={styles.contactInput}
            maxLength={14}
          />
        </View>
      </View>

      <View style={styles.segmentedControl}>
        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.segmentRow}>
          {[
            { key: "male", label: "Male" },
            { key: "female", label: "Female" },
            { key: "other", label: "Other" },
          ].map((option) => {
            const active = gender === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                activeOpacity={0.8}
                onPress={() => setGender(option.key)}
              >
                <Text
                  style={
                    active
                      ? styles.segmentItemTextActive
                      : styles.segmentItemText
                  }
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.fieldLabel}>Civil Status</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          activeOpacity={0.8}
          onPress={() => setStatusOpen((s) => !s)}
        >
          <Text style={styles.dropdownButtonText}>
            {civilStatus === "single"
              ? "Single"
              : civilStatus === "married"
                ? "Married"
                : civilStatus === "widowed"
                  ? "Widowed"
                  : civilStatus === "separated"
                    ? "Separated"
                    : civilStatus === "divorced"
                      ? "Divorced"
                      : "Select status"}
          </Text>
        </TouchableOpacity>
        {statusOpen && (
          <View style={styles.dropdownMenu}>
            {["single", "married", "widowed", "separated", "divorced"].map(
              (key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.dropdownOption}
                  activeOpacity={0.8}
                  onPress={() => {
                    setCivilStatus(key);
                    setStatusOpen(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <AppButton
          label="Next Step"
          onPress={handleNext}
          variant="primary"
          fullWidth
          rightIcon={null}
          size="lg"
          style={styles.nextButton}
        />
      </View>

      <TouchableOpacity onPress={onBack} style={styles.backButtonTouch}>
        <Text style={styles.backText}>← Back to Previous Step</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  photoSection: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  photoImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  cameraButton: {
    position: "absolute",
    right: "31%",
    top: "42%",
    width: 33,
    height: 33,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  cameraIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.white,
    resizeMode: "contain",
  },
  photoLabel: {
    marginTop: SPACING.md,
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
  },
  photoActionsRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  photoActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photoActionPrimary: {
    backgroundColor: COLORS.primary,
  },
  photoActionSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoActionPrimaryText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  photoActionSecondaryText: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  dateOfBirthContainer: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  dateInput: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    height: 48,
  },
  contactContainer: {
    marginBottom: SPACING.md,
  },
  contactInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  countryPrefix: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
  },
  countryPrefixText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  contactInput: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  segmentedControl: {
    marginBottom: SPACING.md,
  },
  segmentRow: {
    flexDirection: "row",
    borderRadius: 14,
    backgroundColor: COLORS.background,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  segmentItemActive: {
    backgroundColor: COLORS.primary,
  },
  segmentItemText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.paragraph,
  },
  segmentItemTextActive: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.white,
  },
  dropdownContainer: {
    marginBottom: SPACING.lg,
  },
  dropdownButton: {
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
  dropdownButtonText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
  },
  dropdownMenu: {
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
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
  nextButton: {
    borderRadius: 16,
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
});

export default PersonalInformationForm;
