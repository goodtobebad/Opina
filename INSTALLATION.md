# Guide de configuration de Sondy

Ce guide vous aidera à installer et configurer l'application Sondy depuis zéro.

## Prérequis

### 1. Installer Node.js
- Téléchargez et installez Node.js (version 18 ou supérieure) depuis https://nodejs.org/
- Vérifiez l'installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Installer PostgreSQL
- **Windows**: Téléchargez depuis https://www.postgresql.org/download/windows/
- **Mac**: Utilisez Homebrew: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian)

- Vérifiez l'installation:
  ```bash
  psql --version
  ```

## Installation de l'application

### 1. Installer les dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Configuration de la base de données

#### Créer la base de données
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données (dans psql)
CREATE DATABASE sondy;

# Quitter psql
\q
```

#### Initialiser le schéma
```bash
# Depuis la racine du projet
psql -U postgres -d sondy -f backend/database/schema.sql
```

### 3. Configuration de l'environnement

#### Backend - Fichier .env
```bash
cd backend
cp .env.example .env
```

Éditez le fichier `backend/.env` avec vos configurations:

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sondy
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres

# Serveur
PORT=3000
NODE_ENV=development

# JWT Secret (générez une chaîne aléatoire sécurisée)
JWT_SECRET=votre_secret_tres_securise_changez_moi

# Configuration Email (exemple avec Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application_gmail

# Configuration SMS (Twilio - optionnel)
TWILIO_ACCOUNT_SID=votre_twilio_sid
TWILIO_AUTH_TOKEN=votre_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Configuration email Gmail
Pour utiliser Gmail:
1. Activez la vérification en 2 étapes sur votre compte Google
2. Générez un "Mot de passe d'application": https://myaccount.google.com/apppasswords
3. Utilisez ce mot de passe dans `EMAIL_PASSWORD`

#### Configuration SMS (Twilio - optionnel)
1. Créez un compte sur https://www.twilio.com/
2. Récupérez votre Account SID et Auth Token
3. Achetez ou configurez un numéro de téléphone
4. Ajoutez les informations dans le fichier .env

## Démarrage de l'application

### Mode développement

Ouvrez **deux terminaux** :

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Le backend démarre sur http://localhost:3000

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Le frontend démarre sur http://localhost:5173

### Accéder à l'application

Ouvrez votre navigateur et allez sur: **http://localhost:5173**

## Créer un compte administrateur

Par défaut, les nouveaux comptes ne sont pas administrateurs. Pour créer un administrateur:

### Option 1: Directement dans la base de données
```bash
psql -U postgres -d sondy

UPDATE utilisateurs SET est_admin = true WHERE email = 'votre_email@example.com';
```

### Option 2: Modifier le code d'inscription
Dans `backend/src/controllers/auth.controller.ts`, vous pouvez temporairement modifier la fonction `inscription` pour créer un admin.

## Vérification de l'installation

### 1. Tester le backend
Ouvrez http://localhost:3000/api/health dans votre navigateur.
Vous devriez voir: `{"status":"OK","message":"API Sondy fonctionnelle"}`

### 2. Tester le frontend
Allez sur http://localhost:5173
Vous devriez voir la page d'accueil de Sondy.

### 3. Tester l'inscription
1. Cliquez sur "Inscription"
2. Remplissez le formulaire
3. Créez votre compte
4. Vous devriez être redirigé vers la page des sondages

## Dépannage

### Erreur: "Cannot find module"
```bash
# Réinstallez les dépendances
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Erreur de connexion à PostgreSQL
- Vérifiez que PostgreSQL est démarré
- Vérifiez les informations de connexion dans `.env`
- Vérifiez que la base de données `sondy` existe

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend tourne sur le port 3000
- Vérifiez la configuration du proxy dans `frontend/vite.config.ts`
- Vérifiez les CORS dans `backend/src/index.ts`

### Erreur d'envoi d'email
- Vérifiez vos identifiants Gmail
- Assurez-vous d'utiliser un "mot de passe d'application"
- Vérifiez que la vérification en 2 étapes est activée

## Mode production

### Build
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Démarrage production
```bash
# Backend
cd backend
npm start

# Frontend (servir les fichiers statiques)
cd frontend
npm run preview
```

## Ressources

- Documentation React: https://react.dev/
- Documentation Express: https://expressjs.com/
- Documentation PostgreSQL: https://www.postgresql.org/docs/
- Documentation Vite: https://vitejs.dev/
- Documentation TailwindCSS: https://tailwindcss.com/

## Support

Pour toute question:
1. Consultez les fichiers README dans `/backend` et `/frontend`
2. Vérifiez les logs du terminal backend et frontend
3. Consultez la documentation des technologies utilisées
