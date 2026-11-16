import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { SectionCard, FormSection } from "../../../components/ui";
import DatePicker from "./DatePicker";
import PurposeDropdown from "./PurposeDropdown";
import SupportingDocumentPicker from "./SupportingDocumentPicker";
import TimeSlotSelector from "./TimeSlotSelector";
import type { AppointmentPurpose } from "../constants/appointmentPurposes";

interface AppointmentFormProps {
  purpose: AppointmentPurpose | "";
  concern: string;
  appointmentDate: string;
  appointmentTime: string;
  supportingDocumentName: string | null;
  supportingDocumentUri: string | null;
  loading: boolean;
  validationErrors: {
    purpose: string | null;
    appointmentDate: string | null;
    appointmentTime: string | null;
    supportingDocument: string | null;
  };
  onPurposeChange: (value: AppointmentPurpose) => void;
  onConcernChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onDocumentChange: (name: string | null, uri: string | null) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  purpose,
  concern,
  appointmentDate,
  appointmentTime,
  supportingDocumentName,
  supportingDocumentUri,
  loading,
  validationErrors,
  onPurposeChange,
  onConcernChange,
  onDateChange,
  onTimeChange,
  onDocumentChange,
}) => {
  const purposeCompleted = Boolean(purpose?.trim());
  const dateCompleted = Boolean(appointmentDate);
  const timeCompleted = Boolean(appointmentTime);
  const documentCompleted = Boolean(supportingDocumentName && supportingDocumentUri);

  return (
    <View style={styles.container}>
      {/* Step 1: Select Purpose */}
      <SectionCard>
        <FormSection
          title="Select Purpose"
          subtitle="Choose the type of service you need"
          showStep
          step={1}
          completed={purposeCompleted}
        >
          <PurposeDropdown value={purpose} onChange={onPurposeChange} />
          {validationErrors.purpose ? (
            <Text style={styles.errorText}>{validationErrors.purpose}</Text>
          ) : null}
        </FormSection>
      </SectionCard>

      {/* Step 2: Describe Concern (Optional) */}
      <SectionCard>
        <FormSection
          title="Additional Details"
          subtitle="Describe your concern (optional)"
          showStep
          step={2}
        >
          <View style={styles.textAreaContainer}>
            <TextInput
              value={concern}
              onChangeText={onConcernChange}
              placeholder="Describe your concern here..."
              placeholderTextColor={COLORS.placeholder}
              multiline
              maxLength={500}
              style={styles.textArea}
              textAlignVertical="top"
            />
            <View style={styles.counterContainer}>
              <Text style={styles.counter}>{concern.length} / 500</Text>
            </View>
          </View>
        </FormSection>
      </SectionCard>

      {/* Step 3: Select Date */}
      <SectionCard>
        <FormSection
          title="Select Date"
          subtitle="Choose your preferred appointment date"
          showStep
          step={3}
          completed={dateCompleted}
        >
          <DatePicker value={appointmentDate} onChange={onDateChange} />
          {validationErrors.appointmentDate ? (
            <Text style={styles.errorText}>{validationErrors.appointmentDate}</Text>
          ) : null}
        </FormSection>
      </SectionCard>

      {/* Step 4: Select Time Slot */}
      <SectionCard>
        <FormSection
          title="Select Time Slot"
          subtitle="Choose an available time that works for you"
          showStep
          step={4}
          completed={timeCompleted}
        >
          {!appointmentDate ? (
            <View style={styles.placeholderCard}>
              <Feather name="clock" size={24} color={COLORS.placeholder} />
              <Text style={styles.placeholderText}>
                Please select a date first to view available time slots
              </Text>
            </View>
          ) : (
            <TimeSlotSelector
              selectedDate={appointmentDate}
              selectedTime={appointmentTime}
              onSelect={onTimeChange}
            />
          )}
          {validationErrors.appointmentTime ? (
            <Text style={styles.errorText}>{validationErrors.appointmentTime}</Text>
          ) : null}
        </FormSection>
      </SectionCard>

      {/* Step 5: Upload Document */}
      <SectionCard>
        <FormSection
          title="Supporting Document"
          subtitle="Upload required documents (PDF, DOC, DOCX)"
          showStep
          step={5}
          completed={documentCompleted}
        >
          <SupportingDocumentPicker
            value={supportingDocumentName}
            uri={supportingDocumentUri}
            loading={loading}
            onChange={onDocumentChange}
          />
          {validationErrors.supportingDocument ? (
            <Text style={styles.errorText}>
              {validationErrors.supportingDocument}
            </Text>
          ) : null}
        </FormSection>
      </SectionCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textAreaContainer: {
    position: "relative",
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.md,
    minHeight: 120,
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    backgroundColor: COLORS.white,
  },
  counterContainer: {
    position: "absolute",
    right: SPACING.md,
    bottom: SPACING.sm,
  },
  counter: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
  errorText: {
    marginTop: SPACING.sm,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.danger,
  },
  placeholderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  placeholderText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.placeholder,
    lineHeight: 20,
  },
});

export default AppointmentForm;
