import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import FeedbackForm from "../components/FeedbackForm";
import { useFeedback } from "../hooks/useFeedback";
import {
  clearFeedbackDraft,
  loadFeedbackDraft,
  saveFeedbackDraft,
} from "../services/feedbackCache.service";
import { validateFeedback } from "../utils/validateFeedback";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const { loading, error, success, submitFeedback, clearState } = useFeedback();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await loadFeedbackDraft();
      if (draft) {
        setMessage(draft);
      }
    };

    loadDraft();
  }, []);

  useEffect(() => {
    if (success) {
      Alert.alert(
        "Feedback Submitted",
        "Thank you for sharing your feedback with us.",
      );
      setMessage("");
      setRating(5);
      clearFeedbackDraft();
      clearState();
      navigation.goBack();
    }
  }, [success, clearState, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert("Submission failed", error);
      clearState();
    }
  }, [error, clearState]);

  useEffect(() => {
    saveFeedbackDraft(message);
  }, [message]);

  const validationError = validateFeedback(message, rating);

  const handleSubmit = async () => {
    if (validationError) {
      Alert.alert("Invalid feedback", validationError);
      return;
    }

    await submitFeedback({ rating, message });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Decorative Background Elements */}
        <View style={styles.heroDecorCircle1} />
        <View style={styles.heroDecorCircle2} />
        <View style={styles.heroDecorCircle3} />
        <View style={styles.heroDecorCircle4} />

        {/* Hero Content */}
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Feather name="message-circle" size={36} color={COLORS.white} />
          </View>
          <Text style={styles.heroTitle}>We'd Love Your Feedback</Text>
          <Text style={styles.heroSubtitle}>
            Your feedback helps us improve the experience for everyone.
          </Text>
        </View>
      </View>

      {/* Wave Divider */}
      <View style={styles.waveDivider}>
        <View style={styles.waveCurve} />
      </View>

      {/* Form Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FeedbackForm
              rating={rating}
              message={message}
              loading={loading}
              onRatingChange={setRating}
              onMessageChange={setMessage}
              onSubmit={handleSubmit}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 44,
  },

  // Hero Section Styles
  heroSection: {
    backgroundColor: COLORS.primary,
    paddingTop: 100,
    paddingBottom: 60,
    position: "relative",
    overflow: "hidden",
  },
  heroDecorCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroDecorCircle2: {
    position: "absolute",
    bottom: -80,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  heroDecorCircle3: {
    position: "absolute",
    top: 120,
    left: SCREEN_WIDTH * 0.55,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  heroDecorCircle4: {
    position: "absolute",
    top: 40,
    left: SCREEN_WIDTH * 0.15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  heroContent: {
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
  },
  heroIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h24,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },

  // Wave Divider
  waveDivider: {
    backgroundColor: COLORS.primary,
    marginTop: -1,
  },
  waveCurve: {
    height: 36,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },

  // Content
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
});

export default FeedbackScreen;
