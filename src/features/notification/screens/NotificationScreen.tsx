import React, { useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import NotificationList from "../components/NotificationList";
import { useNotifications } from "../hooks/useNotifications";
import { useRefreshNotifications } from "../hooks/useRefreshNotifications";
import { useMarkAsRead } from "../hooks/useMarkAsRead";
import type { Notification } from "../types/notification.types";

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { notifications, loading, refreshing } = useNotifications();
  const refresh = useRefreshNotifications();
  const markAsRead = useMarkAsRead();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }

    if (notification.type === "announcement") {
      navigation.navigate("AnnouncementScreen");
      return;
    }

    if (notification.type === "appointment") {
      navigation.navigate("MainTabs", {
        screen: "Status",
        params: { filter: "appointments" },
      });
      return;
    }

    if (notification.type === "certificate") {
      navigation.navigate("MainTabs", {
        screen: "Status",
        params: { filter: "certificates" },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Minimal Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {notifications.filter((n) => !n.isRead).length} new
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading && notifications.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <NotificationList
              notifications={notifications}
              loading={loading}
              refreshing={refreshing}
              onRefresh={refresh}
              onNotificationPress={handleNotificationPress}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
  },
  unreadBadgeText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NotificationScreen;
