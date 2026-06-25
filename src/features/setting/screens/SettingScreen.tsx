import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, ScrollView } from "react-native";
import ScreenContainer from "../../../components/common/ScreenContainer";
import { useNavigation } from "@react-navigation/native";
import SettingsHeader from "../components/SettingsHeader";
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
    <ScreenContainer>
      <SafeAreaView style={styles.safe}>
        <SettingsHeader />
        <ScrollView contentContainerStyle={styles.scroll}>
          <ProfileCard
            onPress={() => navigation.navigate("ProfileScreen" as never)}
          />

          <SettingsSection title="Account">
            <SettingsItem icon="user" label="Profile Information" onPress={() => navigation.navigate("ProfileScreen" as never)} />
            <SettingsItem icon="lock" label="Change Password" onPress={() => navigation.navigate("ChangePasswordScreen" as never)} />
          </SettingsSection>

          <SettingsSection title="Preferences">
            <SettingsItem icon="globe" label="Language" value="English" onPress={undefined} />
            <SettingsItem icon="bell" label="Notifications" rightComponent={<SettingsToggle />} onPress={undefined} />
          </SettingsSection>

          <SettingsSection title="Privacy & Security">
            <SettingsItem icon="shield" label="Privacy Policy" onPress={() => setPrivacyOpen(true)} />
            <SettingsItem icon="file-text" label="Terms & Conditions" onPress={() => setTermsOpen(true)} />
            <SettingsItem icon="database" label="Data & Permissions" onPress={() => setDataOpen(true)} />
          </SettingsSection>

          <SettingsSection title="About">
            <SettingsItem icon="info" label="Version" value="1.0.0" onPress={undefined} />
            <SettingsItem icon="file-text" label="About Application" onPress={() => setAboutOpen(true)} />
          </SettingsSection>

          <LogoutButton onPress={() => { /* placeholder */ }} />
        </ScrollView>

        <PrivacyPolicyModal visible={privacyOpen} onClose={() => setPrivacyOpen(false)} />
        <TermsConditionsModal visible={termsOpen} onClose={() => setTermsOpen(false)} />
        <DataPermissionsModal visible={dataOpen} onClose={() => setDataOpen(false)} />
        <AboutApplicationModal visible={aboutOpen} onClose={() => setAboutOpen(false)} />
      </SafeAreaView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: SPACING.xl, paddingTop: SPACING.sm },
});

export default SettingScreen;
