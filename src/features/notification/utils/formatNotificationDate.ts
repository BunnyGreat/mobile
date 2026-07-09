import { formatRelativeTime } from "../../../utils/dateFormatter";

export const formatNotificationDate = (value?: string | null) => {
  return formatRelativeTime(value);
};
