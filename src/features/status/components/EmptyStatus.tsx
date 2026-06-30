import React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../../theme";
import EmptyState from "../../../components/common/EmptyState";

export const EmptyStatus: React.FC = () => (
  <EmptyState
    icon={<Feather name="inbox" size={40} color={COLORS.primary} />}
    title="No Requests Yet"
    description="Your certificate and appointment requests will appear here once you submit one."
    style={styles.emptyState}
  />
);

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    minHeight: 260,
  },
});

export default EmptyStatus;
