import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather, Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SHADOWS,
  SPACING,
} from "../../../theme";
import type { RootStackParamList } from "../../../navigation/types";
import { formatDateShort } from "../../../utils/dateFormatter";
import { auth } from "../../../services/firebase/firebase";
import {
  isActiveRequest,
  useStatusStore,
} from "../../status/store/status.store";
import type {
  CertificateRequest,
  CertificateType,
  UnifiedRequest,
} from "../../status/types/status.types";
import { getStatusColor } from "../../status/utils/statusColor";
import {
  getCertificateTypeLabel,
  getStatusLabel,
} from "../../status/utils/statusLabel";
import { getTimelineForRequest } from "../../status/utils/statusTimeline";

const getCertificateIcon = (
  type: CertificateType,
): ComponentProps<typeof Ionicons>["name"] => {
  switch (type) {
    case "barangay_clearance":
    case "Barangay Clearance":
      return "shield-checkmark-outline";
    case "certificate_of_indigency":
    case "Certificate of Indigency":
      return "hand-left-outline";
    case "certificate_of_residency":
      return "home-outline";
    case "Barangay Certification":
      return "document-text-outline";
    case "Business Permit":
      return "storefront-outline";
    default:
      return "document-text-outline";
  }
};

const getRequestActivityTime = (request: UnifiedRequest): number => {
  const updatedAt = Date.parse(request.updatedAt);
  const createdAt = Date.parse(request.createdAt);
  return Math.max(
    Number.isNaN(updatedAt) ? 0 : updatedAt,
    Number.isNaN(createdAt) ? 0 : createdAt,
  );
};

const getStatusDescription = (request: UnifiedRequest): string =>
  getTimelineForRequest("certificate", request.status).find(
    (step) => step.status === request.status,
  )?.description ?? "Your request is being processed.";

const RecentCertificateRequests: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const requests = useStatusStore((state) => state.requests);
  const loading = useStatusStore((state) => state.loading);
  const error = useStatusStore((state) => state.error);
  const fetchRequests = useStatusStore((state) => state.fetchRequests);
  const refreshRequests = useStatusStore((state) => state.refreshRequests);
  const subscribeToRequests = useStatusStore(
    (state) => state.subscribeToRequests,
  );
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    void fetchRequests();
    return subscribeToRequests();
  }, [fetchRequests, subscribeToRequests]);

  const recentRequests = useMemo(
    () =>
      [...requests]
        .filter(
          (request) =>
            isActiveRequest(request) &&
            request.type === "certificate" &&
            Boolean(uid) &&
            (request.raw as CertificateRequest).uid === uid,
        )
        .sort((a, b) => getRequestActivityTime(b) - getRequestActivityTime(a))
        .slice(0, 4),
    [requests, uid],
  );

  const rows: UnifiedRequest[][] = [];
  for (let index = 0; index < recentRequests.length; index += 2) {
    rows.push(recentRequests.slice(index, index + 2));
  }

  const renderRequestCard = (request: UnifiedRequest) => {
    const certificate = request.raw as CertificateRequest;
    const statusColor = getStatusColor(request.status);

    return (
      <Pressable
        key={request.id}
        accessibilityRole="button"
        accessibilityLabel={`${request.title}, ${formatDateShort(request.createdAt)}, ${getStatusLabel(request.status)}`}
        onPress={() =>
          navigation.navigate("MainTabs", {
            screen: "Status",
            params: { filter: "certificates" },
          })
        }
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardTop}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getCertificateIcon(certificate.certificateType)}
              size={20}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.requestInfo}>
            <Text style={styles.requestName} numberOfLines={2}>
              {getCertificateTypeLabel(certificate.certificateType)}
            </Text>
            <Text style={styles.requestDate} numberOfLines={1}>
              {formatDateShort(request.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.cardStatus}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: `${statusColor}15` },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText} numberOfLines={1}>
              {getStatusLabel(request.status)}
            </Text>
          </View>
          <Text style={styles.statusDescription} numberOfLines={2}>
            {getStatusDescription(request)}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingAccent} />
        <View style={styles.headingText}>
          <Text style={styles.title}>Recent certificate requests</Text>
          <Text style={styles.subtitle}>Track your latest submissions</Text>
        </View>
      </View>

      {loading && recentRequests.length === 0 ? (
        <View style={styles.messageCard}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.messageText}>Loading your requests…</Text>
        </View>
      ) : recentRequests.length === 0 ? (
        <View style={styles.messageCard}>
          <Feather
            name={error ? "alert-circle" : "file-text"}
            size={22}
            color={error ? COLORS.danger : COLORS.placeholder}
          />
          <Text style={styles.messageTitle}>
            {error ? "Requests are unavailable" : "No certificate requests yet"}
          </Text>
          <Text style={styles.messageText}>
            {error
              ? "Check your connection and try again."
              : "Your recent certificate submissions will appear here."}
          </Text>
          {error ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void refreshRequests()}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <>
          <View style={styles.grid}>
            {rows.map((row, index) => (
              <View key={`request-row-${index}`} style={styles.gridRow}>
                {row.map(renderRequestCard)}
                {row.length === 1 ? <View style={styles.cardSpacer} /> : null}
              </View>
            ))}
          </View>
          {error ? (
            <Text style={styles.refreshError}>
              Couldn’t refresh request status. Showing the latest available data.
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  headingAccent: {
    width: 4,
    height: 34,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  headingText: {
    flex: 1,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  grid: {
    gap: SPACING.sm,
  },
  gridRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  card: {
    flex: 1,
    minWidth: 0,
    padding: SPACING.sm + 2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...SHADOWS.soft,
  },
  cardPressed: {
    opacity: 0.82,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${COLORS.primary}0D`,
  },
  requestName: {
    minHeight: 36,
    flexShrink: 1,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body13,
    lineHeight: 18,
    color: COLORS.heading,
  },
  requestInfo: {
    flex: 1,
    minWidth: 0,
  },
  requestDate: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginTop: SPACING.xs,
  },
  cardStatus: {
    paddingTop: SPACING.sm,
  },
  statusPill: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    flexShrink: 1,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body11,
    color: COLORS.heading,
  },
  statusDescription: {
    minHeight: 30,
    marginTop: SPACING.xs,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body11,
    lineHeight: 15,
    color: COLORS.paragraph,
  },
  messageCard: {
    minHeight: 128,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
  },
  messageTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    textAlign: "center",
  },
  messageText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    textAlign: "center",
  },
  retryButton: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  retryText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
  },
  cardSpacer: {
    flex: 1,
  },
  refreshError: {
    marginTop: SPACING.sm,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body11,
    color: COLORS.placeholder,
  },
});

export default RecentCertificateRequests;
