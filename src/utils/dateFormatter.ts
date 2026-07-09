import { format } from "date-fns";

export const formatDateShort = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }
    return format(date, "MMM d, yyyy");
  } catch {
    return "Recently";
  }
};

export const formatRelativeTime = (value?: string | null): string => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const msAgo = Date.now() - date.getTime();
  const minutesAgo = Math.max(0, Math.floor(msAgo / (1000 * 60)));
  const hoursAgo = Math.max(0, Math.floor(msAgo / (1000 * 60 * 60)));
  const daysAgo = Math.max(0, Math.floor(msAgo / (1000 * 60 * 60 * 24)));

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

  return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
};
