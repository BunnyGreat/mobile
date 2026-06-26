import { useProfileStore } from "../store/profile.store";

export const useProfile = () => {
  const profile = useProfileStore((state) => state.profile);
  const loading = useProfileStore((state) => state.loading);
  const error = useProfileStore((state) => state.error);
  const loadProfile = useProfileStore((state) => state.loadProfile);

  return {
    profile,
    loading,
    error,
    refresh: loadProfile,
  };
};
