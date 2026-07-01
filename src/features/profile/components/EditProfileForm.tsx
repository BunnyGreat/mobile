import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { AppInput } from "../../../components/ui/AppInput";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

export interface EditProfileFormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  birthplace?: string;
  gender: "male" | "female" | "other" | "";
  civilStatus: "single" | "married" | "widowed" | "divorced" | "separated" | "";
  houseNumber?: string;
  street?: string;
  subdivision?: string;
  barangay?: string;
  municipality?: string;
  province?: string;
}

type EditProfileFormField = keyof EditProfileFormValues;

type EditProfileFormValue<T extends EditProfileFormField> =
  EditProfileFormValues[T];

interface EditProfileFormProps {
  values: EditProfileFormValues;
  errors?: Partial<Record<keyof EditProfileFormValues, string>>;
  onChangeValue: <T extends EditProfileFormField>(
    field: T,
    value: EditProfileFormValue<T>,
  ) => void;
}

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

const genderOptions: SelectOption<EditProfileFormValues["gender"]>[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Prefer not to say", value: "other" },
];

const civilStatusOptions: SelectOption<EditProfileFormValues["civilStatus"]>[] =
  [
    { label: "Single", value: "single" },
    { label: "Married", value: "married" },
    { label: "Widowed", value: "widowed" },
    { label: "Divorced", value: "divorced" },
    { label: "Separated", value: "separated" },
  ];

const barangayOptions: SelectOption<string>[] = [
  { label: "San Isidro", value: "San Isidro" },
  { label: "Balite", value: "Balite" },
  { label: "Burgos", value: "Burgos" },
  { label: "Geronimo", value: "Geronimo" },
  { label: "Manggahan", value: "Manggahan" },
  { label: "Mascap", value: "Mascap" },
  { label: "Puray", value: "Puray" },
  { label: "Rosario", value: "Rosario" },
  { label: "San Jose", value: "San Jose" },
  { label: "San Rafael", value: "San Rafael" },
];

const SelectField = <T extends string>(props: {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onSelect: (value: T) => void;
  error?: string;
}) => {
  const { label, value, options, onSelect, error } = props;
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectButton, error && styles.selectError]}
        activeOpacity={0.7}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={[styles.selectText, value && styles.selectTextActive]}>
          {value
            ? options.find((o) => o.value === value)?.label
            : `Select ${label.toLowerCase()}`}
        </Text>
        <View style={styles.selectIconContainer}>
          <Feather
            name={open ? "chevron-up" : "chevron-down"}
            size={18}
            color={value ? COLORS.primary : COLORS.placeholder}
          />
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownOption}
              activeOpacity={0.7}
              onPress={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              <Text style={styles.dropdownText}>{option.label}</Text>
              {option.value === value && (
                <Feather name="check" size={16} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  values,
  errors = {},
  onChangeValue,
}) => {
  const residenceFields = [
    { key: "houseNumber" as const, label: "House Number" },
    { key: "street" as const, label: "Street" },
    { key: "subdivision" as const, label: "Subdivision/Village" },
  ];

  const hasResidenceInfo = residenceFields.some((field) =>
    Boolean(values[field.key]),
  );

  return (
    <View style={styles.form}>
      {/* Personal Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Feather name="user" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>
        <View style={styles.card}>
          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <AppInput
                label="First Name"
                value={values.firstName}
                placeholder="First name"
                onChangeText={(text) => onChangeValue("firstName", text)}
                error={errors.firstName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.nameField}>
              <AppInput
                label="Middle Name"
                value={values.middleName}
                placeholder="Middle name"
                onChangeText={(text) => onChangeValue("middleName", text)}
                error={errors.middleName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.fieldSpacing}>
            <AppInput
              label="Last Name"
              value={values.lastName}
              placeholder="Last name"
              onChangeText={(text) => onChangeValue("lastName", text)}
              error={errors.lastName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldSpacing}>
            <AppInput
              label="Contact Number"
              value={values.contactNumber}
              placeholder="09XX XXX XXXX"
              onChangeText={(text) => onChangeValue("contactNumber", text)}
              error={errors.contactNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldSpacing}>
            <AppInput
              label="Email Address"
              value={values.email}
              placeholder="Email"
              editable={false}
              selectTextOnFocus
              autoCapitalize="none"
              error={errors.email}
            />
          </View>

          <View style={styles.rowTwo}>
            <View style={styles.fieldHalf}>
              <AppInput
                label="Date of Birth"
                value={values.dateOfBirth}
                placeholder="YYYY-MM-DD"
                onChangeText={(text) => onChangeValue("dateOfBirth", text)}
                error={errors.dateOfBirth}
              />
            </View>
            <View style={styles.fieldHalf}>
              <SelectField
                label="Gender"
                value={values.gender}
                options={genderOptions}
                onSelect={(selected) => onChangeValue("gender", selected)}
                error={errors.gender}
              />
            </View>
          </View>

          <View style={styles.fieldSpacing}>
            <AppInput
              label="Birthplace"
              value={values.birthplace ?? ""}
              placeholder="Enter birthplace"
              onChangeText={(text) => onChangeValue("birthplace", text)}
              error={errors.birthplace}
            />
          </View>

          <View style={styles.fieldSpacing}>
            <SelectField
              label="Civil Status"
              value={values.civilStatus}
              options={civilStatusOptions}
              onSelect={(selected) => onChangeValue("civilStatus", selected)}
              error={errors.civilStatus}
            />
          </View>
        </View>
      </View>

      {/* Residence Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Feather name="map-pin" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>Residence</Text>
        </View>
        <View style={styles.card}>
          {residenceFields.map((field, index) => (
            <View
              key={field.key}
              style={index > 0 ? styles.fieldSpacing : undefined}
            >
              <AppInput
                label={field.label}
                value={values[field.key] ?? ""}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                onChangeText={(text) => onChangeValue(field.key, text)}
                error={errors[field.key]}
              />
            </View>
          ))}

          <View style={styles.fieldSpacing}>
            <SelectField
              label="Barangay"
              value={values.barangay ?? ""}
              options={barangayOptions}
              onSelect={(selected) => onChangeValue("barangay", selected)}
              error={errors.barangay}
            />
          </View>

          <View style={styles.fieldSpacing}>
            <AppInput
              label="Municipality/City"
              value={values.municipality ?? ""}
              placeholder="Municipality/City"
              editable={false}
              selectTextOnFocus
              autoCapitalize="words"
              error={errors.municipality}
            />
          </View>

          <View style={styles.fieldSpacing}>
            <AppInput
              label="Province"
              value={values.province ?? ""}
              placeholder="Province"
              editable={false}
              selectTextOnFocus
              autoCapitalize="words"
              error={errors.province}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.heading,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 78, 159, 0.06)",
  },
  nameRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  nameField: {
    flex: 1,
  },
  rowTwo: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  fieldSpacing: {
    marginTop: SPACING.md,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  selectError: {
    borderColor: COLORS.danger,
  },
  selectText: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.placeholder,
  },
  selectTextActive: {
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.heading,
  },
  selectIconContainer: {
    marginLeft: SPACING.sm,
  },
  dropdown: {
    marginTop: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  errorText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.danger,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default EditProfileForm;
