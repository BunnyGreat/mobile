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

const DataPermissionsModal: React.FC<{
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
                  <Feather name="database" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>Data & Permissions</Text>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.content}>
                  <Text style={styles.intro}>
                    We request the following permissions to provide you with the best experience.
                  </Text>

                  <View style={styles.permissionItem}>
                    <View style={styles.permissionHeader}>
                      <Feather name="camera" size={20} color={COLORS.primary} />
                      <Text style={styles.permissionTitle}>Camera</Text>
                      <View style={styles.permissionBadge}>
                        <Text style={styles.permissionBadgeText}>Required</Text>
                      </View>
                    </View>
                    <Text style={styles.permissionDesc}>
                      Used to capture profile photos and ID documents for verification.
                    </Text>
                  </View>

                  <View style={styles.permissionItem}>
                    <View style={styles.permissionHeader}>
                      <Feather name="bell" size={20} color={COLORS.primary} />
                      <Text style={styles.permissionTitle}>Notifications</Text>
                      <View style={[styles.permissionBadge, styles.optionalBadge]}>
                        <Text style={[styles.permissionBadgeText, styles.optionalText]}>Optional</Text>
                      </View>
                    </View>
                    <Text style={styles.permissionDesc}>
                      Receive important updates and announcements from your barangay.
                    </Text>
                  </View>

                  <View style={styles.permissionItem}>
                    <View style={styles.permissionHeader}>
                      <Feather name="map-pin" size={20} color={COLORS.primary} />
                      <Text style={styles.permissionTitle}>Location</Text>
                      <View style={[styles.permissionBadge, styles.optionalBadge]}>
                        <Text style={[styles.permissionBadgeText, styles.optionalText]}>Optional</Text>
                      </View>
                    </View>
                    <Text style={styles.permissionDesc}>
                      Help us verify your residence within the barangay boundaries.
                    </Text>
                  </View>

                  <View style={styles.permissionItem}>
                    <View style={styles.permissionHeader}>
                      <Feather name="folder" size={20} color={COLORS.primary} />
                      <Text style={styles.permissionTitle}>Storage</Text>
                      <View style={styles.permissionBadge}>
                        <Text style={styles.permissionBadgeText}>Required</Text>
                      </View>
                    </View>
                    <Text style={styles.permissionDesc}>
                      Access to save and retrieve your documents and photos.
                    </Text>
                  </View>

                  <View style={styles.noteSection}>
                    <Feather name="info" size={16} color={COLORS.paragraph} />
                    <Text style={styles.noteText}>
                      You can manage these permissions at any time in your device settings.
                    </Text>
                  </View>
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
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  permissionItem: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  permissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  permissionTitle: {
    flex: 1,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
    marginLeft: SPACING.sm,
  },
  permissionBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}15`,
  },
  optionalBadge: {
    backgroundColor: `${COLORS.paragraph}15`,
  },
  permissionBadgeText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
  },
  optionalText: {
    color: COLORS.paragraph,
  },
  permissionDesc: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    lineHeight: 20,
    marginLeft: 28,
  },
  noteSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    lineHeight: 18,
    marginLeft: SPACING.sm,
  },
});

export default DataPermissionsModal;
