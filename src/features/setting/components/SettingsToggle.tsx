import React, { useEffect, useState } from "react";
import { View, Switch, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SPACING, COLORS } from "../../../theme";

const STORAGE_KEY = "@settings_notifications";

const SettingsToggle: React.FC<{
  defaultValue?: boolean;
  onChange?: (v: boolean) => void;
}> = ({ defaultValue = true, onChange }) => {
  const [enabled, setEnabled] = useState(defaultValue);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw !== null) setEnabled(raw === "1");
      } catch {}
    })();
  }, []);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {}
    onChange?.(next);
  };

  return (
    <View style={styles.container}>
      <Switch
        value={enabled}
        onValueChange={toggle}
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
