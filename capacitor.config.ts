const config: CapacitorConfig = {
  appId: 'com.layastyle.app',
  appName: 'layaStyle',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // تجعلها لا تظهر أبداً
      launchAutoHide: true,
    },
  },
};