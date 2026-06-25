import React, { useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useProfileStore } from "../store/profile.store";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import ScreenContainer from "../../../components/common/ScreenContainer";
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

  return (
    <ScreenContainer
      scrollable
      backgroundColor={COLORS.background}
      padding="lg"
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading profile...</Text>
        </View>
      ) : profile ? (
        <>
          <ProfileHeaderCard
            fullName={profile.fullName}
            residentStatus={profile.residentStatus}
            profilePhotoUrl={profile.profilePhotoUrl}
          />
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
        </>
      ) : (
        <Text style={styles.emptyText}>
          {error
            ? `Unable to load profile: ${error}`
            : "No profile data available."}
        </Text>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    marginTop: SPACING.xl,
    alignItems: "center",
  },
  loaderText: {
    marginTop: SPACING.md,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body16,
    color: COLORS.paragraph,
    textAlign: "center",
  },
  emptyText: {
    marginTop: SPACING.xl,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body16,
    color: COLORS.paragraph,
    textAlign: "center",
  },
});

export default ProfileScreens;
