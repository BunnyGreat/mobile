// Screens
export { default as DigitalIDScreen } from "./screens/DigitalIDScreen";

// Components
export {
  DigitalIDFront,
  DigitalIDBack,
  DigitalIDCard,
  DigitalIDLoading,
  DigitalIDFlipButton,
} from "./components";

// Hooks
export { useDigitalID } from "./hooks/useDigitalID";

// Types
export type {
  DigitalIDState,
  DigitalIDData,
  DigitalIDDisplayData,
  DigitalIDLoadingState,
} from "./types/digitalID.types";

// Utils
export {
  formatDateForDisplay,
  capitalizeWords,
  extractDigitalIDData,
  formatPhoneNumber,
} from "./utils/digitalID.utils";
