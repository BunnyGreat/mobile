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
