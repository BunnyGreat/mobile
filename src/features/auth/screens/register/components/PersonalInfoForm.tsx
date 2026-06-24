import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AppInput from "../../../../../components/ui/AppInput";
import AppButton from "../../../../../components/ui/AppButton";
import { SPACING, COLORS, FONT_FAMILY, FONT_SIZE } from "../../../../../theme";

type Props = {
  defaultValues?: any;
  onSubmit: (data: any) => void;
  onBack?: () => void;
};

const PersonalInfoForm: React.FC<Props> = ({ onSubmit, onBack }) => {
  return (
    <View>
      <AppInput
        label="First Name"
        placeholder="e.g. Juan"
        value={""}
        onChangeText={() => {}}
      />
      <AppInput
        label="Last Name"
        placeholder="e.g. Dela Cruz"
        value={""}
        onChangeText={() => {}}
      />
      <View style={styles.actionsRow}>
        <AppButton
          label="Next Step"
          onPress={() => onSubmit({})}
          variant="primary"
          fullWidth
        />
      </View>
      <TouchableBack onPress={onBack} />
    </View>
  );
};

const TouchableBack: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <Text style={styles.backText} onPress={onPress}>
    ← Back to Previous Step
  </Text>
);

const styles = StyleSheet.create({
  actionsRow: {
    marginTop: SPACING.lg,
  },
  backText: {
    marginTop: SPACING.md,
    alignSelf: "center",
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
});

export default PersonalInfoForm;
