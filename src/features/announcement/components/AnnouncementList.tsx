import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { COLORS, SPACING } from "../../../theme";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementEmptyState from "./AnnouncementEmptyState";
import AnnouncementSkeleton from "./AnnouncementSkeleton";
import type { Announcement } from "../types/announcement.types";

interface AnnouncementListProps {
  announcements: Announcement[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  loading,
  refreshing,
  onRefresh,
}) => {
  if (loading && announcements.length === 0) {
    return (
      <View style={styles.skeletonList}>
        <AnnouncementSkeleton />
        <AnnouncementSkeleton />
        <AnnouncementSkeleton />
      </View>
    );
  }

  if (!loading && announcements.length === 0) {
    return <AnnouncementEmptyState />;
  }

  return (
    <FlatList
      data={announcements}
      keyExtractor={(item) => item.announcementId}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      renderItem={({ item }) => <AnnouncementCard announcement={item} />}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: SPACING.huge,
  },
  skeletonList: {
    paddingTop: SPACING.xs,
  },
});

export default AnnouncementList;
