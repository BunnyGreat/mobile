import React from "react";
import { Switch, StyleSheet } from "react-native";
import { COLORS } from "../../../theme";

const SettingsToggle: React.FC<{
  enabled: boolean;
  onChange: (value: boolean) => void;
}> = ({ enabled, onChange }) => {
  return (
    <Switch
      value={enabled}
      onValueChange={onChange}
      trackColor={{
        false: COLORS.border,
        true: `${COLORS.primary}90`
      }}
      thumbColor={enabled ? COLORS.primary : COLORS.white}
      ios_backgroundColor={COLORS.border}
      style={styles.switch}
    />
  );
};

const styles = StyleSheet.create({
  switch: {
    transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }],
  },
});

export default SettingsToggle;
