import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.layastyle.app',
  appName: 'layaStyle',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
