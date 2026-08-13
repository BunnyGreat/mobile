export type ConfigPresence = Record<
  | "SUPABASE_URL"
  | "SUPABASE_ANON_KEY"
  | "FIREBASE_API_KEY"
  | "FIREBASE_AUTH_DOMAIN"
  | "FIREBASE_PROJECT_ID"
  | "FIREBASE_STORAGE_BUCKET"
  | "FIREBASE_MESSAGING_SENDER_ID"
  | "FIREBASE_APP_ID",
  boolean
>;

export const checkEnvConfig = (): ConfigPresence => {
  const map: ConfigPresence = {
    SUPABASE_URL: Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL),
    SUPABASE_ANON_KEY: Boolean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
    FIREBASE_API_KEY: Boolean(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    FIREBASE_AUTH_DOMAIN: Boolean(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    FIREBASE_PROJECT_ID: Boolean(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    FIREBASE_STORAGE_BUCKET: Boolean(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    FIREBASE_MESSAGING_SENDER_ID: Boolean(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    FIREBASE_APP_ID: Boolean(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
  };

  // Development-only console output (no values)
  if (__DEV__) {
    // Nicely formatted report
    console.groupCollapsed("[Config Diagnostics] Environment presence");
    Object.entries(map).forEach(([key, present]) => {
      // Only log boolean presence, never the value
      // eslint-disable-next-line no-console
      console.log(`${key}: ${present ? "present" : "missing"}`);
    });
    console.groupEnd();
  }

  return map;
};

export default checkEnvConfig;
