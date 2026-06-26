import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { AppInput } from "../../../components/ui/AppInput";
import SectionHeader from "../../../components/common/SectionHeader";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

export interface EditProfileFormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
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

const genderOptions: readonly SelectOption<EditProfileFormValues["gender"]>[] =
  [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Prefer not to say", value: "other" },
  ] as const;

const civilStatusOptions: readonly SelectOption<
  EditProfileFormValues["civilStatus"]
>[] = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Widowed", value: "widowed" },
  { label: "Divorced", value: "divorced" },
  { label: "Separated", value: "separated" },
] as const;

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

const formatSelectLabel = <T extends string>(
  value: T,
  options: readonly SelectOption<T>[],
) => {
  const match = options.find((item) => item.value === value);
  return match ? match.label : "Select an option";
};

const renderInput = (
  label: string,
  value: string,
  onChange: (text: string) => void,
  error?: string,
  editable = true,
  extraInputStyle?: ViewStyle,
) => (
  <AppInput
    label={label}
    value={value}
    placeholder={`Enter ${label.toLowerCase()}`}
    onChangeText={editable ? onChange : undefined}
    error={error}
    editable={editable}
    selectTextOnFocus={!editable}
    inputStyle={extraInputStyle}
    autoCapitalize="words"
  />
);

const SelectField = <T extends string>(props: {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onSelect: (value: T) => void;
  error?: string;
}) => {
  const { label, value, options, onSelect, error } = props;
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectButton, error ? styles.errorBorder : null]}
        activeOpacity={0.8}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text
          style={[
            styles.selectButtonText,
            value ? styles.selectButtonTextActive : null,
          ]}
        >
          {value
            ? formatSelectLabel(value, options)
            : `Select ${label.toLowerCase()}`}
        </Text>
        <Text style={styles.selectChevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownOption}
              activeOpacity={0.8}
              onPress={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              <Text style={styles.dropdownOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  values,
  errors = {},
  onChangeValue,
}) => {
  const residenceFields = [
    { key: "houseNumber", label: "House Number" },
    { key: "street", label: "Street" },
    { key: "subdivision", label: "Subdivision" },
    { key: "barangay", label: "Barangay" },
    { key: "municipality", label: "Municipality" },
    { key: "province", label: "Province" },
  ] as const;

  const hasResidenceInfo = residenceFields.some(
    (field) => Boolean(values[field.key]) ?? false,
  );

  return (
    <View style={styles.formContainer}>
      <SectionHeader title="Personal Information" />

      {renderInput(
        "First Name",
        values.firstName,
        (text) => onChangeValue("firstName", text),
        errors.firstName,
      )}
      {renderInput(
        "Middle Name",
        values.middleName,
        (text) => onChangeValue("middleName", text),
        errors.middleName,
      )}
      {renderInput(
        "Last Name",
        values.lastName,
        (text) => onChangeValue("lastName", text),
        errors.lastName,
      )}
      {renderInput(
        "Contact Number",
        values.contactNumber,
        (text) => onChangeValue("contactNumber", text),
        errors.contactNumber,
      )}

      <AppInput
        label="Email"
        value={values.email}
        placeholder="Email address"
        editable={false}
        selectTextOnFocus={true}
        autoCapitalize="none"
        error={errors.email}
        inputStyle={styles.readOnlyInput}
      />

      {renderInput(
        "Date of Birth",
        values.dateOfBirth,
        (text) => onChangeValue("dateOfBirth", text),
        errors.dateOfBirth,
      )}

      <SelectField
        label="Gender"
        value={values.gender}
        options={genderOptions}
        onSelect={(selected) => onChangeValue("gender", selected)}
        error={errors.gender}
      />

      <SelectField
        label="Civil Status"
        value={values.civilStatus}
        options={civilStatusOptions}
        onSelect={(selected) => onChangeValue("civilStatus", selected)}
        error={errors.civilStatus}
      />

      {hasResidenceInfo && (
        <>
          <SectionHeader
            title="Residence Information"
            containerStyle={styles.sectionSpacing}
          />
          {residenceFields.map((field) => {
            const value = values[field.key] ?? "";
            if (!value) return null;
            return (
              <React.Fragment key={field.key}>
                {renderInput(
                  field.label,
                  value,
                  (text) => onChangeValue(field.key, text),
                  errors[field.key],
                )}
              </React.Fragment>
            );
          })}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    gap: SPACING.lg,
  },
  fieldGroup: {
    width: "100%",
  },
  fieldLabel: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.paragraph,
    marginBottom: SPACING.xs,
  },
  selectButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectButtonText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.placeholder,
  },
  selectButtonTextActive: {
    color: COLORS.heading,
  },
  selectChevron: {
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  dropdownMenu: {
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.sm,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  dropdownOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBackground,
  },
  dropdownOptionText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.heading,
  },
  errorText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.danger,
  },
  errorBorder: {
    borderColor: COLORS.danger,
  },
  readOnlyInput: {
    backgroundColor: COLORS.inputBackground,
    color: COLORS.paragraph,
  },
  sectionSpacing: {
    marginTop: SPACING.xl,
  },
});

export default EditProfileForm;
