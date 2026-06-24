import React from "react";
import {
  Modal,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  containerStyle,
  contentStyle,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={[
            {
              width: "90%",
              backgroundColor: COLORS.white,
              borderRadius: SPACING.sm,
              padding: SPACING.lg,
            },
            containerStyle,
          ]}
        >
          <View style={contentStyle}>
            <Text
              style={{
                fontSize: FONT_SIZE.h20,
                fontFamily: FONT_FAMILY.semibold,
                color: COLORS.heading,
                marginBottom: SPACING.sm,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZE.body14,
                fontFamily: FONT_FAMILY.regular,
                color: COLORS.paragraph,
                marginBottom: SPACING.lg,
              }}
            >
              {message}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={onCancel}
                activeOpacity={0.7}
                style={{ marginRight: SPACING.md, padding: SPACING.sm }}
              >
                <Text
                  style={{
                    fontSize: FONT_SIZE.body14,
                    fontFamily: FONT_FAMILY.semibold,
                    color: COLORS.primary,
                  }}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm}
                activeOpacity={0.7}
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: SPACING.sm,
                  padding: SPACING.sm,
                  paddingHorizontal: SPACING.lg,
                }}
              >
                <Text
                  style={{
                    fontSize: FONT_SIZE.body14,
                    fontFamily: FONT_FAMILY.semibold,
                    color: COLORS.white,
                  }}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmDialog;
