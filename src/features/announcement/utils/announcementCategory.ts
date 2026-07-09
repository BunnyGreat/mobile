import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react-native";
import { Bell, CloudRain, HeartPulse, Megaphone, PartyPopper, TriangleAlert } from "lucide-react-native";

export interface AnnouncementCategoryStyle {
  label: string;
  backgroundColor: string;
  textColor: string;
  icon: ComponentType<LucideProps>;
}

const categoryStyles: Record<string, AnnouncementCategoryStyle> = {
  emergency: {
    label: "Emergency",
    backgroundColor: "#FEE2E2",
    textColor: "#B91C1C",
    icon: TriangleAlert,
  },
  health: {
    label: "Health",
    backgroundColor: "#CCFBF1",
    textColor: "#0F766E",
    icon: HeartPulse,
  },
  events: {
    label: "Events",
    backgroundColor: "#DBEAFE",
    textColor: "#1D4ED8",
    icon: PartyPopper,
  },
  advisory: {
    label: "Advisory",
    backgroundColor: "#FEF3C7",
    textColor: "#92400E",
    icon: Megaphone,
  },
  weather: {
    label: "Weather",
    backgroundColor: "#DBEAFE",
    textColor: "#1E3A8A",
    icon: CloudRain,
  },
  general: {
    label: "General",
    backgroundColor: "#F3F4F6",
    textColor: "#111827",
    icon: Bell,
  },
};

export const getAnnouncementCategoryStyle = (category: string): AnnouncementCategoryStyle => {
  const normalized = category?.trim().toLowerCase();

  if (normalized?.includes("emergency")) {
    return categoryStyles.emergency;
  }

  if (normalized?.includes("health")) {
    return categoryStyles.health;
  }

  if (normalized?.includes("event")) {
    return categoryStyles.events;
  }

  if (normalized?.includes("advisory") || normalized?.includes("notice")) {
    return categoryStyles.advisory;
  }

  if (normalized?.includes("weather")) {
    return categoryStyles.weather;
  }

  return categoryStyles.general;
};

export const getAnnouncementCategoryLabel = (category: string) => {
  return getAnnouncementCategoryStyle(category).label;
};
