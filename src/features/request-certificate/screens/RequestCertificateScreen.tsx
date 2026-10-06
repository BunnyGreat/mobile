import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useCertificateRequest } from "../hooks/useCertificateRequest";
import type { RootStackParamList } from "../../../navigation/types";
import type { CertificateTypeItem } from "../types/certificate.types";
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../../../theme";

const getCertificateIcon = (id: string) => {
  switch (id) {
    case "barangay-clearance":
      return require("../../../../assets/icons/shield-check.png");
    case "certificate-of-indigency":
      return require("../../../../assets/icons/docs.png");
    case "barangay-certification":
      return require("../../../../assets/icons/docs.png");
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
              <Image
                source={getCertificateIcon(item.id)}
                style={styles.icon}
                resizeMode="contain"
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
  icon: {
    width: 24,
    height: 24,
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
});

export default RequestCertificateScreen;
