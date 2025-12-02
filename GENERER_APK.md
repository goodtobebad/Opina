# 📦 Générer un APK pour Android

## 🎯 Méthode Rapide (Sans Android Studio)

### 1️⃣ **Installer Java JDK 17 ou 21**

**Option A : Téléchargement direct**
- Télécharger : https://adoptium.net/temurin/releases/
- Choisir : Windows, x64, JDK 17 (LTS)
- Installer et noter le chemin (ex: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x`)

**Option B : Via Chocolatey** (si installé)
```powershell
choco install temurin17
```

**Option C : Via Winget**
```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```

### 2️⃣ **Configurer JAVA_HOME**

**PowerShell (session actuelle) :**
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

**Permanent (Variables d'environnement Windows) :**
1. Touche Windows → "variables d'environnement"
2. Variables système → Nouveau
   - Nom : `JAVA_HOME`
   - Valeur : `C:\Program Files\Eclipse Adoptium\jdk-17.0.x`
3. Modifier la variable `Path` → Ajouter : `%JAVA_HOME%\bin`

### 3️⃣ **Vérifier l'installation**
```powershell
java -version
# Devrait afficher : openjdk version "17.x.x"
```

### 4️⃣ **Générer l'APK**

```powershell
cd C:\Users\Amar\Documents\Opina\frontend

# Build le frontend
npm run build

# Sync avec Android
npx cap sync

# Générer l'APK
cd android
.\gradlew assembleDebug
```

### 5️⃣ **Récupérer l'APK**

L'APK sera dans :
```
C:\Users\Amar\Documents\Opina\frontend\android\app\build\outputs\apk\debug\app-debug.apk
```

**Taille attendue :** ~50-70 MB

---

## 🚀 Méthode avec Android Studio (Plus Simple)

### 1️⃣ **Installer Android Studio**
- Télécharger : https://developer.android.com/studio
- L'installation inclut Java automatiquement

### 2️⃣ **Ouvrir le projet**
```powershell
cd C:\Users\Amar\Documents\Opina\frontend
npx cap open android
```

### 3️⃣ **Générer l'APK**
Dans Android Studio :
1. Menu : **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Attendre la compilation (1-5 minutes)
3. Cliquer sur **locate** dans la notification
4. L'APK est dans : `app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Installer l'APK sur un téléphone

### **Option 1 : Via câble USB**
1. Activer le **Mode Développeur** sur le téléphone :
   - Paramètres → À propos du téléphone
   - Appuyer 7 fois sur "Numéro de build"
2. Activer **Débogage USB** :
   - Paramètres → Options développeur → Débogage USB
3. Connecter le téléphone en USB
4. Copier `app-debug.apk` sur le téléphone
5. Ouvrir le fichier et installer (autoriser "Sources inconnues")

### **Option 2 : Via cloud (Google Drive, Dropbox, etc.)**
1. Uploader `app-debug.apk` sur Google Drive
2. Sur le téléphone, télécharger le fichier
3. Installer (autoriser "Sources inconnues" si demandé)

### **Option 3 : Via ADB (plus rapide)**
```powershell
# Installer l'APK directement
adb install app-debug.apk

# Ou si plusieurs appareils connectés
adb devices
adb -s DEVICE_ID install app-debug.apk
```

---

## ⚙️ Configuration pour les tests

### **Important : URL Backend**

L'app mobile utilise l'URL définie dans `frontend/src/lib/api.ts`.

**Pour tester sur un autre téléphone :**

1. Trouvez votre IP locale :
```powershell
ipconfig
# Cherchez "Adresse IPv4" (ex: 192.168.1.100)
```

2. Modifiez `frontend/src/lib/api.ts` :
```typescript
const getBaseURL = () => {
  if (isNativePlatform) {
    return 'http://192.168.1.100:3000/api'; // VOTRE IP ICI
  }
  return '/api';
};
```

3. Assurez-vous que le backend accepte les connexions externes :
   - Vérifier que le backend écoute sur `0.0.0.0` et non `localhost`
   - Les deux appareils doivent être sur le même réseau WiFi

4. Rebuild et régénérer l'APK :
```powershell
npm run build
npx cap sync
cd android
.\gradlew assembleDebug
```

---

## 🔐 APK de Production (pour publication)

Pour générer un APK signé pour le Play Store :

### 1️⃣ **Créer un keystore**
```powershell
cd C:\Users\Amar\Documents\Opina\frontend\android\app

keytool -genkey -v -keystore opina-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias opina
```

### 2️⃣ **Configurer le keystore**

Créer `android/key.properties` :
```properties
storePassword=VOTRE_MOT_DE_PASSE
keyPassword=VOTRE_MOT_DE_PASSE
keyAlias=opina
storeFile=opina-release-key.jks
```

### 3️⃣ **Modifier `android/app/build.gradle`**

Ajouter avant `android {` :
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dans `android { ... }`, ajouter :
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 4️⃣ **Générer l'APK de release**
```powershell
.\gradlew assembleRelease
```

L'APK signé sera dans :
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🐛 Problèmes Courants

### ❌ "JAVA_HOME is not set"
→ Installer JDK 17 et configurer JAVA_HOME

### ❌ "SDK location not found"
→ Créer `android/local.properties` :
```properties
sdk.dir=C:\\Users\\VOTRE_NOM\\AppData\\Local\\Android\\Sdk
```

### ❌ "Gradle build failed"
→ Nettoyer et rebuild :
```powershell
.\gradlew clean
.\gradlew assembleDebug
```

### ❌ "App crashes on launch"
→ Vérifier les logs :
```powershell
adb logcat
```

### ❌ "Cannot connect to API"
→ Vérifier :
- IP correcte dans `api.ts`
- Backend running sur `0.0.0.0:3000`
- Même réseau WiFi
- Firewall Windows autorise le port 3000

---

## 📊 Tailles d'APK

- **Debug APK** : ~50-70 MB (non optimisé)
- **Release APK** : ~20-30 MB (optimisé et minifié)
- **AAB (Android App Bundle)** : ~15-20 MB (pour Play Store)

---

## ✅ Checklist avant distribution

- [ ] URL API configurée correctement
- [ ] Backend accessible depuis le réseau
- [ ] Icône et splash screen personnalisés
- [ ] Nom de l'app configuré
- [ ] Version incrémentée dans `build.gradle`
- [ ] APK testé sur plusieurs appareils
- [ ] Permissions nécessaires déclarées

---

**🎉 Votre APK est prêt à être partagé !**
