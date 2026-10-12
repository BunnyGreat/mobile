export const isGooglePlayServicesUnavailableError = (
  error: unknown,
  unavailableCode: string,
): boolean => {
  if (typeof error !== "object" || error === null) return false;

  const candidate = error as { code?: unknown; message?: unknown };
  const code = typeof candidate.code === "string" ||
      typeof candidate.code === "number"
    ? String(candidate.code)
    : "";
  if (code === unavailableCode || code === "SERVICE_INVALID") return true;

  const message = typeof candidate.message === "string"
    ? candidate.message
    : "";
  if (!/google play services/i.test(message)) return false;

  return code === "9" ||
    /\b(?:status(?: code)?|code)\s*(?:=|:)\s*9\b/i.test(message) ||
    /\bSERVICE_INVALID\b/i.test(message);
};
