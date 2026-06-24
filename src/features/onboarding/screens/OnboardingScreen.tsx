import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { ONBOARDING_SLIDES } from "../onboardingData";
import { OnboardingStorage } from "../onboardingStorage";

const { width } = Dimensions.get("window");

const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();

  const currentSlide = ONBOARDING_SLIDES[currentIndex];
  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await OnboardingStorage.setCompleted();
      navigation.replace("Login");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (isLastSlide) {
      handleGetStarted();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);
      await OnboardingStorage.setCompleted();
      navigation.replace("Login");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleSkip}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        scrollEnabled={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Image
          source={currentSlide.image}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>{currentSlide.title}</Text>

        <Text style={styles.description}>{currentSlide.description}</Text>
      </ScrollView>

      <View style={styles.footerContainer}>
        <View style={styles.paginationContainer}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    alignItems: "flex-end",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  skipButton: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  image: {
    width: "100%",
    height: 300,
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontSize: FONT_SIZE.h28,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.heading,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: SPACING.sm,
  },
  footerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  button: {
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.white,
  },
});

export default OnboardingScreen;
