import { ImageSourcePropType } from "react-native";

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    title: "Request Certificate Online",
    description:
      "Apply for barangay certificate and track request status directly from your mobile devices.",
    image: require("../../assets/images/onboarding-1.png"),
  },
  {
    id: "2",
    title: "Stay Updated with Community Announcement",
    description:
      "Receive official barangay announcement public advisories, and local updated directly from Barangay San Isidro.",
    image: require("../../assets/images/onboarding-2.png"),
  },
  {
    id: "3",
    title: "Book Appointment Easily",
    description:
      "Schedule barangay services and appointment without waiting in long lines.",
    image: require("../../assets/images/onboarding-3.png"),
  },
];
