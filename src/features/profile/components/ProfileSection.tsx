import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import SectionHeader from "../../../components/common/SectionHeader";
import AppCard from "../../../components/ui/AppCard";
import { COLORS, SPACING } from "../../../theme";

interface ProfileSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  subtitle,
  children,
  containerStyle,
}) => (
  <View style={[styles.section, containerStyle]}>
    <SectionHeader title={title} subtitle={subtitle} />
    <AppCard>{children}</AppCard>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.lg,
  },
});

export default ProfileSection;
