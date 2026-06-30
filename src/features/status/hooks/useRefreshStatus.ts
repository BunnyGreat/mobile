import { useCallback } from "react";
import { useStatusStore } from "../store/status.store";

export const useRefreshStatus = () => {
  const refreshRequests = useStatusStore((state) => state.refreshRequests);

  return useCallback(() => refreshRequests(), [refreshRequests]);
};

export default useRefreshStatus;
