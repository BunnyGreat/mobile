import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UnifiedRequest } from "../types/status.types";

const ARCHIVE_STORAGE_KEY = "@barangay/status/archive";

export interface ArchivedRequestRef {
  id: string;
  type: UnifiedRequest["type"];
  archivedAt: string;
}

export const loadArchivedRequests = async (): Promise<ArchivedRequestRef[]> => {
  try {
    const raw = await AsyncStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ArchivedRequestRef[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[STATUS ARCHIVE] Failed to load archive", error);
    return [];
  }
};

export const archiveRequest = async (request: UnifiedRequest): Promise<ArchivedRequestRef> => {
  const archived = await loadArchivedRequests();
  const nextEntries = archived.filter(
    (item) => !(item.id === request.id && item.type === request.type),
  );

  const entry: ArchivedRequestRef = {
    id: request.id,
    type: request.type,
    archivedAt: new Date().toISOString(),
  };

  nextEntries.unshift(entry);

  await AsyncStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(nextEntries));
  return entry;
};

export const isRequestArchived = (
  request: UnifiedRequest,
  archivedRequests: ArchivedRequestRef[],
): boolean => {
  return archivedRequests.some(
    (item) => item.id === request.id && item.type === request.type,
  );
};
