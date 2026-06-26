import React from "react";
import AppButton from "../../../components/ui/AppButton";
import { StyleSheet } from "react-native";
import { SPACING } from "../../../theme";

interface UpdatePasswordButtonProps {
  loading?: boolean;
  onPress: () => void;
}

const UpdatePasswordButton: React.FC<UpdatePasswordButtonProps> = ({
  loading,
  onPress,
}) => {
  return (
    <AppButton
      label={loading ? "Updating..." : "Update Password"}
      onPress={onPress}
      fullWidth
      style={styles.button}
      loading={loading}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});

export default UpdatePasswordButton;
