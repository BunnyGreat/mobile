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
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <Feather name="shield" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>Privacy Policy</Text>
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

                  <Text style={styles.sectionTitle}>Information We Collect</Text>
                  <Text style={styles.body}>
                    We collect information you provide directly, including:
                  </Text>
                  <View style={styles.bulletList}>
                    <View style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>Personal identification information</Text>
                    </View>
                    <View style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>Contact details and address</Text>
                    </View>
                    <View style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>Documents and identification</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>How We Use Your Information</Text>
                  <Text style={styles.body}>
                    We use the information we collect to provide, maintain, and improve
                    our services to you. Your information helps us:
                  </Text>
                  <View style={styles.bulletList}>
                    <View style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>Verify your resident status</Text>
                    </View>
                    <View style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>Process service requests</Text>
                    </View>
                    <View style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>Communicate important updates</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Data Security</Text>
                  <Text style={styles.body}>
                    We implement appropriate security measures to protect your personal
                    information against unauthorized access, alteration, disclosure, or destruction.
                  </Text>

                  <Text style={styles.sectionTitle}>Contact Us</Text>
                  <Text style={styles.body}>
                    If you have questions about this Privacy Policy, please contact
                    your barangay office.
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

export default PrivacyPolicyModal;
