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
                    Draft for Barangay review. Effective date: [To be confirmed
                    after official approval].
                  </Text>

                  <Text style={styles.sectionTitle}>
                    Information collected
                  </Text>
                  <Text style={styles.body}>
                    During registration and use of Barangay San Isidro's
                    e-Barangay application, information may include your name,
                    date and place of birth, contact details, email address,
                    gender, civil status, and residential address. The
                    application also collects your profile photo and images of
                    identification documents that you submit. Service requests,
                    appointment details, and their status may also be
                    associated with your account.
                  </Text>

                  <Text style={styles.sectionTitle}>
                    Why information is used
                  </Text>
                  <Text style={styles.body}>
                    Information is used to review and verify resident accounts,
                    provide and administer Barangay services, process and
                    follow up on digital requests, communicate about those
                    requests, and maintain application records. The Barangay
                    should confirm any additional purposes before this policy
                    is approved.
                  </Text>

                  <Text style={styles.sectionTitle}>
                    Storage and service providers
                  </Text>
                  <Text style={styles.body}>
                    Registration records are handled using Firebase services,
                    including Firebase Authentication and Firestore. The
                    application uses Supabase services for email verification
                    and for storing uploaded profile photos and identification
                    images. These providers process information to support the
                    application. The Barangay must confirm the applicable
                    provider terms, storage locations, and safeguards before
                    publication.
                  </Text>

                  <Text style={styles.sectionTitle}>
                    Protection and authorized access
                  </Text>
                  <Text style={styles.body}>
                    Access should be limited to authorized Barangay personnel
                    who need the information to review accounts or provide
                    services, and to service providers as needed to operate the
                    application. The Barangay must confirm its access controls
                    and other administrative, physical, and technical
                    safeguards. No method of electronic storage or
                    transmission can be guaranteed to be completely secure.
                  </Text>

                  <Text style={styles.sectionTitle}>Sharing and disclosure</Text>
                  <Text style={styles.body}>
                    Information may be made available to authorized Barangay
                    personnel and the service providers described above for
                    the purposes in this Policy. It may also be disclosed when
                    required by law. Any other recipients or sharing purposes
                    must be identified and approved by the Barangay before
                    publication; no additional recipients are confirmed here.
                  </Text>

                  <Text style={styles.sectionTitle}>Retention and deletion</Text>
                  <Text style={styles.body}>
                    Information should be retained only as long as needed for
                    its stated purpose or as required by applicable rules. The
                    retention periods, archival practices, and deletion
                    process have not been confirmed and must be completed by
                    the Barangay and its Data Protection Officer (DPO):
                    [Retention and deletion details to be confirmed].
                  </Text>

                  <Text style={styles.sectionTitle}>
                    Your privacy rights
                  </Text>
                  <Text style={styles.body}>
                    Under the Data Privacy Act of 2012 (Republic Act No.
                    10173), you may have rights such as being informed about
                    processing, accessing or correcting information, objecting
                    to or requesting the blocking or erasure of information,
                    and filing a complaint, subject to applicable law. To
                    make a request, contact [DPO name and contact details to
                    be confirmed]. The Barangay may need to verify your
                    identity before acting on a request.
                  </Text>

                  <Text style={styles.sectionTitle}>
                    Security concerns and incidents
                  </Text>
                  <Text style={styles.body}>
                    If you believe your account or information has been
                    accessed improperly, contact [DPO or Barangay contact
                    details to be confirmed]. The Barangay must confirm its
                    incident-handling and notification procedures before this
                    Policy is approved.
                  </Text>

                  <Text style={styles.sectionTitle}>Policy updates</Text>
                  <Text style={styles.body}>
                    This Policy may be updated after Barangay review and
                    approval. The current approved version and its effective
                    date should be made available in the application.
                  </Text>

                  <Text style={styles.sectionTitle}>Contact</Text>
                  <Text style={styles.body}>
                    For privacy questions or requests, contact [Barangay
                    office contact details and DPO information to be
                    confirmed].
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
