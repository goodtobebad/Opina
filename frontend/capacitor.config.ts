import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.opina.app',
  appName: 'Opina',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Permet les connexions HTTP en développement
    allowNavigation: [
      'localhost',
      '*.opina.com'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4F46E5',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    }
  }
};

export default config;
