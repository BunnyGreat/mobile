import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import AnnouncementCategoryTabs from "../components/AnnouncementCategoryTabs";
import AnnouncementList from "../components/AnnouncementList";
import { useAnnouncements } from "../hooks/useAnnouncements";

const AnnouncementScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    announcements,
    loading,
    refreshing,
    activeCategory,
    setActiveCategory,
    refreshAnnouncements,
  } = useAnnouncements();

  const filteredAnnouncements = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 30,
    );

    return announcements.filter((announcement) => {
      const createdAt = new Date(announcement.createdAt);
      const isRecent = createdAt >= thirtyDaysAgo;
      return activeCategory === "latest" ? isRecent : !isRecent;
    });
  }, [announcements, activeCategory]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color={COLORS.heading} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Announcements</Text>
            <Text style={styles.headerSubtitle}>
              Community Updates and Public Information
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <AnnouncementCategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {loading && filteredAnnouncements.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <AnnouncementList
            announcements={filteredAnnouncements}
            loading={loading}
            refreshing={refreshing}
            onRefresh={refreshAnnouncements}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.xxl + 8,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h24,
    color: COLORS.heading,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.placeholder,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AnnouncementScreen;
