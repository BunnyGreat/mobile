import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from "react-native";
import { FONT_FAMILY, FONT_SIZE, SPACING, COLORS } from "../../../../theme";
import { SafeAreaView } from "react-native-safe-area-context";

const PrivacyPolicyModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView style={styles.safe}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.body}>
                  This is placeholder privacy policy content. Replace with real
                  content later.
                </Text>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  card: {
    width: "88%",
    maxWidth: 380,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    paddingBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h20,
    color: COLORS.heading,
    marginBottom: SPACING.md,
  },
  body: {
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    lineHeight: 20,
  },
});

export default PrivacyPolicyModal;
