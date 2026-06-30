import { format } from "date-fns";

export const formatNotificationDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const msAgo = Date.now() - date.getTime();
  const minutesAgo = Math.floor(msAgo / (1000 * 60));
  const hoursAgo = Math.floor(msAgo / (1000 * 60 * 60));
  const daysAgo = Math.floor(msAgo / (1000 * 60 * 60 * 24));

  if (minutesAgo < 1) {
    return "Just now";
  }
  if (minutesAgo < 60) {
    return `${minutesAgo} minute${minutesAgo === 1 ? "" : "s"} ago`;
  }
  if (hoursAgo < 24) {
    return `${hoursAgo} hour${hoursAgo === 1 ? "" : "s"} ago`;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return format(date, "MMMM d, yyyy");
};
