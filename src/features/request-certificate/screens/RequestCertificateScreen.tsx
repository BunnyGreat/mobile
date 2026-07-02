import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ScreenContainer } from "../../../components";
import { useCertificateRequest } from "../hooks/useCertificateRequest";
import type { RootStackParamList } from "../../../navigation/types";
import type { CertificateTypeItem } from "../types/certificate.types";
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../../../theme";

const CARD_WIDTH = "48%";

const getCertificateIcon = (id: string) => {
  switch (id) {
    case "barangay-clearance":
      return require("../../../../assets/icons/shield-check.png");
    case "certificate-of-indigency":
      return require("../../../../assets/icons/docs.png");
    case "barangay-certification":
      return require("../../../../assets/icons/digital-id.png");
    case "certificate-of-cohabitation":
      return require("../../../../assets/icons/location.png");
    case "business-clearance":
      return require("../../../../assets/icons/shield-check.png");
    case "special-barangay-clearance":
      return require("../../../../assets/icons/docs.png");
    default:
      return require("../../../../assets/icons/docs.png");
  }
};

const RequestCertificateScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { certificateTypes, selectedType, selectCertificateType } =
    useCertificateRequest();

  const renderItem = (item: CertificateTypeItem) => {
    const isSelected = selectedType?.id === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={item.disabled ? 1 : 0.65}
        disabled={item.disabled}
        onPress={() => {
          if (!item.disabled) {
            selectCertificateType(item);
            if (item.id === "barangay-clearance") {
              navigation.navigate("BarangayClearance");
            }
          }
        }}
        style={styles.cardWrapper}
      >
        <View
          style={[
            styles.card,
            isSelected && styles.cardSelected,
            item.disabled && styles.cardDisabled,
          ]}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                isSelected && styles.iconContainerSelected,
              ]}
            >
              <Image
                source={getCertificateIcon(item.id)}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>

            <View style={styles.textGroup}>
              <Text
                style={[
                  styles.cardTitle,
                  isSelected && styles.cardTitleSelected,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              {!item.disabled ? (
                <Text style={styles.cardDescription} numberOfLines={3}>
                  {item.description}
                </Text>
              ) : (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming soon</Text>
                </View>
              )}
            </View>
          </View>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <View style={styles.checkCircle}>
                <Feather name="check" size={11} color={COLORS.white} />
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
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
            Select a document to get started
          </Text>
        </View>
      </View>

      <ScreenContainer
        scrollable
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>{certificateTypes.map(renderItem)}</View>
      </ScreenContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.giant,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: SPACING.lg,
  },
  card: {
    borderRadius: 14,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    minHeight: 170,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    position: "relative",
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardDisabled: {
    opacity: 0.4,
  },
  cardContent: {
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  iconContainerSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  icon: {
    width: 26,
    height: 26,
  },
  textGroup: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h15,
    color: COLORS.heading,
    lineHeight: 21,
    marginBottom: SPACING.xs,
  },
  cardTitleSelected: {
    color: COLORS.primary,
  },
  cardDescription: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    lineHeight: 17,
  },
  comingSoonBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 1,
    borderRadius: 6,
    marginTop: SPACING.xs - 2,
  },
  comingSoonText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body11,
    color: COLORS.placeholder,
  },
  selectedIndicator: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default RequestCertificateScreen;
