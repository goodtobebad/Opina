import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

export const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    console.log('Initialisation de Capacitor sur plateforme native');

    // Configuration de la barre de statut
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#4F46E5' }); // Couleur primary
    } catch (error) {
      console.error('Erreur StatusBar:', error);
    }

    // Masquer le splash screen après le chargement
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Erreur SplashScreen:', error);
    }

    // Gérer le bouton retour sur Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    // Gérer quand l'app revient au premier plan
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
    });

    console.log('Platform:', Capacitor.getPlatform());
  }
};

export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();
