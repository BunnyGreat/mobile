import React from "react";
import { StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import ResidenceInfoForm from "./components/ResidenceInfoForm";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../../../theme";
import { useRegisterStore } from "./store/register.store";
import type { RegistrationResidenceInformation } from "./types/register.types";

const ResidenceInformationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const saveResidenceInformation = useRegisterStore(
    (state) => state.saveResidenceInformation,
  );

  const handleNext = (data: RegistrationResidenceInformation) => {
    saveResidenceInformation(data);
    navigation.navigate("UploadIdentification");
  };

  const handleBack = () => {
    navigation.navigate("PersonalInformation");
  };

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <ResidenceInfoForm onNext={handleNext} onBack={handleBack} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
});

export default ResidenceInformationScreen;
