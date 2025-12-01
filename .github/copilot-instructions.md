# Instructions Copilot pour Sondy

## Vue d'ensemble du projet
Sondy est une application web full-stack en français permettant de créer et participer à des sondages.

## Technologies utilisées
- **Frontend**: React, TypeScript, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Authentification**: OAuth2, Apple Sign-In
- **Validation**: SMS/Email pour les votes

## Structure du projet
- `/backend` - API Node.js/Express
- `/frontend` - Application React

## Conventions de code
- Toute l'interface utilisateur doit être en français
- Utiliser TypeScript strict
- Suivre les conventions de nommage françaises pour les variables UI
- API REST avec réponses JSON en français

## Checklist de configuration

- [x] Créer le fichier copilot-instructions.md
- [x] Scaffolder le projet backend
- [x] Scaffolder le projet frontend
- [x] Implémenter les endpoints API
- [x] Implémenter les pages frontend
- [x] Configurer le schéma de base de données
- [ ] Installer les dépendances et tester

## État du projet

✅ **Structure complète créée !**

Le projet Sondy est maintenant entièrement scaffoldé avec:
- Backend Node.js/Express/TypeScript avec tous les endpoints
- Frontend React/TypeScript/Vite avec toutes les pages
- Schéma de base de données PostgreSQL
- Configuration complète (package.json, tsconfig, etc.)

## Prochaines étapes

1. **Installer Node.js** si ce n'est pas déjà fait: https://nodejs.org/
2. **Installer PostgreSQL**: https://www.postgresql.org/download/
3. **Installer les dépendances**:
   ```bash
   cd backend
   npm install
   
   cd ../frontend
   npm install
   ```
4. **Configurer la base de données**:
   ```bash
   createdb sondy
   psql -d sondy -f backend/database/schema.sql
   ```
5. **Configurer l'environnement**:
   ```bash
   cd backend
   cp .env.example .env
   # Éditer .env avec vos configurations
   ```
6. **Démarrer l'application**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Documentation

- Voir `/README.md` pour la documentation générale
- Voir `/backend/README.md` pour la documentation backend
- Voir `/frontend/README.md` pour la documentation frontend
