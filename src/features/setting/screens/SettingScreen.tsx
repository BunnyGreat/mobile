import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ProfileCard from "../components/ProfileCard";
import SettingsSection from "../components/SettingsSection";
import SettingsItem from "../components/SettingsItem";
import SettingsToggle from "../components/SettingsToggle";
import LogoutButton from "../components/LogoutButton";
import PrivacyPolicyModal from "../components/modals/PrivacyPolicyModal";
import TermsConditionsModal from "../components/modals/TermsConditionsModal";
import DataPermissionsModal from "../components/modals/DataPermissionsModal";
import AboutApplicationModal from "../components/modals/AboutApplicationModal";
import { SPACING, COLORS } from "../../../theme";
import { useSettingsStore } from "../store/settings.store";
import type { RootStackNavigationProp } from "../../../navigation/types";

const SettingScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const profile = useSettingsStore((state) => state.profile);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const error = useSettingsStore((state) => state.error);
  const notificationsEnabled = useSettingsStore(
    (state) => state.notificationsEnabled,
  );
  const logoutLoading = useSettingsStore((state) => state.logoutLoading);
  const logoutError = useSettingsStore((state) => state.logoutError);
  const loadProfile = useSettingsStore((state) => state.loadProfile);
  const loadNotificationPreference = useSettingsStore(
    (state) => state.loadNotificationPreference,
  );
  const toggleNotifications = useSettingsStore(
    (state) => state.toggleNotifications,
  );
  const logout = useSettingsStore((state) => state.logout);
  const clearSettings = useSettingsStore((state) => state.clearSettings);

  useEffect(() => {
    loadProfile();
    loadNotificationPreference();
  }, [loadProfile, loadNotificationPreference]);

  const handleLogoutPress = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          const result = await logout();
          if (result) {
            clearSettings();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } else {
            Alert.alert("Logout Failed", "Unable to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard
          profilePhotoUrl={profile?.profilePhotoUrl}
          fullName={profile?.fullName}
          referenceId={profile?.referenceId}
          status={profile?.status}
          onPress={() => navigation.navigate("ProfileScreen")}
        />
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <SettingsSection title="Account">
          <SettingsItem
            icon="user"
            label="Profile Information"
            onPress={() => navigation.navigate("ProfileScreen")}
          />
          <SettingsItem
            icon="lock"
            label="Change Password"
            onPress={() => navigation.navigate("ChangePasswordScreen" as never)}
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsItem
            icon="globe"
            label="Language"
            value="English"
            onPress={undefined}
          />
          <SettingsItem
            icon="bell"
            label="Notifications"
            rightComponent={
              <SettingsToggle
                enabled={notificationsEnabled}
                onChange={toggleNotifications}
              />
            }
            onPress={undefined}
          />
        </SettingsSection>

        <SettingsSection title="Privacy & Security">
          <SettingsItem
            icon="shield"
            label="Privacy Policy"
            onPress={() => setPrivacyOpen(true)}
          />
          <SettingsItem
            icon="file-text"
            label="Terms & Conditions"
            onPress={() => setTermsOpen(true)}
          />
          <SettingsItem
            icon="database"
            label="Data & Permissions"
            onPress={() => setDataOpen(true)}
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsItem
            icon="info"
            label="Version"
            value="1.0.0"
            onPress={undefined}
          />
          <SettingsItem
            icon="file-text"
            label="About Application"
            onPress={() => setAboutOpen(true)}
          />
        </SettingsSection>

        <LogoutButton onPress={handleLogoutPress} disabled={logoutLoading} />
        <PrivacyPolicyModal
          visible={privacyOpen}
          onClose={() => setPrivacyOpen(false)}
        />
        <TermsConditionsModal
          visible={termsOpen}
          onClose={() => setTermsOpen(false)}
        />
        <DataPermissionsModal
          visible={dataOpen}
          onClose={() => setDataOpen(false)}
        />
        <AboutApplicationModal
          visible={aboutOpen}
          onClose={() => setAboutOpen(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 14,
    backgroundColor: "rgba(255, 69, 58, 0.08)",
  },
  errorText: {
    color: COLORS.danger || "#FF453A",
    fontSize: 14,
    fontFamily: "System",
  },
});

export default SettingScreen;
