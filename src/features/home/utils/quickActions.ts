import type { QuickAction } from "../types/home.types";

export const HOME_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "request-certificate",
    title: "Request Certificate",
    icon: "document-text-outline",
    route: "RequestCertificateScreen",
  },
  {
    id: "announcement",
    title: "Announcement",
    icon: "megaphone-outline",
    route: "AnnouncementScreen",
  },
  {
    id: "feedback",
    title: "Submit Feedback",
    icon: "chatbox-ellipses-outline",
    route: "FeedbackScreen",
  },
  {
    id: "appointment",
    title: "Appointment",
    icon: "calendar-outline",
    route: "AppointmentScreen",
  },
];

export default HOME_QUICK_ACTIONS;
