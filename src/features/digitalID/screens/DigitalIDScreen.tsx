import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import ScreenContainer from "../../../components/common/ScreenContainer";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { useDigitalID } from "../hooks/useDigitalID";
import {
  DigitalIDCard,
  DigitalIDLoading,
  DigitalIDFlipButton,
} from "../components";
import { EmptyState } from "../../../components/common/EmptyState";

const DigitalIDScreen: React.FC = () => {
  const { digitalIDData, isFlipped, toggleFlip, isLoading, hasError, refresh } =
    useDigitalID();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  // Load profile on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!digitalIDData && !isLoading) {
        refresh();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer scrollable style={styles.container} padding={0}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Loading State */}
        {isLoading && (
          <View style={styles.centerContent}>
            <DigitalIDLoading />
            <Text style={styles.loadingText}>Loading your Digital ID...</Text>
          </View>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <View style={styles.centerContent}>
            <EmptyState
              title="Unable to Load Digital ID"
              description="Please make sure you're logged in and have a complete profile."
              actionLabel="Retry"
              onActionPress={handleRefresh}
            />
          </View>
        )}

        {/* Success State */}
        {!isLoading && !hasError && digitalIDData && (
          <>
            {/* Card */}
            <View style={styles.safeCardSection}>
              <View style={styles.cardSection}>
                <DigitalIDCard data={digitalIDData} isFlipped={isFlipped} />
              </View>
            </View>

            {/* Information */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>PROTOTYPE DIGITAL ID</Text>
              <Text style={styles.infoText}>
                This Digital ID is for preview purposes only and is not an
                official identification document.
              </Text>
              <View style={styles.infoDivider} />
              <Text style={styles.disclaimerText}>
                To obtain an official Barangay ID, please visit the Barangay San
                Isidro office and submit your request. Validity: 1 year from the
                date of validation and approval.
              </Text>
            </View>

            {/* Flip Button - Below Description */}
            <View style={styles.flipButtonSection}>
              <DigitalIDFlipButton isFlipped={isFlipped} onPress={toggleFlip} />
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: SPACING.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.lg,
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
  },
  cardSection: {
    alignItems: "center",
    marginVertical: SPACING.sm,
  },
  safeCardSection: {
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  flipButtonSection: {
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  infoSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: "transparent",
    marginHorizontal: 0,
    borderRadius: 0,
  },
  infoTitle: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h18,
    textAlign: "center",
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  infoText: {
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    textAlign: "center",
    marginBottom: SPACING.md,
    lineHeight: FONT_SIZE.body14 * 1.5,
  },
  disclaimerText: {
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    textAlign: "center",
    lineHeight: FONT_SIZE.body14 * 1.5,
  },
  infoDivider: {
    width: "80%",
    height: 1,
    backgroundColor: COLORS.border || COLORS.paragraph,
    alignSelf: "center",
    marginVertical: SPACING.sm,
  },
});

export default DigitalIDScreen;
