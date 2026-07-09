import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { formatAnnouncementDate } from "../utils/formatAnnouncementDate";
import { getAnnouncementCategoryStyle } from "../utils/announcementCategory";
import type { Announcement } from "../types/announcement.types";

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress?: (announcement: Announcement) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onPress,
}) => {
  const categoryStyle = getAnnouncementCategoryStyle(announcement.category);
  const CategoryIcon = categoryStyle.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(announcement)}
      style={styles.card}
    >
      <View
        style={[
          styles.imageWrapper,
          { backgroundColor: categoryStyle.backgroundColor },
        ]}
      >
        {announcement.bannerUrl ? (
          <Image
            source={{ uri: announcement.bannerUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconContainer}>
            <CategoryIcon size={28} color={categoryStyle.textColor} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: categoryStyle.backgroundColor },
          ]}
        >
          <Text
            style={[styles.categoryText, { color: categoryStyle.textColor }]}
          >
            {categoryStyle.label}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {announcement.title}
        </Text>

        <Text style={styles.description}>{announcement.description}</Text>

        <View style={styles.dateRow}>
          <Feather
            name="clock"
            size={12}
            color={COLORS.placeholder}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>
            {formatAnnouncementDate(
              announcement.publishedAt ??
                announcement.publishDate ??
                announcement.createdAt,
            )}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageWrapper: {
    width: 92,
    height: 92,
    borderRadius: 14,
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
    gap: SPACING.xs,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 2,
  },
  categoryText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    letterSpacing: 0.1,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
    lineHeight: 22,
  },
  description: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body13,
    color: COLORS.paragraph,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
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
