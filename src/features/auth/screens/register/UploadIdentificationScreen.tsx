import React, { useEffect, useRef } from "react";
import { Alert, View, StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import UploadIdForm from "./components/UploadIdForm";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../../../theme";
import { useRegisterStore } from "./store/register.store";
import type { RegistrationDocuments } from "./types/register.types";

const UploadIdentificationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const saveDocuments = useRegisterStore((state) => state.saveDocuments);
  const submitRegistration = useRegisterStore(
    (state) => state.submitRegistration,
  );
  const isLoading = useRegisterStore((state) => state.isLoading);
  const getRegistrationData = useRegisterStore(
    (state) => state.getRegistrationData,
  );
  const isSubmittingRef = useRef(false);

  const handleNext = async (documents: RegistrationDocuments) => {
    if (isLoading || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;

    const { email, password, personalInformation, residenceInformation } =
      getRegistrationData();

    if (!email || !password || !personalInformation || !residenceInformation) {
      Alert.alert(
        "Registration Error",
        "Incomplete registration data. Please complete all registration steps.",
      );
      return;
    }

    saveDocuments(documents);

    const success = await submitRegistration(documents);
    if (success) {
      navigation.replace("RegistrationSuccess");
      isSubmittingRef.current = false;
      return;
    }

    Alert.alert(
      "Registration Failed",
      "Unable to create account. Please try again.",
    );
    isSubmittingRef.current = false;
  };

  const handleBack = () => {
    navigation.navigate("ResidenceInformation");
  };

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <UploadIdForm
        onNext={handleNext}
        onBack={handleBack}
        isLoading={isLoading}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
});

export default UploadIdentificationScreen;
