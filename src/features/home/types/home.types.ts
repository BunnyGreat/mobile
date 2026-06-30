import type { RootStackParamList } from "../../../navigation/types";

export type QuickActionRoute = keyof Pick<
  RootStackParamList,
  | "RequestCertificateScreen"
  | "AnnouncementScreen"
  | "FeedbackScreen"
  | "AppointmentScreen"
>;

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  route: QuickActionRoute;
}

export interface WeatherSummary {
  temperature: number;
  condition: string;
  icon: string;
  city: string;
  humidity?: number;
  windSpeed?: number;
}

export interface DashboardData {
  greeting: string;
  weather?: WeatherSummary | null;
  quickActions: QuickAction[];
}

export interface HomeState {
  dashboard: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export interface HomeStore extends HomeState {
  loadDashboard(): Promise<void>;
  refreshDashboard(): Promise<void>;
  clearDashboard(): void;
  setDashboard(data: DashboardData): void;
  setLoading(loading: boolean): void;
  setRefreshing(refreshing: boolean): void;
  setError(error: string | null): void;
}
