import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { formatAnnouncementDate } from "../utils/formatAnnouncementDate";
import { getAnnouncementCategoryLabel } from "../utils/announcementCategory";
import type { Announcement } from "../types/announcement.types";

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress?: (announcement: Announcement) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onPress,
}) => {
  const category = getAnnouncementCategoryLabel(announcement.category);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(announcement)}
      style={styles.card}
    >
      {/* Left side - Image or Icon */}
      <View style={styles.imageWrapper}>
        {announcement.bannerUrl ? (
          <Image
            source={{ uri: announcement.bannerUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconContainer}>
            <Feather name="bell" size={28} color={COLORS.primary} />
          </View>
        )}
      </View>

      {/* Right side - Content */}
      <View style={styles.content}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {announcement.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {announcement.description}
        </Text>

        {/* Date */}
        <View style={styles.dateRow}>
          <Feather
            name="clock"
            size={12}
            color={COLORS.placeholder}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>
            {formatAnnouncementDate(announcement.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageWrapper: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: SPACING.md,
    backgroundColor: "#F1F5F9",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  categoryText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
    lineHeight: 22,
    marginBottom: 4,
  },
  description: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
});

export default AnnouncementCard;
