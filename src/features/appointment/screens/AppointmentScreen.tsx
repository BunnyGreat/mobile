import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../../theme";
import { useProfileStore } from "../../profile/store/profile.store";
import { PageHeader, HeroHeader, WaveDivider } from "../../../components/ui";
import AppointmentForm from "../components/AppointmentForm";
import AppointmentSummaryCard from "../components/AppointmentSummaryCard";
import BookAppointmentButton from "../components/BookAppointmentButton";
import AppointmentFooter from "../components/AppointmentFooter";
import { useAppointment } from "../hooks/useAppointment";
import {
  loadAppointmentDraft,
  saveAppointmentDraft,
  clearAppointmentDraft,
} from "../services/appointmentCache.service";
import { useAppointmentStore } from "../store/appointment.store";
import { validateAppointment } from "../utils/appointmentValidation";

const AppointmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    loading,
    error,
    success,
    form,
    submitAppointment,
    clearState,
    resetForm,
  } = useAppointment();
  const profile = useProfileStore((state) => state.profile);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await loadAppointmentDraft();
      if (draft) {
        if (draft.purpose) {
          useAppointmentStore.getState().setPurpose(draft.purpose);
        }
        if (draft.concern) {
          useAppointmentStore.getState().setConcern(draft.concern);
        }
        if (draft.appointmentDate) {
          useAppointmentStore
            .getState()
            .setAppointmentDate(draft.appointmentDate);
        }
        if (draft.appointmentTime) {
          useAppointmentStore
            .getState()
            .setAppointmentTime(draft.appointmentTime);
        }
      }
      setDraftLoaded(true);
    };

    loadDraft();
  }, []);

  useEffect(() => {
    if (draftLoaded) {
      saveAppointmentDraft({
        purpose: form.purpose,
        concern: form.concern,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
      });
    }
  }, [
    draftLoaded,
    form.purpose,
    form.concern,
    form.appointmentDate,
    form.appointmentTime,
  ]);

  useEffect(() => {
    if (success) {
      Alert.alert(
        "Appointment Booked",
        "Your appointment request has been submitted successfully. Please wait for confirmation from the Barangay office.",
      );
      clearAppointmentDraft();
      resetForm();
      clearState();
      navigation.goBack();
    }
  }, [success, clearState, resetForm, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert("Appointment failed", error);
      clearState();
    }
  }, [error, clearState]);

  const validationErrors = useMemo(
    () => ({
      purpose: !form.purpose?.trim()
        ? "Please select the purpose of your appointment."
        : null,
      appointmentDate: !form.appointmentDate
        ? "Please select an appointment date."
        : null,
      appointmentTime: !form.appointmentTime
        ? "Please select an available time slot."
        : null,
      supportingDocument:
        !form.supportingDocumentName || !form.supportingDocumentUri
          ? "Please upload a supporting document."
          : null,
    }),
    [
      form.purpose,
      form.appointmentDate,
      form.appointmentTime,
      form.supportingDocumentName,
      form.supportingDocumentUri,
    ],
  );

  const validationError = useMemo(
    () =>
      validateAppointment({
        purpose: form.purpose,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        supportingDocumentName: form.supportingDocumentName,
        supportingDocumentUri: form.supportingDocumentUri,
      }),
    [
      form.purpose,
      form.appointmentDate,
      form.appointmentTime,
      form.supportingDocumentName,
      form.supportingDocumentUri,
    ],
  );

  const isFormValid = useMemo(
    () =>
      Boolean(
        form.purpose?.trim() &&
        form.appointmentDate &&
        form.appointmentTime &&
        form.supportingDocumentName &&
        form.supportingDocumentUri,
      ),
    [
      form.purpose,
      form.appointmentDate,
      form.appointmentTime,
      form.supportingDocumentName,
      form.supportingDocumentUri,
    ],
  );

  const handleSubmit = async () => {
    if (loading || !isFormValid) {
      if (validationError) {
        Alert.alert("Invalid appointment", validationError);
      }
      return;
    }

    await submitAppointment();
  };

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <PageHeader
        title="Book Appointment"
        onBackPress={() => navigation.goBack()}
      />

      {/* Hero Section */}
      <HeroHeader
        iconName="calendar"
        title="Book an Appointment"
        subtitle="Choose a service, select your preferred schedule, and we'll take care of the rest."
      />

      {/* Wave Divider */}
      <WaveDivider />

      {/* Form Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AppointmentForm
              purpose={form.purpose}
              concern={form.concern}
              appointmentDate={form.appointmentDate}
              appointmentTime={form.appointmentTime}
              supportingDocumentName={form.supportingDocumentName}
              supportingDocumentUri={form.supportingDocumentUri}
              loading={loading}
              validationErrors={validationErrors}
              onPurposeChange={(value) =>
                useAppointmentStore.getState().setPurpose(value)
              }
              onConcernChange={(value) =>
                useAppointmentStore.getState().setConcern(value)
              }
              onDateChange={(value) =>
                useAppointmentStore.getState().setAppointmentDate(value)
              }
              onTimeChange={(value) =>
                useAppointmentStore.getState().setAppointmentTime(value)
              }
              onDocumentChange={(name, uri) =>
                useAppointmentStore.getState().setSupportingDocument(name, uri)
              }
            />

            <AppointmentSummaryCard
              fullName={profile?.fullName ?? "Resident"}
              purpose={form.purpose}
              appointmentDate={form.appointmentDate}
              appointmentTime={form.appointmentTime}
              concern={form.concern}
              supportingDocumentName={form.supportingDocumentName}
            />

            <BookAppointmentButton
              loading={loading}
              disabled={!isFormValid}
              onPress={handleSubmit}
            />

            <AppointmentFooter />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
});

export default AppointmentScreen;
