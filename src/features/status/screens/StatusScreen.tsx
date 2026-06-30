import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
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
        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Request Tracker</Text>
          <Text style={styles.pageSubtitle}>
            Track your certificate and appointment requests
          </Text>
        </View>

        <View style={styles.content}>
          <StatusFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {loading && requests.length === 0 ? (
            <View style={styles.loadingContainer}>
              {[1, 2, 3].map((i) => (
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  pageTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h24,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  loadingContainer: {
    paddingHorizontal: SPACING.lg,
  },
});

export default StatusScreen;
