export type SingleFlightGuard = { current: boolean };

export const runSingleFlightAction = async <T>(
  guard: SingleFlightGuard,
  setLoading: (loading: boolean) => void,
  action: () => Promise<T>,
): Promise<T | undefined> => {
  if (guard.current) return undefined;

  guard.current = true;
  try {
    setLoading(true);
    return await action();
  } finally {
    guard.current = false;
    setLoading(false);
  }
};
