import React from "react";
import { View, Image, StyleSheet } from "react-native";
import AppInput from "../../../components/ui/AppInput";

interface PasswordInputProps {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  placeholder,
  error,
  onChangeText,
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      <AppInput
        label={label}
        placeholder={placeholder ?? "••••••••"}
        value={value}
        onChangeText={onChangeText}
        error={error}
        isPassword
        autoCapitalize="none"
        editable={editable}
        leftIcon={
          <Image
            source={require("../../../../assets/icons/lock.png")}
            style={styles.icon}
            resizeMode="contain"
          />
        }
        passwordToggleIcons={{
          visible: (
            <Image
              source={require("../../../../assets/icons/eye-slash.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          ),
          hidden: (
            <Image
              source={require("../../../../assets/icons/eye-open.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          ),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default PasswordInput;
