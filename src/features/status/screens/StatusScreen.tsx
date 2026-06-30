import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import StatusFilter from "../components/StatusFilter";
import RequestStatusCard from "../components/RequestStatusCard";
import StatusSkeleton from "../components/StatusSkeleton";
import EmptyStatus from "../components/EmptyStatus";
import { useStatus } from "../hooks/useStatus";
import { useRefreshStatus } from "../hooks/useRefreshStatus";

const StatusScreen: React.FC = () => {
  const { requests, loading, refreshing, activeFilter, setActiveFilter } =
    useStatus();
  const refresh = useRefreshStatus();

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
        ) : requests.length === 0 ? (
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
});

export default StatusScreen;
