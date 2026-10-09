import type { DashboardData } from "../types/home.types";
import { getHomeCache, saveHomeCache } from "./homeCache.service";
import { HOME_QUICK_ACTIONS } from "../utils/quickActions";
import { formatGreeting } from "../utils/formatGreeting";

export const getDashboard = async (): Promise<DashboardData> => {
  try {
    const cachedDashboard = await getHomeCache();
    if (cachedDashboard) {
      return cachedDashboard;
    }

    const dashboard: DashboardData = {
      greeting: formatGreeting(),
      quickActions: HOME_QUICK_ACTIONS,
    };

    await saveHomeCache(dashboard);
    return dashboard;
  } catch (error: unknown) {
    console.error("[DASHBOARD] Unexpected error", error);
    return {
      greeting: formatGreeting(),
      quickActions: HOME_QUICK_ACTIONS,
    };
  }
};

export default getDashboard;
