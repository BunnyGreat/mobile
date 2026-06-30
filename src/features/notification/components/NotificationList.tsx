import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { COLORS, SPACING } from "../../../theme";
import NotificationCard from "./NotificationCard";
import NotificationEmptyState from "./NotificationEmptyState";
import NotificationSkeleton from "./NotificationSkeleton";
import type { Notification } from "../types/notification.types";

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onNotificationPress?: (notification: Notification) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  refreshing,
  onRefresh,
  onNotificationPress,
}) => {
  if (loading && notifications.length === 0) {
    return (
      <View style={styles.skeletonList}>
        <NotificationSkeleton />
        <NotificationSkeleton />
        <NotificationSkeleton />
      </View>
    );
  }

  if (!loading && notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.notificationId}
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
      renderItem={({ item }) => (
        <NotificationCard notification={item} onPress={onNotificationPress} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: SPACING.huge,
  },
  skeletonList: {
    flex: 1,
  },
});

export default NotificationList;
