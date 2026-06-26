import React from "react";
import { AppButton } from "../../../components/ui/AppButton";

interface SaveButtonProps {
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  loading = false,
  disabled = false,
  onPress,
}) => {
  return (
    <AppButton
      label="Save Changes"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      fullWidth
      accessibilityLabel="Save profile changes"
    />
  );
};

export default SaveButton;
