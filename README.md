# Opina

Application web full-stack pour créer et participer à des sondages en français.

## Vue d'ensemble

Opina est une plateforme de sondages permettant:
- Aux **administrateurs** de créer des sondages avec options multiples et dates d'ouverture/clôture
- Aux **utilisateurs** de consulter et voter sur les sondages disponibles
- La **validation** des votes par email ou SMS pour garantir l'authenticité
- La **visualisation des statistiques** après la clôture des sondages

## Architecture

### Backend
- Node.js + Express + TypeScript
- PostgreSQL
- JWT pour l'authentification
- Nodemailer (email) et Twilio (SMS)

### Frontend
- React + TypeScript + Vite
- TailwindCSS
- React Router
- Axios

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <repository-url>
cd Opina
```

### 2. Configuration Backend

```bash
cd backend
npm install

# Créer la base de données
createdb opina
psql -d opina -f database/schema.sql

# Configuration
cp .env.example .env
# Éditer .env avec vos configurations
```

### 3. Configuration Frontend

```bash
cd frontend
npm install
```

### 4. Démarrage

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

L'application sera disponible sur:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Structure du projet

```
Opina/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── config/       # Configuration DB
│   │   ├── controllers/  # Logique métier
│   │   ├── middleware/   # Auth, validation
│   │   ├── routes/       # Routes API
│   │   ├── services/     # Services (email, SMS)
│   │   └── index.ts      # Point d'entrée
│   ├── database/
│   │   └── schema.sql    # Schéma PostgreSQL
│   └── package.json
│
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── context/      # Contexte React (Auth)
│   │   ├── lib/          # Utilitaires (API client)
│   │   ├── pages/        # Pages de l'application
│   │   ├── App.tsx       # Routes
│   │   └── main.tsx      # Point d'entrée
│   └── package.json
│
└── README.md            # Ce fichier
```

## Fonctionnalités principales

### Pour tous les utilisateurs
- ✅ Inscription et connexion
- ✅ Consultation des sondages ouverts
- ✅ Vote sur les sondages
- ✅ Validation des votes par email ou SMS
- ✅ Historique personnel des votes
- ✅ Consultation des statistiques (sondages terminés)

### Pour les administrateurs
- ✅ Création de sondages
- ✅ Configuration des dates d'ouverture/clôture
- ✅ Ajout d'options multiples
- ✅ Gestion des sondages

## API Endpoints

### Authentification
- `POST /api/auth/inscription` - Inscription
- `POST /api/auth/connexion` - Connexion
- `GET /api/auth/verifier` - Vérifier le token

### Sondages
- `GET /api/sondages/ouverts` - Liste des sondages ouverts
- `GET /api/sondages/:id` - Détails d'un sondage
- `POST /api/sondages` - Créer un sondage (admin)
- `PUT /api/sondages/:id` - Modifier un sondage (admin)
- `DELETE /api/sondages/:id` - Supprimer un sondage (admin)

### Votes
- `POST /api/votes` - Voter
- `POST /api/votes/valider` - Valider un vote
- `GET /api/votes/historique` - Historique des votes

### Statistiques
- `GET /api/statistiques/:id_sondage` - Statistiques d'un sondage

## Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Validation des entrées
- Protection CORS
- Validation des votes par email/SMS
- Routes protégées (authentification + rôles)

## Base de données

Schéma PostgreSQL avec:
- `utilisateurs` - Comptes utilisateurs
- `sondages` - Sondages créés
- `options_sondage` - Options de chaque sondage
- `votes` - Votes des utilisateurs
- `tokens_validation` - Codes de validation temporaires

## Configuration requise

### Variables d'environnement Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=opina
DB_USER=postgres
DB_PASSWORD=...

PORT=3000
JWT_SECRET=...

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASSWORD=...

TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

## Technologies

### Backend
- Node.js / Express
- TypeScript
- PostgreSQL
- JWT
- bcrypt
- Nodemailer
- Twilio

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios
- React Hook Form
- React Hot Toast
- date-fns

## Développement

### Backend
```bash
cd backend
npm run dev     # Mode développement avec nodemon
npm run build   # Build TypeScript
npm start       # Démarrer en production
```

### Frontend
```bash
cd frontend
npm run dev     # Serveur de développement Vite
npm run build   # Build de production
npm run preview # Prévisualiser le build
```

## Licence

MIT

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository.
