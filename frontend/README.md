# Frontend Sondy

Application React pour la plateforme de sondages Sondy.

## Technologies

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Hook Form
- Axios
- React Hot Toast
- date-fns

## Installation

```bash
npm install
```

## Démarrage

### Mode développement
```bash
npm run dev
```

L'application sera disponible sur http://localhost:5173

### Build de production
```bash
npm run build
npm run preview
```

## Structure du projet

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.tsx            # Layout principal avec navigation
│   ├── context/
│   │   └── AuthContext.tsx       # Contexte d'authentification
│   ├── lib/
│   │   └── api.ts                # Client Axios configuré
│   ├── pages/
│   │   ├── Accueil.tsx           # Page d'accueil
│   │   ├── Connexion.tsx         # Page de connexion
│   │   ├── Inscription.tsx       # Page d'inscription
│   │   ├── Sondages.tsx          # Liste des sondages
│   │   ├── DetailSondage.tsx     # Détails et vote
│   │   ├── Historique.tsx        # Historique des votes
│   │   └── CreerSondage.tsx      # Création de sondage (admin)
│   ├── App.tsx                   # Composant racine avec routes
│   ├── main.tsx                  # Point d'entrée
│   └── index.css                 # Styles globaux avec Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Pages

### Page d'accueil (`/`)
- Présentation de l'application
- Fonctionnalités principales
- Guide d'utilisation

### Sondages (`/sondages`)
- Liste de tous les sondages actuellement ouverts
- Accès public (pas d'authentification requise pour voir)

### Détail d'un sondage (`/sondages/:id`)
- Détails complets du sondage
- Formulaire de vote
- Validation par email ou SMS

### Historique (`/historique`)
- Liste des votes de l'utilisateur connecté
- Protégé (authentification requise)

### Créer un sondage (`/admin/creer-sondage`)
- Formulaire de création de sondage
- Protégé (droits admin requis)

### Connexion (`/connexion`)
- Formulaire de connexion

### Inscription (`/inscription`)
- Formulaire d'inscription

## Fonctionnalités

### Authentification
- Inscription et connexion locale
- Gestion du token JWT
- Routes protégées
- Contexte d'authentification global

### Sondages
- Consultation des sondages ouverts
- Vote avec validation par email/SMS
- Historique des participations
- Création et gestion (admin)

### UX/UI
- Interface entièrement en français
- Design responsive avec TailwindCSS
- Notifications toast
- Validation des formulaires
- États de chargement

## Configuration

L'API backend doit être accessible sur `http://localhost:3000` (configuré dans `vite.config.ts` avec proxy).

## Scripts

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualiser le build
- `npm run lint` - Linter le code
