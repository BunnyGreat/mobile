import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

const { width } = Dimensions.get("window");
const SPLASH_DURATION = 2000; // Match this with animation duration

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const progressValue = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Start progress animation
    Animated.timing(progressValue, {
      toValue: 100,
      duration: SPLASH_DURATION,
      useNativeDriver: false,
    }).start();

    // Navigate after splash completes
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        // TODO:
        // Check onboarding completion status from AsyncStorage
        // If onboarding is not completed:
        //   navigation.replace("Onboarding")
        // If onboarding is completed:
        //   Check Firebase authentication currentUser
        //   If no authenticated user:
        //     navigation.replace("Login")
        //   If authenticated user exists:
        //     Fetch Firestore user document
        //     Check accountStatus:
        //       - "pending" -> navigate.replace("PendingApproval")
        //       - "approved" -> navigate.replace("Dashboard")
        //       - "rejected" -> navigate.replace("RejectedAccount")

        navigation.replace("Onboarding");
      }
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      // Clean up animation
      progressValue.setValue(0);
    };
  }, [navigation, progressValue]);

  // Interpolate animated value to width
  const progressWidth = progressValue.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Barangay San Isidro</Text>

        <Text style={styles.description}>
          Welcome to your digital barangay. We're getting things ready to help
          you get started...
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Loading</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h24,
    marginBottom: SPACING.sm,
  },
  description: {
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body16,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
    position: "absolute",
    bottom: 50,
  },
  progressTrack: {
    width: "100%",
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 2.5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2.5,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
  },
});

export default SplashScreen;
