# Backend Sondy

API REST pour l'application Sondy - plateforme de sondages en français.

## Technologies

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT pour l'authentification
- Nodemailer pour les emails
- Twilio pour les SMS

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer la base de données PostgreSQL :
```bash
# Créer la base de données
createdb sondy

# Exécuter le schéma
psql -d sondy -f database/schema.sql
```

3. Configuration de l'environnement :
```bash
# Copier le fichier .env.example vers .env
cp .env.example .env

# Éditer .env avec vos configurations
```

## Configuration requise

Créer un fichier `.env` à la racine du projet backend avec les variables suivantes :

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Configuration PostgreSQL
- `PORT` - Port du serveur (par défaut 3000)
- `JWT_SECRET` - Clé secrète pour JWT
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` - Configuration email
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - Configuration SMS
- `FRONTEND_URL` - URL du frontend (pour CORS)

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm run build
npm start
```

## Endpoints API

### Authentification (`/api/auth`)
- `POST /inscription` - Inscription locale
- `POST /connexion` - Connexion locale
- `POST /google` - Authentification Google OAuth2
- `POST /apple` - Authentification Apple
- `GET /verifier` - Vérifier le token JWT

### Sondages (`/api/sondages`)
- `GET /ouverts` - Liste des sondages ouverts (public)
- `GET /` - Tous les sondages (admin)
- `GET /:id` - Détails d'un sondage
- `POST /` - Créer un sondage (admin)
- `PUT /:id` - Modifier un sondage (admin)
- `DELETE /:id` - Supprimer un sondage (admin)

### Votes (`/api/votes`)
- `POST /` - Voter pour un sondage
- `POST /valider` - Valider un vote avec le code
- `GET /historique` - Historique des votes de l'utilisateur

### Statistiques (`/api/statistiques`)
- `GET /:id_sondage` - Statistiques d'un sondage (disponible après clôture)

## Structure du projet

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuration PostgreSQL
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── sondages.controller.ts
│   │   ├── votes.controller.ts
│   │   └── statistiques.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts   # Authentification JWT
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── sondages.routes.ts
│   │   ├── votes.routes.ts
│   │   └── statistiques.routes.ts
│   ├── services/
│   │   └── notification.service.ts
│   └── index.ts                 # Point d'entrée
├── database/
│   └── schema.sql               # Schéma de base de données
├── package.json
├── tsconfig.json
└── .env.example
```

## Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Validation des entrées avec express-validator
- Validation des votes par email ou SMS
- CORS configuré

## Base de données

Le schéma comprend les tables suivantes :
- `utilisateurs` - Informations des utilisateurs
- `sondages` - Sondages créés
- `options_sondage` - Options de chaque sondage
- `votes` - Votes des utilisateurs
- `tokens_validation` - Codes de validation pour les votes
