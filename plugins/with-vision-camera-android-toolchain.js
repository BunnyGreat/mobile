const {
  createRunOncePlugin,
  withDangerousMod,
  withSettingsGradle,
} = require("@expo/config-plugins");
const fs = require("fs/promises");
const path = require("path");

const KOTLIN_VERSION = "2.2.21";
const ANDROID_GRADLE_PLUGIN_VERSION = "8.11.1";
const GRADLE_VERSION = "8.13";
const NDK_VERSION = "27.3.13750724";
const GOOGLE_PLAY_SERVICES_AUTH_VERSION = "21.4.0";

const replaceVersion = async (filePath, pattern, replacement, expected) => {
  const contents = await fs.readFile(filePath, "utf8");
  const match = contents.match(pattern);
  if (!match || ![expected, replacement].includes(match[1])) {
    throw new Error(
      `Unable to configure Android native dependencies: unexpected version in ${filePath}.`,
    );
  }
  if (match[1] !== replacement) {
    await fs.writeFile(
      filePath,
      contents.replace(pattern, (line) =>
        line.replace(match[1], replacement),
      ),
    );
  }
};

const getNativePackageFile = (projectRoot, packageName, filePath) => {
  const packageJson = require.resolve(`${packageName}/package.json`, {
    paths: [projectRoot],
  });
  return path.join(path.dirname(packageJson), filePath);
};

const withVisionCameraAndroidToolchain = (config) =>
  withDangerousMod(
    withSettingsGradle(config, (config) => {
      const versionCatalogCall = "expoAutolinking.useExpoVersionCatalog()";
      const versionCatalogOverride = [
        "expoAutolinking.useExpoVersionCatalog {",
        `  version("agp", "${ANDROID_GRADLE_PLUGIN_VERSION}")`,
        `  version("ndkVersion", "${NDK_VERSION}")`,
        "}",
      ].join("\n");

      if (config.modResults.contents.includes(versionCatalogOverride)) {
        return config;
      }
      if (!config.modResults.contents.includes(versionCatalogCall)) {
        throw new Error(
          "Unable to configure the Vision Camera Android toolchain: Expo's version catalog call was not found.",
        );
      }

      config.modResults.contents = config.modResults.contents.replace(
        versionCatalogCall,
        versionCatalogOverride,
      );

      return config;
    }),
    [
      "android",
      async (config) => {
        const wrapperPath = path.join(
          config.modRequest.platformProjectRoot,
          "gradle",
          "wrapper",
          "gradle-wrapper.properties",
        );
        const contents = await fs.readFile(wrapperPath, "utf8");
        const distributionUrl = /distributionUrl=.*gradle-[\d.]+-bin\.zip/;
        if (!distributionUrl.test(contents)) {
          throw new Error(
            "Unable to configure the Vision Camera Android toolchain: Gradle wrapper distribution was not found.",
          );
        }

        const projectRoot = config.modRequest.projectRoot;
        const cameraBuildGradlePath = getNativePackageFile(
          projectRoot,
          "react-native-vision-camera",
          "android/build.gradle",
        );
        const detectorBuildGradlePath = getNativePackageFile(
          projectRoot,
          "react-native-vision-camera-face-detector",
          "android/build.gradle",
        );
        const nitroGoogleSignInBuildGradlePath = getNativePackageFile(
          projectRoot,
          "react-native-nitro-google-signin",
          "android/build.gradle",
        );

        await replaceVersion(
          cameraBuildGradlePath,
          /classpath "com\.android\.tools\.build:gradle:([^"]+)"/,
          ANDROID_GRADLE_PLUGIN_VERSION,
          "8.7.2",
        );
        await replaceVersion(
          detectorBuildGradlePath,
          /classpath "com\.android\.tools\.build:gradle:([^"]+)"/,
          ANDROID_GRADLE_PLUGIN_VERSION,
          "8.13.0",
        );
        await replaceVersion(
          detectorBuildGradlePath,
          /def kotlinVersion = safeExtGet\("VisionCameraFaceDetector_kotlinVersion", "([^"]+)"\)/,
          KOTLIN_VERSION,
          "2.1.20",
        );
        await replaceVersion(
          nitroGoogleSignInBuildGradlePath,
          /classpath "com\.android\.tools\.build:gradle:([^"]+)"/,
          ANDROID_GRADLE_PLUGIN_VERSION,
          "8.8.0",
        );
        await replaceVersion(
          nitroGoogleSignInBuildGradlePath,
          /implementation "com\.google\.android\.gms:play-services-auth:([^"]+)"/,
          GOOGLE_PLAY_SERVICES_AUTH_VERSION,
          "22.0.0",
        );

        await fs.writeFile(
          wrapperPath,
          contents.replace(
            distributionUrl,
            `distributionUrl=https\\://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip`,
          ),
        );
        return config;
      },
    ],
  );

module.exports = createRunOncePlugin(
  withVisionCameraAndroidToolchain,
  "with-vision-camera-android-toolchain",
  "1.0.0",
);
