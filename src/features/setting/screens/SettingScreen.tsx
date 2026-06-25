import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
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

const SettingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard
          onPress={() => navigation.navigate("ProfileScreen" as never)}
        />

        <SettingsSection title="Account">
          <SettingsItem
            icon="user"
            label="Profile Information"
            onPress={() => navigation.navigate("ProfileScreen" as never)}
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
            rightComponent={<SettingsToggle />}
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

        <LogoutButton
          onPress={() => {
            /* placeholder */
          }}
        />
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
});

export default SettingScreen;
