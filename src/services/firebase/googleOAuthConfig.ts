import { GoogleAuthenticationError } from "./googleAuthenticationError";

declare const require: (path: string) => unknown;

type GoogleServicesConfig = {
  client?: Array<{
    oauth_client?: Array<{
      client_id?: string;
      client_type?: number;
    }>;
  }>;
};

export const getGoogleWebClientId = (): string => {
  const config = require("../../../google-services.json") as GoogleServicesConfig;
  const webClientId = config.client
    ?.flatMap((client) => client.oauth_client ?? [])
    .find((client) => client.client_type === 3)?.client_id;

  if (!webClientId) {
    throw new GoogleAuthenticationError(
      "google_not_configured",
      "Google Sign-In is not configured for this app.",
    );
  }

  return webClientId;
};
