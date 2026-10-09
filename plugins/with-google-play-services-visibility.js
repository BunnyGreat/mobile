const {
  createRunOncePlugin,
  withAndroidManifest,
} = require("@expo/config-plugins");

const GOOGLE_PLAY_SERVICES_PACKAGE = "com.google.android.gms";

const withGooglePlayServicesVisibility = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const queries = manifest.queries ?? [];
    const combinedQueries = {
      package: [],
      intent: [],
      provider: [],
    };

    for (const query of queries) {
      for (const key of Object.keys(combinedQueries)) {
        combinedQueries[key].push(...(query[key] ?? []));
      }
    }

    const packageEntries = new Map();
    for (const packageEntry of combinedQueries.package) {
      const packageName = packageEntry.$["android:name"];
      if (!packageEntries.has(packageName)) {
        packageEntries.set(packageName, packageEntry);
      }
    }

    if (!packageEntries.has(GOOGLE_PLAY_SERVICES_PACKAGE)) {
      packageEntries.set(GOOGLE_PLAY_SERVICES_PACKAGE, {
        $: { "android:name": GOOGLE_PLAY_SERVICES_PACKAGE },
      });
    }

    combinedQueries.package = [...packageEntries.values()];
    manifest.queries = [combinedQueries];

    return config;
  });

module.exports = createRunOncePlugin(
  withGooglePlayServicesVisibility,
  "with-google-play-services-visibility",
  "1.0.0",
);
