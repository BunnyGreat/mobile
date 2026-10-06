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
import { Feather } from "@expo/vector-icons";
import { FONT_FAMILY, FONT_SIZE, SPACING, COLORS } from "../../../../theme";
import { SafeAreaView } from "react-native-safe-area-context";

const TermsConditionsModal: React.FC<{
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
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <Feather name="file-text" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>Terms & Conditions</Text>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.content}>
                  <Text style={styles.intro}>
                    Last updated: January 2024
                  </Text>

                  <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                  <Text style={styles.body}>
                    By accessing and using this application, you accept and agree to be
                    bound by the terms and provision of this agreement.
                  </Text>

                  <Text style={styles.sectionTitle}>2. Use of Service</Text>
                  <Text style={styles.body}>
                    You agree to use the service only for purposes that are permitted by
                    these Terms and Conditions and any applicable law.
                  </Text>

                  <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
                  <Text style={styles.body}>
                    As a user of this application, you agree to:
                  </Text>
                  <View style={styles.bulletList}>
                    <View style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>Provide accurate information</Text>
                    </View>
                    <View style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>Keep your credentials secure</Text>
                    </View>
                    <View style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>Use the service responsibly</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
                  <Text style={styles.body}>
                    The service and its original content, features, and functionality are
                    owned by the barangay and are protected by international copyright laws.
                  </Text>

                  <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
                  <Text style={styles.body}>
                    In no case shall the barangay be liable for any indirect, incidental,
                    special, or consequential damages that result from your use of the service.
                  </Text>

                  <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
                  <Text style={styles.body}>
                    We reserve the right to modify or replace these Terms at any time.
                    Your continued use of the service after any changes constitutes
                    acceptance of the new Terms.
                  </Text>
                </View>
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
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    width: "92%",
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}12`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h20,
    color: COLORS.heading,
  },
  scrollView: {
    flexGrow: 0,
  },
  content: {
    padding: SPACING.lg,
  },
  intro: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  bulletList: {
    marginBottom: SPACING.md,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  bulletText: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    lineHeight: 22,
  },
});

export default TermsConditionsModal;
