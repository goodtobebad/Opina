# Configuration Mobile - Opina

## 📱 Configuration Capacitor Terminée ! ✅

Votre application web Opina a été adaptée avec succès pour iOS et Android.

---

## 🎯 Ce qui a été fait

### 1. **Installation des packages**
- ✅ `@capacitor/core` - Cœur de Capacitor
- ✅ `@capacitor/cli` - CLI Capacitor
- ✅ `@capacitor/ios` - Support iOS
- ✅ `@capacitor/android` - Support Android
- ✅ `@capacitor/app` - Gestion lifecycle app
- ✅ `@capacitor/splash-screen` - Splash screen natif
- ✅ `@capacitor/status-bar` - Barre de statut

### 2. **Fichiers créés**
- ✅ `capacitor.config.ts` - Configuration Capacitor
- ✅ `src/capacitor.ts` - Initialisation et helpers
- ✅ Dossiers `android/` et `ios/` avec projets natifs

### 3. **Modifications**
- ✅ `vite.config.ts` - Base relative pour Capacitor
- ✅ `src/lib/api.ts` - Détection environnement mobile/web
- ✅ `src/main.tsx` - Initialisation Capacitor
- ✅ Corrections TypeScript dans CreerSondage et Historique

---

## 🚀 Prochaines Étapes

### **Pour Android**

#### 1. Installer Android Studio
- Télécharger : https://developer.android.com/studio
- Installer le SDK Android

#### 2. Ouvrir le projet Android
```bash
cd C:\Users\Amar\Documents\Opina\frontend
npx cap open android
```

#### 3. Configurer l'URL API
Dans `src/lib/api.ts`, remplacez l'IP par votre IP locale :
```typescript
// Trouvez votre IP locale avec : ipconfig
return 'http://192.168.1.100:3000/api'; // VOTRE IP ICI
```

#### 4. Lancer l'émulateur ou connecter un téléphone
- Dans Android Studio : Tools → Device Manager → Create Device
- Ou connecter votre téléphone en USB avec mode développeur activé

#### 5. Run
Cliquer sur le bouton ▶️ Run dans Android Studio

---

### **Pour iOS**

⚠️ **Nécessite un Mac avec Xcode**

#### 1. Installer CocoaPods
```bash
sudo gem install cocoapods
```

#### 2. Installer les dépendances
```bash
cd ios/App
pod install
```

#### 3. Ouvrir le projet
```bash
npx cap open ios
```

#### 4. Run sur simulateur ou iPhone

---

## 🔄 Workflow de développement

### Après chaque modification du code :

```bash
# 1. Build le frontend
npm run build

# 2. Synchroniser avec les plateformes natives
npx cap sync

# 3. (Optionnel) Ouvrir dans l'IDE natif
npx cap open android
# ou
npx cap open ios
```

---

## 📝 Configuration Importante

### **URL Backend pour mobile**

Le fichier `src/lib/api.ts` détecte automatiquement l'environnement :

- **Web** : Utilise `/api` (proxy Vite vers localhost:3000)
- **Mobile** : Utilise `http://192.168.1.100:3000/api`

**⚠️ IMPORTANT :** Remplacez `192.168.1.100` par votre IP locale réelle !

Pour trouver votre IP :
```bash
ipconfig
# Cherchez "Adresse IPv4" dans la section WiFi/Ethernet
```

### **Backend - Autoriser les connexions externes**

Modifiez `backend/src/index.ts` si nécessaire :
```typescript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
```

---

## 🎨 Personnalisation

### **Icône de l'app**

Placez vos icônes dans :
- `android/app/src/main/res/` (plusieurs tailles)
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Ou utilisez un générateur : https://icon.kitchen/

### **Splash Screen**

Configurez dans `capacitor.config.ts` :
```typescript
SplashScreen: {
  launchShowDuration: 2000,
  backgroundColor: '#4F46E5', // Votre couleur
}
```

### **Nom de l'app**

- **Android** : `android/app/src/main/res/values/strings.xml`
- **iOS** : `ios/App/App/Info.plist`

---

## 📦 Publication

### **Google Play Store**

1. Générer un keystore signé
2. Build en mode release dans Android Studio
3. Créer un compte Google Play Developer (25€)
4. Uploader l'APK/AAB

### **Apple App Store**

1. Créer un compte Apple Developer (99$/an)
2. Archive l'app dans Xcode
3. Distribuer via App Store Connect

---

## 🐛 Debug

### Voir les logs en temps réel :

**Android :**
```bash
npx cap run android -l --external
```

**iOS :**
```bash
npx cap run ios -l --external
```

### Chrome DevTools pour Android :
1. Connecter le téléphone en USB
2. Ouvrir : `chrome://inspect`
3. Inspecter l'app

---

## ✨ Fonctionnalités Natives Disponibles

Capacitor détecte automatiquement l'environnement et active :
- 📱 Barre de statut personnalisée
- 🎨 Splash screen
- 🔙 Bouton retour Android géré
- 📲 Notifications (avec plugin supplémentaire)
- 📷 Caméra (avec plugin supplémentaire)
- 📍 Géolocalisation (avec plugin supplémentaire)

---

## 📚 Ressources

- Documentation Capacitor : https://capacitorjs.com/docs
- Plugins disponibles : https://capacitorjs.com/docs/plugins
- Forum communauté : https://forum.ionicframework.com/

---

**🎉 Votre app Opina est maintenant prête pour mobile !**
