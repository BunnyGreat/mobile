import React from "react";
import { StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import PersonalInformationForm from "./components/PersonalInfoForm";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../../../theme";
import { useRegisterStore } from "./store/register.store";
import type { RegistrationPersonalInformation } from "./types/register.types";

const PersonalInformationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const savePersonalInformation = useRegisterStore(
    (state) => state.savePersonalInformation,
  );

  const handleNext = (data: RegistrationPersonalInformation) => {
    savePersonalInformation(data);
    navigation.navigate("ResidenceInformation");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <PersonalInformationForm onNext={handleNext} onBack={handleBack} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
});

export default PersonalInformationScreen;
