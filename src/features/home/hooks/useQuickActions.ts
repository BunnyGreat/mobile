import { useMemo } from "react";
import type { QuickAction } from "../types/home.types";
import { HOME_QUICK_ACTIONS } from "../utils/quickActions";

export const useQuickActions = () => {
  const quickActions = useMemo<QuickAction[]>(() => HOME_QUICK_ACTIONS, []);

  return {
    quickActions,
  };
};

export default useQuickActions;
