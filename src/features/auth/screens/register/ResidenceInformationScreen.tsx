import React from "react";
import { StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import ResidenceInfoForm from "./components/ResidenceInfoForm";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING } from "../../../../theme";

const ResidenceInformationScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    console.log("Residence info submit (placeholder)");
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
