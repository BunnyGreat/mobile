import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import CharacterCounter from "./CharacterCounter";
import FeedbackTextArea from "./FeedbackTextArea";
import RatingStars from "./RatingStars";
import SubmitFeedbackButton from "./SubmitFeedbackButton";

interface FeedbackFormProps {
  rating: number;
  message: string;
  loading: boolean;
  onRatingChange: (value: number) => void;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  rating,
  message,
  loading,
  onRatingChange,
  onMessageChange,
  onSubmit,
}) => {
  return (
    <View style={styles.container}>
      {/* Rating Card */}
      <View style={styles.card}>
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Rate Your Experience</Text>
          <Text style={styles.sectionSubtitle}>
            How would you rate your overall experience?
          </Text>
          <View style={styles.starsContainer}>
            <RatingStars rating={rating} onChange={onRatingChange} />
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{rating}</Text>
            <Text style={styles.ratingLabel}>out of 5</Text>
          </View>
        </View>
      </View>

      {/* Feedback Text Card */}
      <View style={styles.card}>
        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>Share Your Thoughts</Text>
          <Text style={styles.sectionSubtitle}>
            Tell us what's on your mind — we value every word.
          </Text>
          <View style={styles.textAreaContainer}>
            <FeedbackTextArea value={message} onChangeText={onMessageChange} />
          </View>
          <CharacterCounter current={message.length} max={500} />
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <SubmitFeedbackButton loading={loading} onPress={onSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 78, 159, 0.05)",
  },
  ratingSection: {
    alignItems: "center",
  },
  textSection: {
    alignItems: "stretch",
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  starsContainer: {
    marginVertical: SPACING.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary + "10",
    borderRadius: 20,
  },
  ratingText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h24,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  ratingLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.primary,
  },
  textAreaContainer: {
    marginBottom: SPACING.sm,
  },
  buttonContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
});

export default FeedbackForm;
