import React from "react";
import { View, StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import UploadIdForm from "./components/UploadIdForm";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../../../theme";

const UploadIdentificationScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    console.log("Upload identification submit (placeholder)");
    navigation.replace("RegistrationSuccess");
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
      <UploadIdForm onNext={handleNext} onBack={handleBack} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
});

export default UploadIdentificationScreen;
