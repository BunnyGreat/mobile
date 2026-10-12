import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UnifiedRequest } from "../types/status.types";

const ARCHIVE_STORAGE_PREFIX = "@barangay/status/archive";
const LEGACY_ARCHIVE_STORAGE_KEY = ARCHIVE_STORAGE_PREFIX;
let legacyArchiveCleanup: Promise<void> | null = null;

const getArchiveStorageKey = (uid: string) => `${ARCHIVE_STORAGE_PREFIX}:${uid}`;

const removeLegacyArchive = async () => {
  if (!legacyArchiveCleanup) {
    legacyArchiveCleanup = AsyncStorage.removeItem(LEGACY_ARCHIVE_STORAGE_KEY).catch((error) => {
      console.warn("[STATUS ARCHIVE] Failed to remove legacy archive", error);
    });
  }
  await legacyArchiveCleanup;
};

export interface ArchivedRequestRef {
  id: string;
  type: UnifiedRequest["type"];
  archivedAt: string;
}

export const loadArchivedRequests = async (uid: string): Promise<ArchivedRequestRef[]> => {
  if (!uid) {
    return [];
  }

  try {
    await removeLegacyArchive();
    const raw = await AsyncStorage.getItem(getArchiveStorageKey(uid));
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

export const archiveRequest = async (
  uid: string,
  request: UnifiedRequest,
): Promise<ArchivedRequestRef> => {
  if (!uid) {
    throw new Error("Authentication required to archive status requests.");
  }

  const archived = await loadArchivedRequests(uid);
  const nextEntries = archived.filter(
    (item) => !(item.id === request.id && item.type === request.type),
  );

  const entry: ArchivedRequestRef = {
    id: request.id,
    type: request.type,
    archivedAt: new Date().toISOString(),
  };

  nextEntries.unshift(entry);

  await AsyncStorage.setItem(getArchiveStorageKey(uid), JSON.stringify(nextEntries));
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
