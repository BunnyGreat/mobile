import { formatRelativeTime } from "../../../utils/dateFormatter";

export const formatAnnouncementDate = (value?: string | null) => {
  return formatRelativeTime(value);
};
