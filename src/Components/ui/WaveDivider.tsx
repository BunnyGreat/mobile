import React from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "../../theme";

interface WaveDividerProps {
  backgroundColor?: string;
  borderRadius?: number;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({
  backgroundColor = COLORS.primary,
  borderRadius = 36,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.waveCurve, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -1,
  },
  waveCurve: {
    height: 36,
    backgroundColor: COLORS.background,
  },
});

export default WaveDivider;
