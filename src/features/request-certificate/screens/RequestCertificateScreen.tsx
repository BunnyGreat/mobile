import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather, Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useCertificateRequest } from "../hooks/useCertificateRequest";
import type { RootStackParamList } from "../../../navigation/types";
import type { CertificateTypeItem } from "../types/certificate.types";
import { BUSINESS_APPLICATION_TYPES } from "../constants/businessPermitTypes";
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../../../theme";

const getCertificateIcon = (
  id: string,
): ComponentProps<typeof Ionicons>["name"] => {
  switch (id) {
    case "barangay-clearance":
      return "shield-checkmark-outline";
    case "certificate-of-indigency":
      return "hand-left-outline";
    case "barangay-certification":
      return "document-text-outline";
    case "certificate-of-cohabitation":
      return "location-outline";
    case "business-clearance":
      return "shield-checkmark-outline";
    case "business-permit":
      return "storefront-outline";
    case "special-barangay-clearance":
      return "document-text-outline";
    default:
      return "document-text-outline";
  }
};

const RequestCertificateScreen = () => {
  const [indigencyModalVisible, setIndigencyModalVisible] = React.useState(false);
  const [businessPermitModalVisible, setBusinessPermitModalVisible] =
    React.useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { certificateTypes, selectCertificateType } = useCertificateRequest();

  const renderItem = (item: CertificateTypeItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={item.disabled ? 1 : 0.78}
        disabled={item.disabled}
        onPress={() => {
          if (!item.disabled) {
            selectCertificateType(item);
            if (item.id === "barangay-clearance") {
              navigation.navigate("BarangayClearance");
            } else if (item.id === "barangay-certification") {
              navigation.navigate("BarangayCertification");
            } else if (item.id === "certificate-of-indigency") {
              setIndigencyModalVisible(true);
            } else if (item.id === "business-permit") {
              setBusinessPermitModalVisible(true);
            }
          }
        }}
        style={styles.cardWrapper}
      >
        <View
          style={[
            styles.card,
            item.disabled && styles.cardDisabled,
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={getCertificateIcon(item.id)}
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.textGroup}>
              <Text
                style={styles.cardTitle}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              {item.description !== "Coming soon" ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {item.disabled ? (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming soon</Text>
                </View>
              ) : null}
            </View>
          </View>

          {!item.disabled && (
            <Feather
              name="chevron-right"
              size={20}
              color={COLORS.placeholder}
              style={styles.cardChevron}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color={COLORS.heading} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Request Certificate</Text>
          <Text style={styles.headerSubtitle}>
            Request a barangay certificate or document you need.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Available Certificates</Text>
          <View style={styles.grid}>{certificateTypes.map(renderItem)}</View>
        </View>
      </ScrollView>
      <Modal
        visible={indigencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIndigencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close Certificate of Indigency options"
            style={styles.modalBackdrop}
            onPress={() => setIndigencyModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleGroup}>
                <Text style={styles.modalTitle}>Certificate of Indigency</Text>
                <Text style={styles.modalDescription}>
                  Who is this certificate for?
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setIndigencyModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={20} color={COLORS.paragraph} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.75}
              style={styles.choiceCard}
              onPress={() => {
                setIndigencyModalVisible(false);
                navigation.navigate("CertificateOfIndigency");
              }}
            >
              <View style={styles.choiceIcon}>
                <Feather name="user" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.choiceTextGroup}>
                <Text style={styles.choiceTitle}>Pang-sarili</Text>
                <Text style={styles.choiceDescription}>
                  Apply using your registered resident information.
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={COLORS.placeholder}
              />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.75}
              style={styles.choiceCard}
              onPress={() => {
                setIndigencyModalVisible(false);
                navigation.navigate("CertificateOfIndigency", {
                  mode: "relative",
                });
              }}
            >
              <View style={styles.choiceIcon}>
                <Feather name="users" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.choiceTextGroup}>
                <Text style={styles.choiceTitle}>Pang-kamaganak</Text>
                <Text style={styles.choiceDescription}>
                  Request a certificate for a family member.
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={COLORS.placeholder}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={businessPermitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBusinessPermitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close Business Permit options"
            style={styles.modalBackdrop}
            onPress={() => setBusinessPermitModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleGroup}>
                <Text style={styles.modalTitle}>Business Permit</Text>
                <Text style={styles.modalDescription}>
                  Select New Application or Renewal.
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setBusinessPermitModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={20} color={COLORS.paragraph} />
              </TouchableOpacity>
            </View>
            {BUSINESS_APPLICATION_TYPES.map((applicationType) => {
              const isNew = applicationType === "New";
              return (
                <TouchableOpacity
                  key={applicationType}
                  accessibilityRole="button"
                  activeOpacity={0.75}
                  style={styles.choiceCard}
                  onPress={() => {
                    setBusinessPermitModalVisible(false);
                    navigation.navigate("BusinessPermit", { applicationType });
                  }}
                >
                  <View style={styles.choiceIcon}>
                    <Feather
                      name={isNew ? "file-plus" : "refresh-cw"}
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.choiceTextGroup}>
                    <Text style={styles.choiceTitle}>
                      {isNew ? "New Application" : "Renewal"}
                    </Text>
                    <Text style={styles.choiceDescription}>
                      {isNew
                        ? "Apply for a business permit for the first time."
                        : "Renew an existing business permit."}
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={COLORS.placeholder}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    paddingRight: SPACING.sm,
    paddingTop: 2,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.h20,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.heading,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  content: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  grid: {
    gap: SPACING.sm,
  },
  cardWrapper: {
    width: "100%",
  },
  card: {
    borderRadius: 14,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  cardDisabled: {
    opacity: 0.58,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}0D`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  textGroup: {
    flex: 1,
    paddingRight: SPACING.xs,
  },
  cardTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    lineHeight: 19,
    marginBottom: 2,
  },
  cardDescription: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    lineHeight: 16,
  },
  comingSoonBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: SPACING.xs,
  },
  comingSoonText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body11,
    color: COLORS.placeholder,
  },
  cardChevron: {
    marginLeft: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  modalCard: {
    borderRadius: 20,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  modalTitleGroup: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  modalTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
  },
  modalDescription: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    lineHeight: 20,
    color: COLORS.paragraph,
    marginTop: SPACING.xs,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.inputBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 76,
    padding: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}0D`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  choiceTextGroup: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  choiceTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    marginBottom: 2,
  },
  choiceDescription: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    lineHeight: 17,
    color: COLORS.paragraph,
  },
});

export default RequestCertificateScreen;
