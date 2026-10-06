import React, { useEffect } from "react";
import {
  Alert,
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
import { AppButton } from "../../../components";
import { useProfileStore } from "../../../features/profile/store/profile.store";
import { useCertificateRequest } from "../hooks/useCertificateRequest";
import {
  CertificateSection,
  RequiredDocuments,
} from "../components/common/CertificateSections";
import { ReadOnlyField } from "../components/common/ReadOnlyField";
import type { RootStackParamList } from "../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const BarangayCertificationScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfileStore((state) => state.profile);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const { errors, isSubmitting, submitRequest } = useCertificateRequest();

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (errors.profile) {
      Alert.alert("Unable to Submit Request", errors.profile);
    }
  }, [errors.profile]);

  const fullName = profile
    ? [
        profile.personalInformation.firstName,
        profile.personalInformation.middleName,
        profile.personalInformation.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const address = profile
    ? `${profile.residenceInformation.houseNumber} ${profile.residenceInformation.street}, ${profile.residenceInformation.purok}, ${profile.residenceInformation.barangay}, ${profile.residenceInformation.municipality}, ${profile.residenceInformation.province}`
    : "";

  const handleSubmit = async () => {
    const requestId = await submitRequest("Barangay Certification");
    if (!requestId) {
      return;
    }

    Alert.alert(
      "Request Submitted",
      "Your Barangay Certification request has been submitted successfully.",
      [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("MainTabs", { screen: "Status" }),
        },
      ],
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
        <Text style={styles.headerTitle}>Barangay Certification</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CertificateSection
          icon="user"
          title="Applicant Information"
          subtitle="Pre-filled from your registered profile"
          isFirst
        >
          <ReadOnlyField label="Full Name" value={fullName} />
          <ReadOnlyField label="Complete Address" value={address} />
          <View style={styles.row}>
            <View style={styles.rowHalf}>
              <ReadOnlyField
                label="Date of Birth"
                value={profile?.personalInformation.dateOfBirth ?? ""}
              />
            </View>
            <View style={styles.rowHalf}>
              <ReadOnlyField
                label="Place of Birth"
                value={profile?.personalInformation.birthplace ?? ""}
              />
            </View>
          </View>
          <ReadOnlyField
            label="Contact Number"
            value={profile?.personalInformation.contactNumber ?? ""}
          />
        </CertificateSection>

        <RequiredDocuments />

        <View style={styles.submitSection}>
          <AppButton
            label="Submit Request"
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
            size="lg"
          />
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  rowHalf: {
    flex: 1,
  },
  submitSection: {
    marginTop: SPACING.xl,
  },
});

export default BarangayCertificationScreen;
