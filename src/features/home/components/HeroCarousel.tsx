import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
  SHADOWS,
} from "../../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SCREEN_PADDING = 16;
const ITEM_WIDTH = SCREEN_WIDTH;
const CARD_WIDTH = SCREEN_WIDTH - SCREEN_PADDING * 2;
const CARD_HEIGHT = 165;

const heroCards = [
  {
    id: "1",
    category: "STAY INFORMED",
    title: "Community updates",
    description:
      "Visit Announcements for notices and updates shared by the barangay.",
    backgroundColor: "#1565C0",
    iconImage: require("../../../../assets/icons/megaphone.png"),
  },
  {
    id: "2",
    category: "APPOINTMENTS",
    title: "Book Appointments Online",
    description:
      "Easily schedule a consultation with the Barangay Captain regarding community concerns, requests, and local issues.",
    backgroundColor: "#1B7F2A",
    iconImage: require("../../../../assets/icons/calendar-time.png"),
  },
  {
    id: "3",
    category: "CERTIFICATES",
    title: "Request Certificates Online",
    description:
      "Apply for barangay clearances, residency certificates, and other official documents anytime, anywhere.",
    backgroundColor: "#FBCB0A",
    iconImage: require("../../../../assets/icons/docs.png"),
  },
  {
    id: "4",
    category: "DIGITAL ID",
    title: "Access Your Digital ID",
    description:
      "View and use your resident digital identification securely from your mobile device.",
    backgroundColor: "#7B1FA2",
    iconImage: require("../../../../assets/icons/digital-id.png"),
  },
];

const HeroCarousel: React.FC = () => {
  const flatRef = useRef<FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentIndex]);

  const startAutoPlay = () => {
    stopAutoPlay();
    timerRef.current = setTimeout(() => {
      const next = (currentIndex + 1) % heroCards.length;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }, 4000);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const onMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    setCurrentIndex(index);
  };

  const renderCard = ({ item }: { item: any }) => (
    <View style={styles.itemWrapper}>
      <View
        style={[
          styles.card,
          { backgroundColor: item.backgroundColor, width: CARD_WIDTH },
        ]}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>

          <View style={styles.cardRight}>
            <View style={styles.iconContainer}>
              <Image
                source={item.iconImage}
                style={{ width: 32, height: 32, resizeMode: "contain" }}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={heroCards}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.pagination}>
        {heroCards.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : undefined,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  listContent: { paddingHorizontal: 0 },
  itemWrapper: {
    width: ITEM_WIDTH,
    alignItems: "center",
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 24,
    padding: 18,
    width: CARD_WIDTH,
    ...SHADOWS.small,
  },
  cardRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  cardLeft: { flex: 1, paddingRight: SPACING.md },
  category: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    marginBottom: SPACING.sm,
  },
  cardDesc: { color: COLORS.white, fontSize: FONT_SIZE.body14, lineHeight: 20 },
  cardRight: { width: 80, alignItems: "center" },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  pagination: {
    flexDirection: "row",
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
});

export default HeroCarousel;
