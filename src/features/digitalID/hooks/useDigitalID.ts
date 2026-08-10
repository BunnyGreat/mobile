import { useEffect, useState } from "react";
import { useProfile } from "../../profile/hooks/useProfile";
import type { DigitalIDDisplayData, DigitalIDLoadingState } from "../types/digitalID.types";
import { extractDigitalIDData } from "../utils/digitalID.utils";

export const useDigitalID = () => {
  const { profile, loading, error, refresh } = useProfile();
  const [isFlipped, setIsFlipped] = useState(false);
  const [digitalIDData, setDigitalIDData] = useState<DigitalIDDisplayData | null>(null);
  const [loadingState, setLoadingState] = useState<DigitalIDLoadingState>("idle");

  // Extract and format data when profile changes
  useEffect(() => {
    if (loading) {
      setLoadingState("loading");
    } else if (error) {
      setLoadingState("error");
      setDigitalIDData(null);
    } else if (profile) {
      const data = extractDigitalIDData(profile);
      setDigitalIDData(data);
      setLoadingState("success");
    } else {
      setLoadingState("idle");
      setDigitalIDData(null);
    }
  }, [profile, loading, error]);

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const resetFlip = () => {
    setIsFlipped(false);
  };

  return {
    // Data
    digitalIDData,
    profile,
    
    // State
    isFlipped,
    loadingState,
    
    // Actions
    toggleFlip,
    resetFlip,
    refresh,
    
    // Flags
    isLoading: loadingState === "loading",
    hasError: loadingState === "error",
    errorMessage: error,
    isReady: loadingState === "success" && digitalIDData !== null,
  };
};
