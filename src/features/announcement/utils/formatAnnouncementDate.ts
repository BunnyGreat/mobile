import { format } from "date-fns";

export const formatAnnouncementDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 24) {
    if (hoursAgo < 1) {
      return "Just now";
    }
    if (hoursAgo < 24) {
      return `${Math.floor(hoursAgo)} hour${Math.floor(hoursAgo) === 1 ? "" : "s"} ago`;
    }
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return format(date, "MMMM d, yyyy");
};
