import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import AppInput from "../../../../../components/ui/AppInput";
import AppButton from "../../../../../components/ui/AppButton";
import { SPACING, COLORS, FONT_FAMILY, FONT_SIZE } from "../../../../../theme";

import type { RegistrationPersonalInformation } from "../types/register.types";

type Props = {
  onNext?: (data: RegistrationPersonalInformation) => void;
  onBack?: () => void;
};

const PersonalInformationForm: React.FC<Props> = ({ onNext, onBack }) => {
  // Form field states
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState<string>("male");
  const [civilStatus, setCivilStatus] = useState<string>("single");
  const [statusOpen, setStatusOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");

  // Format contact number
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

  // DOB via native date picker (store ISO yyyy-MM-dd)
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<string | undefined>(undefined);
  const [calendarCurrent, setCalendarCurrent] = useState<string | undefined>(
    undefined,
  );
  const [showYearPicker, setShowYearPicker] = useState(false);

  const formattedContact = useMemo(
    () => formatContactNumber(contactNumber),
    [contactNumber],
  );
  const formattedDOB = useMemo(
    () => (dateOfBirth ? format(new Date(dateOfBirth), "MM/dd/yyyy") : ""),
    [dateOfBirth],
  );

  const [firstNameError, setFirstNameError] = useState("");
  const [middleNameError, setMiddleNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [contactNumberError, setContactNumberError] = useState("");
  const [dateOfBirthError, setDateOfBirthError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [civilStatusError, setCivilStatusError] = useState("");

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const handleContactNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setContactNumber("");
      setContactNumberError("");
      return;
    }

    if (digits[0] !== "9") {
      setContactNumberError("Contact number must start with 9.");
      return;
    }

    const limited = digits.slice(0, 10);
    setContactNumber(limited);
    if (contactNumberError) setContactNumberError("");
  };

  const requestPhotoPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Media library access is required to upload a profile photo.",
      );
      return false;
    }
    return true;
  };

  const compressPhoto = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200, height: 1200 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    if (!result.uri) {
      throw new Error("Image compression failed.");
    }

    const response = await fetch(result.uri);
    const blob = await response.blob();
    if (blob.size > MAX_IMAGE_SIZE) {
      throw new Error("Image must be 5MB or less.");
    }

    return result.uri;
  };

  const handleUploadPhoto = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    const extension = asset.uri.split(".").pop()?.toLowerCase();
    if (!extension || !["jpg", "jpeg", "png"].includes(extension)) {
      const message = "Profile photo must be a JPG or PNG image.";
      setPhotoError(message);
      Alert.alert(message);
      return;
    }

    try {
      const compressedUri = await compressPhoto(asset.uri);
      setPhotoUri(compressedUri);
      setPhotoError("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to process photo.";
      setPhotoError(message);
      Alert.alert(message);
    }
  };

  const handleNext = () => {
    const firstNameValidation = !firstName.trim()
      ? "First name is required."
      : firstName.trim().length < 2
        ? "First name must be at least 2 characters."
        : "";
    const middleNameValidation = !middleName.trim()
      ? "Middle name is required."
      : "";
    const lastNameValidation = !lastName.trim()
      ? "Last name is required."
      : lastName.trim().length < 2
        ? "Last name must be at least 2 characters."
        : "";
    const contactDigits = contactNumber.replace(/\D/g, "");
    const contactValidation = !contactDigits
      ? "Contact number is required."
      : contactDigits.length !== 10
        ? "Contact number must be 10 digits."
        : contactDigits[0] !== "9"
          ? "Contact number must start with 9."
          : "";
    const dobValidation = dateOfBirth ? "" : "Date of birth is required.";
    const genderValidation = gender ? "" : "Gender is required.";
    const civilStatusValidation = civilStatus
      ? ""
      : "Civil status is required.";
    const photoValidation = photoUri ? "" : "Profile photo is required.";

    setFirstNameError(firstNameValidation);
    setMiddleNameError(middleNameValidation);
    setLastNameError(lastNameValidation);
    setContactNumberError(contactValidation);
    setDateOfBirthError(dobValidation);
    setGenderError(genderValidation);
    setCivilStatusError(civilStatusValidation);
    setPhotoError(photoValidation);

    if (
      !firstNameValidation &&
      !middleNameValidation &&
      !lastNameValidation &&
      !contactValidation &&
      !dobValidation &&
      !genderValidation &&
      !civilStatusValidation &&
      !photoValidation
    ) {
      if (onNext)
        onNext({
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          suffix: suffix.trim(),
          dateOfBirth: dateOfBirth ?? "",
          gender: gender as "male" | "female" | "other",
          civilStatus: civilStatus as
            | "single"
            | "married"
            | "widowed"
            | "separated"
            | "divorced",
          contactNumber: formatContactNumber(contactNumber),
          profilePhotoUri: photoUri,
        });
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
  };

  const getCivilStatusLabel = (status: string) => {
    switch (status) {
      case "single":
        return "Single";
      case "married":
        return "Married";
      case "widowed":
        return "Widowed";
      case "separated":
        return "Separated";
      case "divorced":
        return "Divorced";
      default:
        return "Select status";
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>STEP 2 OF 4</Text>
          <Text style={styles.progressText}>50% Complete</Text>
        </View>
        <View style={styles.progressBarRow}>
          <View
            style={[styles.progressSegment, styles.progressSegmentActive]}
          />
          <View
            style={[styles.progressSegment, styles.progressSegmentActive]}
          />
          <View style={styles.progressSegment} />
          <View style={[styles.progressSegment, styles.progressSegmentLast]} />
        </View>
      </View>

      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <Text style={styles.headerSubtitle}>
          Please provide your personal details
        </Text>
      </View>

      {/* Photo Section */}
      <View style={styles.photoSection}>
        <View style={styles.photoPlaceholder}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoSelected} />
          ) : (
            <>
              <Image
                source={require("../../../../../../assets/icons/no-photo.png")}
                style={styles.photoImage}
              />
              <Text style={styles.photoLabel}>No Photo Selected</Text>
            </>
          )}
        </View>

        {!photoUri && (
          <TouchableOpacity
            style={styles.cameraButton}
            activeOpacity={0.8}
            onPress={handleUploadPhoto}
          >
            <Image
              source={require("../../../../../../assets/icons/camera.png")}
              style={styles.cameraIcon}
            />
          </TouchableOpacity>
        )}

        <View style={styles.photoActionsRow}>
          <TouchableOpacity
            style={[styles.photoActionButton, styles.photoActionPrimary]}
            activeOpacity={0.8}
            onPress={handleUploadPhoto}
          >
            <Text style={styles.photoActionPrimaryText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
        {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}
      </View>

      {/* Form Fields */}
      <AppInput
        label="First Name"
        required
        placeholder="e.g. Juan"
        value={firstName}
        onChangeText={(value) => {
          setFirstName(value);
          if (firstNameError) setFirstNameError("");
        }}
        error={firstNameError}
      />
      <AppInput
        label="Middle Name"
        required
        placeholder="e.g. Santos"
        value={middleName}
        onChangeText={(value) => {
          setMiddleName(value);
          if (middleNameError) setMiddleNameError("");
        }}
        error={middleNameError}
      />
      <AppInput
        label="Last Name"
        required
        placeholder="e.g. Dela Cruz"
        value={lastName}
        onChangeText={(value) => {
          setLastName(value);
          if (lastNameError) setLastNameError("");
        }}
        error={lastNameError}
      />
      <AppInput
        label="Suffix"
        placeholder="e.g. Jr., Sr."
        value={suffix}
        onChangeText={setSuffix}
      />

      {/* Date of Birth (use date picker only) */}
      <View style={styles.dateOfBirthContainer}>
        <Text style={styles.fieldLabel}>
          Date of Birth
          <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dateInput}
          activeOpacity={0.8}
          onPress={() => setShowDOBPicker(true)}
        >
          <Text
            style={{ color: formattedDOB ? COLORS.heading : COLORS.border }}
          >
            {formattedDOB || "MM/DD/YYYY"}
          </Text>
        </TouchableOpacity>
        {dateOfBirthError ? (
          <Text style={styles.errorText}>{dateOfBirthError}</Text>
        ) : null}

        <Modal visible={showDOBPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.calendarContainer}>
              <View>
                <View style={styles.calendarHeaderRow}>
                  <TouchableOpacity
                    onPress={() => setShowYearPicker((s) => !s)}
                    style={styles.yearToggle}
                  >
                    <Text style={styles.yearToggleText}>Select Year</Text>
                  </TouchableOpacity>
                  <Text style={styles.calendarMonthLabel}>
                    {calendarCurrent
                      ? format(new Date(calendarCurrent), "yyyy")
                      : dateOfBirth
                        ? format(new Date(dateOfBirth), "yyyy")
                        : format(new Date(), "yyyy")}
                  </Text>
                </View>
                {showYearPicker ? (
                  <FlatList
                    data={Array.from(
                      { length: new Date().getFullYear() - 1899 },
                      (_, i) => new Date().getFullYear() - i,
                    )}
                    keyExtractor={(item) => String(item)}
                    style={styles.yearList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.yearItem}
                        onPress={() => {
                          const y = String(item);
                          setCalendarCurrent(`${y}-01-01`);
                          setShowYearPicker(false);
                        }}
                      >
                        <Text style={styles.yearItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Calendar
                    current={calendarCurrent}
                    onDayPress={(day: { dateString: string }) => {
                      setDateOfBirth(day.dateString);
                      setCalendarCurrent(undefined);
                      setShowDOBPicker(false);
                    }}
                    maxDate={format(new Date(), "yyyy-MM-dd")}
                    markedDates={
                      dateOfBirth ? { [dateOfBirth]: { selected: true } } : {}
                    }
                  />
                )}
                <TouchableOpacity
                  style={styles.calendarClose}
                  onPress={() => setShowDOBPicker(false)}
                >
                  <Text style={{ color: COLORS.primary }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Contact Number */}
      <View style={styles.contactContainer}>
        <Text style={styles.fieldLabel}>
          Contact Number
          <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.contactInputRow}>
          <View style={styles.countryPrefix}>
            <Text style={styles.countryPrefixText}>🇵🇭 +63</Text>
          </View>
          <TextInput
            value={formattedContact.replace(/^\+63\s*/, "")}
            onChangeText={handleContactNumberChange}
            placeholder="923 323 2323"
            placeholderTextColor={COLORS.border}
            keyboardType="phone-pad"
            style={styles.contactInput}
            maxLength={12}
          />
        </View>
        {contactNumberError ? (
          <Text style={styles.errorText}>{contactNumberError}</Text>
        ) : null}
      </View>

      {/* Gender Selector */}
      <View style={styles.segmentedControl}>
        <Text style={styles.fieldLabel}>
          Gender
          <Text style={styles.required}>*</Text>
        </Text>
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
                onPress={() => {
                  setGender(option.key);
                  if (genderError) setGenderError("");
                }}
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
        {genderError ? (
          <Text style={styles.errorText}>{genderError}</Text>
        ) : null}
      </View>

      {/* Civil Status Dropdown */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.fieldLabel}>
          Civil Status
          <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          activeOpacity={0.8}
          onPress={() => setStatusOpen((s) => !s)}
        >
          <Text style={styles.dropdownButtonText}>
            {getCivilStatusLabel(civilStatus)}
          </Text>
          <Text style={styles.chevron}>{statusOpen ? "▲" : "▼"}</Text>
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
                    if (civilStatusError) setCivilStatusError("");
                  }}
                >
                  <Text style={styles.dropdownOptionText}>
                    {getCivilStatusLabel(key)}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        )}
        {civilStatusError ? (
          <Text style={styles.errorText}>{civilStatusError}</Text>
        ) : null}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <AppButton
          label="Next Step"
          onPress={handleNext}
          variant="primary"
          fullWidth
          style={styles.nextButton}
        />
      </View>

      {/* Privacy Notice Card */}
      <View style={styles.noticeCard}>
        <View style={styles.noticeIconWrapper}>
          <Image
            source={require("../../../../../../assets/icons/shield-check.png")}
            style={styles.noticeIcon}
          />
        </View>
        <Text style={styles.noticeText}>
          Your data is encrypted and protected under the Data Privacy Act of
          2012. We only use this information for official Barangay San Isidro
          services.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  /* Progress Section */
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

  /* Header Section */
  headerSection: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.h28 || 24,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body16 * 1.5,
  },

  /* Photo Section */
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
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  photoSelected: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  photoLabel: {
    marginTop: SPACING.md,
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
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

  /* Form Fields */
  fieldLabel: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },

  dateOfBirthContainer: {
    marginBottom: SPACING.md,
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
  required: {
    color: COLORS.danger,
  },
  errorText: {
    marginTop: SPACING.xs,
    color: COLORS.danger,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
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

  /* Gender Selector */
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

  /* Civil Status Dropdown */
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
  chevron: {
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  dropdownMenu: {
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    zIndex: 10,
  },
  dropdownOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownOptionText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.heading,
  },

  /* Action Buttons */
  actionsRow: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  nextButton: {
    borderRadius: 16,
  },
  backButtonTouch: {
    marginBottom: SPACING.lg,
    alignSelf: "center",
  },
  backText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },

  /* Privacy Notice Card */
  noticeCard: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: "rgba(249, 246, 234, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(249, 232, 153, 0.5)",
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  noticeIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  noticeIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  noticeText: {
    flex: 1,
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    lineHeight: FONT_SIZE.body14 * 1.6,
  },
  calendarHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  yearToggle: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  yearToggleText: {
    fontSize: FONT_SIZE.body14,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
  },
  calendarMonthLabel: {
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
  },
  yearList: {
    maxHeight: 300,
  },
  yearItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  yearItemText: {
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    width: "92%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  calendarClose: {
    padding: SPACING.md,
    alignItems: "center",
  },
});

export default PersonalInformationForm;
