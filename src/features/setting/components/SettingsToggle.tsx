import React from "react";
import { View, Switch, StyleSheet } from "react-native";
import { SPACING, COLORS } from "../../../theme";

const SettingsToggle: React.FC<{
  enabled: boolean;
  onChange: (value: boolean) => void;
}> = ({ enabled, onChange }) => {
  return (
    <View style={styles.container}>
      <Switch
        value={enabled}
        onValueChange={onChange}
        trackColor={{ false: "#ccc", true: COLORS.primary }}
        thumbColor="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: SPACING.md,
  },
});

export default SettingsToggle;
