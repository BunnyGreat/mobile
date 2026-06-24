import React from "react";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import ResidenceInfoForm from "../register/components/ResidenceInfoForm";
import { COLORS } from "../../../../theme";

const ResidenceInformationScreen: React.FC = () => {
  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
    >
      <ResidenceInfoForm />
    </ScreenContainer>
  );
};

export default ResidenceInformationScreen;
