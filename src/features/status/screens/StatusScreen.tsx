import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import StatusFilter from "../components/StatusFilter";
import RequestStatusCard from "../components/RequestStatusCard";
import StatusSkeleton from "../components/StatusSkeleton";
import EmptyStatus from "../components/EmptyStatus";
import { useStatus } from "../hooks/useStatus";
import { useRefreshStatus } from "../hooks/useRefreshStatus";

const StatusScreen: React.FC = () => {
  const navigation = useNavigation();
  const { requests, loading, refreshing, activeFilter, setActiveFilter } =
    useStatus();
  const refresh = useRefreshStatus();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Status</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <StatusFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {loading && requests.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
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
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.white,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StatusScreen;
