export default {
  expo: {
    name: "kimo-app",
    slug: "kimo-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "kimo-app",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.fhakim.kimoapp",
    },
    android: {
      package: "com.fhakim.kimoapp",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "@clerk/expo",
      "expo-secure-store",
      "@stream-io/video-react-native-sdk",
      [
        "@config-plugins/react-native-webrtc",
        {
          cameraPermission:
            "Allow $(PRODUCT_NAME) to access your camera for video lessons.",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone for audio lessons.",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 24,
          },
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "kimoo-app",
          organization: "jshkm-7a",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      streamApiKey: process.env.STREAM_API_KEY,
    },
  },
};
