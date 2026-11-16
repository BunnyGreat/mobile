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
                <Text style={styles.title}>Terms and Conditions</Text>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.content}>
                  <Text style={styles.intro}>
                    Draft for Barangay review. Effective date: [To be confirmed
                    after official approval].
                  </Text>

                  <Text style={styles.sectionTitle}>1. Acceptance</Text>
                  <Text style={styles.body}>
                    These Terms apply when you use the Barangay San Isidro
                    e-Barangay mobile application in Rodriguez, Rizal. By
                    creating an account or using its services, you confirm that
                    you have read and agree to these Terms and the Privacy
                    Policy. The Barangay should publish the approved versions
                    and effective date before accepting registrations.
                  </Text>

                  <Text style={styles.sectionTitle}>
                    2. Resident accounts and eligibility
                  </Text>
                  <Text style={styles.body}>
                    The application is intended for residents seeking Barangay
                    San Isidro services. You must provide the information and
                    documents requested for account review. Registration does
                    not itself confirm residency or guarantee account approval.
                    The Barangay may verify submitted information and contact
                    you for clarification.
                  </Text>

                  <Text style={styles.sectionTitle}>
                    3. Accurate information and documents
                  </Text>
                  <Text style={styles.body}>
                    Provide information that is accurate, complete, and
                    current, and update it when needed. Submit only documents
                    that you are authorized to provide. The Barangay may ask
                    you to correct or clarify incomplete information before it
                    can process an account or request.
                  </Text>

                  <Text style={styles.sectionTitle}>4. Account security</Text>
                  <Text style={styles.body}>
                    Keep your sign-in details private and use your own account.
                    Tell the Barangay promptly if you believe someone has
                    accessed your account without permission. Official contact
                    details: [Barangay contact details to be confirmed].
                  </Text>

                  <Text style={styles.sectionTitle}>
                    5. Barangay services and requests
                  </Text>
                  <Text style={styles.body}>
                    The application may be used to submit digital requests,
                    including certificate requests and appointment requests,
                    and to view their status. Each request remains subject to
                    applicable requirements, review, availability, and action
                    by authorized Barangay personnel. Submitting a request
                    does not guarantee its approval, appointment availability,
                    or issuance of a document. Follow any additional
                    instructions shown in the application or provided by the
                    Barangay.
                  </Text>

                  <Text style={styles.sectionTitle}>6. Appropriate use</Text>
                  <Text style={styles.body}>
                    Do not use the application to submit knowingly false or
                    misleading information, impersonate another person,
                    access another account or data without permission,
                    interfere with the application, or use it for unlawful or
                    unauthorized purposes.
                  </Text>

                  <Text style={styles.sectionTitle}>
                    7. Availability and maintenance
                  </Text>
                  <Text style={styles.body}>
                    Access may be interrupted by maintenance, connectivity
                    problems, or circumstances outside the Barangay's control.
                    The Barangay will provide service notices when practical.
                    Use the Barangay's official channels if you cannot submit
                    an urgent request through the application.
                  </Text>

                  <Text style={styles.sectionTitle}>
                    8. Account restrictions or closure
                  </Text>
                  <Text style={styles.body}>
                    An account may be restricted or closed where necessary to
                    address suspected misuse or comply with applicable
                    requirements. The Barangay must confirm the specific
                    grounds, notice, and review process before adopting this
                    section. For questions, contact [Official contact details
                    to be confirmed].
                  </Text>

                  <Text style={styles.sectionTitle}>9. Privacy</Text>
                  <Text style={styles.body}>
                    Personal information is handled as described in the
                    application's Privacy Policy and applicable Philippine
                    privacy laws, including the Data Privacy Act of 2012
                    (Republic Act No. 10173).
                  </Text>

                  <Text style={styles.sectionTitle}>10. Changes</Text>
                  <Text style={styles.body}>
                    The Barangay may update these Terms after review and
                    approval. The approved version and its effective date
                    should be shown in the application. If a change requires
                    renewed user agreement, the Barangay should state how that
                    agreement will be obtained.
                  </Text>

                  <Text style={styles.sectionTitle}>11. Questions</Text>
                  <Text style={styles.body}>
                    For questions about these Terms, contact [Barangay office
                    contact details to be confirmed].
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
