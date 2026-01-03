import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foufou.app',
  appName: 'foufou',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
