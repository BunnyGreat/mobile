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

const CardCheck: React.FC = () => (
  <View style={styles.checkCircle}>
    <Feather name="check" size={12} color={COLORS.white} />
  </View>
);

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
        activeOpacity={item.disabled ? 1 : 0.7}
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
          {isSelected && <View style={styles.cardAccent} />}

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
              <Text
                style={styles.cardDescription}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            ) : (
              <Text style={styles.comingSoon}>Coming soon</Text>
            )}
          </View>

          {isSelected && <CardCheck />}
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
        <Text style={styles.headerTitle}>Request Certificate</Text>
      </View>

      <ScreenContainer
        scrollable
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {certificateTypes.map(renderItem)}
        </View>
      </ScreenContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    paddingRight: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.h18,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
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
    borderRadius: 16,
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    minHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  cardSelected: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}03`,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  cardDisabled: {
    opacity: 0.35,
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerSelected: {
    backgroundColor: `${COLORS.primary}12`,
  },
  icon: {
    width: 24,
    height: 24,
  },
  textGroup: {
    marginTop: SPACING.lg,
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.heading,
    lineHeight: 22,
  },
  cardTitleSelected: {
    color: COLORS.primary,
  },
  cardDescription: {
    marginTop: SPACING.xs,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    lineHeight: 17,
  },
  comingSoon: {
    marginTop: SPACING.xs,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: SPACING.md,
  },
});

export default RequestCertificateScreen;
