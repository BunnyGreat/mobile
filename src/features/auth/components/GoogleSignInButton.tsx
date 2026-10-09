import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface GoogleSignInButtonProps {
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

const GoogleLogo: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48" accessible={false}>
    <Path
      fill="#4285F4"
      d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-5.437 0-10.042-3.619-11.637-8.5l-6.558 5.096C9.8 40.6 16.4 44 24 44c11.046 0 20-8.954 20-20 0-1.341-.138-2.65-.389-3.917z"
    />
    <Path
      fill="#FBBC05"
      d="M6.306 14.691C5 17.3 4.25 20.5 4.25 24s.75 6.7 2.056 9.309l6.558-5.096C12.3 26.8 12 25.5 12 24s.3-2.8.864-4.213l-6.558-5.096z"
    />
    <Path
      fill="#EA4335"
      d="M24 12c3 0 5.7 1.15 7.8 3.04l5.66-5.66C34 5.7 29.3 4 24 4 16.4 4 9.8 7.4 5.8 14.4l6.56 5.1C13.96 14.6 18.56 12 24 12z"
    />
    <Path
      fill="#34A853"
      d="M24 44c5.3 0 10-1.7 13.46-4.6l-6.19-5.24C29.3 36 26.8 36.5 24 36c-5.4 0-10-3.6-11.6-8.5l-6.56 5.1C9.8 40.6 16.4 44 24 44z"
    />
  </Svg>
);

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
}) => {
  const inProgressRef = useRef(false);
  const [inProgress, setInProgress] = useState(false);
  const isBusy = loading || inProgress;
  const isDisabled = disabled || isBusy;

  const handlePress = async () => {
    if (isDisabled || inProgressRef.current) return;

    inProgressRef.current = true;
    setInProgress(true);
    try {
      await onPress();
    } finally {
      inProgressRef.current = false;
      setInProgress(false);
    }
  };

  return (
    <TouchableOpacity
      accessibilityLabel={
        isBusy ? "Connecting with Google" : "Continue with Google"
      }
      accessibilityRole="button"
      accessibilityState={{ busy: isBusy, disabled: isDisabled }}
      activeOpacity={0.7}
      disabled={isDisabled}
      onPress={handlePress}
      style={[styles.button, isDisabled && styles.buttonDisabled]}
    >
      <View style={styles.content}>
        {isBusy ? (
          <ActivityIndicator
            color={COLORS.primary}
            size="small"
            style={styles.icon}
          />
        ) : (
          <GoogleLogo />
        )}
        <Text style={[styles.label, isDisabled && styles.labelDisabled]}>
          {isBusy ? "Connecting..." : "Continue with Google"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "center",
  },
  icon: {
    height: 20,
    width: 20,
  },
  label: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    textAlign: "center",
  },
  labelDisabled: {
    color: COLORS.paragraph,
  },
});

export default GoogleSignInButton;
