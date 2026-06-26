import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useProfileStore } from "../store/profile.store";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileHeaderCard from "../components/ProfileHeaderCard";
import PersonalInformationCard from "../components/PersonalInformationCard";
import ResidenceInformationCard from "../components/ResidenceInformationCard";
import IdentificationInformationCard from "../components/IdentificationInformationCard";

const ProfileScreens: React.FC = () => {
  const profile = useProfileStore((state) => state.profile);
  const loading = useProfileStore((state) => state.loading);
  const error = useProfileStore((state) => state.error);
  const loadProfile = useProfileStore((state) => state.loadProfile);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorText}>
            {error
              ? `Unable to load profile: ${error}`
              : "No profile data available."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Full-width Hero Header */}
        <ProfileHeaderCard
          fullName={profile.fullName}
          email={profile.email}
          residentStatus={profile.residentStatus}
          profilePhotoUrl={profile.profilePhotoUrl}
        />

        {/* Content Cards */}
        <View style={styles.contentSection}>
          <PersonalInformationCard
            personalInformation={profile.personalInformation}
            referenceId={profile.referenceId}
          />

          <ResidenceInformationCard
            residenceInformation={profile.residenceInformation}
          />

          <IdentificationInformationCard
            documents={profile.documents}
            selfieUrl={profile.profilePhotoUrl}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
  },
  loadingCard: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.huge,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body16,
    color: COLORS.paragraph,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.danger + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  errorIconText: {
    fontSize: 32,
    color: COLORS.danger,
    fontWeight: "bold",
  },
  errorText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body16,
    color: COLORS.paragraph,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSpacer: {
    height: SPACING.huge,
  },
});

export default ProfileScreens;
