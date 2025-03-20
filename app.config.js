module.exports = {
  expo: {
    name: "Lexera Life",
    slug: "lexera-life",
    version: "1.0.0",
    android: {
      package: "com.lexera.life",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      // Add the required manifest attributes to fix the merger conflict
      androidManifest: {
        application: {
          "tools:replace": "android:appComponentFactory",
        },
      },
    },
    // Add the correct EAS project ID
    extra: {
      eas: {
        projectId: "e7b316fc-13bd-4d53-ab2f-a47c01fbeb74"
      }
    },
    // Add XML namespaces for tools
    androidManifestNamespaces: {
      tools: "http://schemas.android.com/tools"
    }
  }
};
