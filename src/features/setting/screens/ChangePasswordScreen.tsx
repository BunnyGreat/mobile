import React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { useChangePassword } from "../hooks/useChangePassword";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    onCurrentPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    requirements,
    passwordStrength,
    passwordMatch,
    errors,
    loading,
    handleChangePassword,
  } = useChangePassword();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Hero Background with Gradient */}
        <LinearGradient
          colors={[COLORS.primary, "#1565C0", "#0D47A1"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBackground}
        >
          {/* Ambient Decorative Circles */}
          <View style={styles.ambientCircle1} />
          <View style={styles.ambientCircle2} />
          <View style={styles.ambientCircle3} />
          <View style={styles.ambientCircle4} />

          {/* Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Change Password</Text>

            <View style={styles.headerSpacer} />
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            {/* Shield Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Feather name="lock" size={32} color={COLORS.white} />
              </View>
            </View>

            <Text style={styles.heroTitle}>Secure Your Account</Text>
            <Text style={styles.heroSubtitle}>
              Update your password to keep your account protected
            </Text>
          </View>
        </LinearGradient>

        {/* Bottom Curve Transition */}
        <View style={styles.curveContainer}>
          <View style={styles.curveWhite} />
        </View>

        {/* Form Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
          style={styles.keyboardAvoidingContainer}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.formCard}>
              <ChangePasswordForm
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                onCurrentPasswordChange={onCurrentPasswordChange}
                onNewPasswordChange={onNewPasswordChange}
                onConfirmPasswordChange={onConfirmPasswordChange}
                requirements={requirements}
                passwordStrength={passwordStrength}
                passwordMatch={passwordMatch}
                errors={errors}
                loading={loading}
                onSubmit={handleChangePassword}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Hero Background
  heroBackground: {
    width: "100%",
    minHeight: 320,
    position: "relative",
  },

  // Ambient Decorative Circles
  ambientCircle1: {
    position: "absolute",
    top: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  ambientCircle2: {
    position: "absolute",
    bottom: 30,
    left: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  ambientCircle3: {
    position: "absolute",
    top: 140,
    right: "55%",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  ambientCircle4: {
    position: "absolute",
    top: 60,
    left: "65%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  // Header Bar
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.lg,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 44,
  },

  // Hero Content
  heroContent: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  heroTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h28,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },

  // Bottom Curve Transition
  curveContainer: {
    position: "absolute",
    top: 300,
    left: 0,
    right: 0,
    height: 24,
    zIndex: 5,
  },
  curveWhite: {
    width: "100%",
    height: 24,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Form Content
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 0,
  },
  formCard: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
});

export default ChangePasswordScreen;
