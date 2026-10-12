import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SettingsItem from "../components/SettingsItem";
import SettingsToggle from "../components/SettingsToggle";
import LogoutButton from "../components/LogoutButton";
import PrivacyPolicyModal from "../components/modals/PrivacyPolicyModal";
import TermsConditionsModal from "../components/modals/TermsConditionsModal";
import DataPermissionsModal from "../components/modals/DataPermissionsModal";
import AboutApplicationModal from "../components/modals/AboutApplicationModal";
import { SPACING, COLORS, FONT_FAMILY, FONT_SIZE } from "../../../theme";
import {
  LOGOUT_FAILURE_MESSAGE,
  useSettingsStore,
} from "../store/settings.store";
import type { RootStackNavigationProp } from "../../../navigation/types";
import ProfileAvatar from "../../profile/components/ProfileAvatar";

const SettingScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const profile = useSettingsStore((state) => state.profile);
  const error = useSettingsStore((state) => state.error);
  const notificationsEnabled = useSettingsStore(
    (state) => state.notificationsEnabled,
  );
  const logoutLoading = useSettingsStore((state) => state.logoutLoading);
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
            Alert.alert("Logout Failed", LOGOUT_FAILURE_MESSAGE);
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    if (!name) return "RD";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Unified Header with Profile Hero */}
        <LinearGradient
          colors={[COLORS.primary, "#1565C0"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Profile Hero */}
          <TouchableOpacity
            style={styles.profileHero}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("ProfileScreen")}
          >
            <View style={styles.avatarContainer}>
              {profile?.profilePhotoUrl ? (
                <ProfileAvatar
                  uri={profile.profilePhotoUrl}
                  imageStyle={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {getInitials(profile?.fullName || "")}
                  </Text>
                </View>
              )}
              <View style={styles.onlineBadge}>
                <Feather name="check" size={10} color={COLORS.white} />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {profile?.fullName || "Resident"}
              </Text>
              {profile?.referenceId && (
                <Text style={styles.profileId}>ID: {profile.referenceId}</Text>
              )}
              {profile?.status && (
                <View style={styles.statusTag}>
                  <Text style={styles.statusTagText}>{profile.status}</Text>
                </View>
              )}
            </View>

            <Feather
              name="chevron-right"
              size={22}
              color="rgba(255,255,255,0.6)"
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Content Area */}
        <View style={styles.content}>
          {error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <SettingsItem
                icon="user"
                label="Profile Information"
                onPress={() => navigation.navigate("ProfileScreen")}
              />
              <View style={styles.divider} />
              <SettingsItem
                icon="lock"
                label="Change Password"
                showDivider={false}
                onPress={() => navigation.navigate("ChangePasswordScreen")}
              />
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.card}>
              <SettingsItem
                icon="globe"
                label="Language"
                value="English"
                onPress={undefined}
              />
              <View style={styles.divider} />
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
                showDivider={false}
              />
            </View>
          </View>

          {/* Privacy & Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            <View style={styles.card}>
              <SettingsItem
                icon="shield"
                label="Privacy Policy"
                onPress={() => setPrivacyOpen(true)}
              />
              <View style={styles.divider} />
              <SettingsItem
                icon="file-text"
                label="Terms & Conditions"
                onPress={() => setTermsOpen(true)}
              />
              <View style={styles.divider} />
              <SettingsItem
                icon="database"
                label="Data & Permissions"
                onPress={() => setDataOpen(true)}
                showDivider={false}
              />
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              <SettingsItem
                icon="info"
                label="Version"
                value="1.0.0"
                onPress={undefined}
              />
              <View style={styles.divider} />
              <SettingsItem
                icon="smartphone"
                label="About Application"
                onPress={() => setAboutOpen(true)}
                showDivider={false}
              />
            </View>
          </View>

          {/* Logout */}
          <View style={styles.logoutSection}>
            <LogoutButton
              onPress={handleLogoutPress}
              disabled={logoutLoading}
            />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
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
  header: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarInitials: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body16,
    color: COLORS.white,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.white,
    marginBottom: 2,
  },
  profileId: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: SPACING.xs,
  },
  statusTag: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statusTagText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.white,
  },
  content: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: `${COLORS.danger}10`,
  },
  errorText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.danger,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    marginBottom: SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 72,
  },
  logoutSection: {
    marginTop: SPACING.md,
  },
  bottomSpacer: {
    height: SPACING.huge,
  },
});

export default SettingScreen;
