const fs = require("node:fs");
const path = require("node:path");
const appJson = require("./app.json");

module.exports = ({ config }) => {
  const expoConfig = appJson.expo;
  const configuredServicesPath =
    process.env.GOOGLE_SERVICES_JSON ??
    expoConfig.android.googleServicesFile;
  const googleServicesFile = path.resolve(__dirname, configuredServicesPath);

  if (!fs.existsSync(googleServicesFile)) {
    throw new Error(
      "Firebase Android configuration is missing. Provide GOOGLE_SERVICES_JSON or a local google-services.json file.",
    );
  }

  let googleServices;
  try {
    googleServices = JSON.parse(fs.readFileSync(googleServicesFile, "utf8"));
  } catch {
    throw new Error("Firebase Android configuration is not valid JSON.");
  }

  const androidApp = googleServices.client?.find(
    (client) =>
      client.client_info?.android_client_info?.package_name ===
      expoConfig.android.package,
  );
  const webClientId = androidApp?.oauth_client?.find(
    (client) => client.client_type === 3,
  )?.client_id;

  if (typeof webClientId !== "string" || !webClientId) {
    throw new Error(
      "Firebase Android configuration is missing the Google Web OAuth client ID.",
    );
  }

  return {
    ...config,
    ...expoConfig,
    android: {
      ...config.android,
      ...expoConfig.android,
      googleServicesFile,
    },
    extra: {
      ...config.extra,
      ...expoConfig.extra,
      googleWebClientId: webClientId,
    },
  };
};
