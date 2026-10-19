export type PickerTarget = {
  side: "front" | "back";
  source: "camera" | "gallery";
};

export const PENDING_PICKER_KEY = "registration.pending-id-picker";
const PENDING_RESULT_ATTEMPTS = 5;
const PENDING_RESULT_RETRY_DELAY_MS = 200;

export const parsePickerTarget = (rawTarget: string | null): PickerTarget | null => {
  if (!rawTarget) return null;

  try {
    const value: unknown = JSON.parse(rawTarget);
    if (
      typeof value === "object" &&
      value !== null &&
      "side" in value &&
      (value.side === "front" || value.side === "back") &&
      "source" in value &&
      (value.source === "camera" || value.source === "gallery")
    ) {
      return {
        side: value.side,
        source: value.source,
      };
    }
  } catch {
    return null;
  }

  return null;
};

export const restorePendingPickerResult = async <T>(
  getPendingResult: () => Promise<T | null>,
  wait: (delayMs: number) => Promise<void> = (delayMs) =>
    new Promise((resolve) => setTimeout(resolve, delayMs)),
): Promise<T | null> => {
  for (let attempt = 0; attempt < PENDING_RESULT_ATTEMPTS; attempt += 1) {
    const result = await getPendingResult();
    if (result) return result;
    if (attempt < PENDING_RESULT_ATTEMPTS - 1) {
      await wait(PENDING_RESULT_RETRY_DELAY_MS);
    }
  }
  return null;
};
