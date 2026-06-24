import React from "react";
import { StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import PersonalInformationForm from "../../../auth/screens/register/components/PersonalInfoForm";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING } from "../../../../theme";

const PersonalInformationScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    // UI-only placeholder
    console.log("Personal info submit (placeholder)");
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
