import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { AppHeader } from "../../../components/ui";
import { COLORS, SPACING } from "../../../theme";
import FeedbackForm from "../components/FeedbackForm";
import { useFeedback } from "../hooks/useFeedback";
import {
  clearFeedbackDraft,
  loadFeedbackDraft,
  saveFeedbackDraft,
} from "../services/feedbackCache.service";
import { validateFeedback } from "../utils/validateFeedback";

const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const { loading, error, success, submitFeedback, clearState } = useFeedback();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await loadFeedbackDraft();
      if (draft) {
        setMessage(draft);
      }
    };

    loadDraft();
  }, []);

  useEffect(() => {
    if (success) {
      Alert.alert(
        "Feedback Submitted",
        "Thank you for sharing your feedback with us.",
      );
      setMessage("");
      setRating(5);
      clearFeedbackDraft();
      clearState();
      navigation.goBack();
    }
  }, [success, clearState, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert("Submission failed", error);
      clearState();
    }
  }, [error, clearState]);

  useEffect(() => {
    saveFeedbackDraft(message);
  }, [message]);

  const validationError = validateFeedback(message, rating);

  const handleSubmit = async () => {
    if (loading || validationError) {
      if (validationError) {
        Alert.alert("Invalid feedback", validationError);
      }
      return;
    }

    await submitFeedback({ rating, message });
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Feedback"
        leftAction={<Feather name="chevron-left" size={22} color={COLORS.heading} />}
        onLeftActionPress={() => navigation.goBack()}
        centered
        showDivider={false}
        backgroundColor={COLORS.white}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FeedbackForm
              rating={rating}
              message={message}
              loading={loading}
              onRatingChange={setRating}
              onMessageChange={setMessage}
              onSubmit={handleSubmit}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Content
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
});

export default FeedbackScreen;
