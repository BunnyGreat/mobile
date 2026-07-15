import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import StatusFilter from "../components/StatusFilter";
import RequestStatusCard from "../components/RequestStatusCard";
import StatusSkeleton from "../components/StatusSkeleton";
import EmptyStatus from "../components/EmptyStatus";
import { useStatus } from "../hooks/useStatus";
import { useRefreshStatus } from "../hooks/useRefreshStatus";

const StatusScreen: React.FC = () => {
  const route = useRoute<any>();
  const {
    requests,
    archivedRequests,
    loading,
    refreshing,
    activeFilter,
    setActiveFilter,
  } = useStatus();
  const refresh = useRefreshStatus();

  useEffect(() => {
    const filter = route?.params?.filter;
    if (filter && filter !== activeFilter) {
      setActiveFilter(filter);
    }
  }, [activeFilter, route?.params?.filter, setActiveFilter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <View style={styles.container}>
        <StatusFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {loading && requests.length === 0 ? (
          <View style={styles.skeletonContainer}>
            {[1, 2].map((i) => (
              <StatusSkeleton key={i} />
            ))}
          </View>
        ) : requests.length === 0 && archivedRequests.length === 0 ? (
          <EmptyStatus />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListHeaderComponent={
              activeFilter === "archive" && archivedRequests.length > 0 ? (
                <View style={styles.archiveSection}>
                  <Text style={styles.archiveTitle}>Archive</Text>
                  <Text style={styles.archiveSubtitle}>
                    Completed and rejected requests are stored here locally.
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => <RequestStatusCard request={item} />}
            scrollEnabled={true}
          />
        )}
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
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  skeletonContainer: {
    paddingHorizontal: SPACING.lg,
  },
  archiveSection: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  archiveTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  archiveSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginBottom: SPACING.sm,
  },
});

export default StatusScreen;
