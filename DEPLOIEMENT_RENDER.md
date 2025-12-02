# 🚀 Déployer Opina Backend sur Render

## 📋 Vue d'ensemble

Ce guide vous accompagne pour déployer le backend et PostgreSQL sur Render (gratuit pour commencer).

**Résultat :** Votre API sera accessible via une URL publique HTTPS que vous utiliserez dans l'app mobile.

---

## 🎯 Étape 1 : Créer un compte Render

1. Aller sur : https://render.com
2. Cliquer sur **Sign Up**
3. S'inscrire avec GitHub (recommandé) ou email
4. Vérifier votre email si nécessaire

---

## 🐘 Étape 2 : Créer la base de données PostgreSQL

### 2.1 Créer la base de données

1. Dans le dashboard Render, cliquer sur **New +** → **PostgreSQL**
2. Configurer :
   - **Name :** `opina-db`
   - **Database :** `opina`
   - **User :** `opina_user` (ou laisser par défaut)
   - **Region :** Choisir le plus proche de vous
   - **PostgreSQL Version :** 16 (ou la plus récente)
   - **Plan :** **Free** (limites: 90 jours, 256MB RAM, 1GB stockage)

3. Cliquer sur **Create Database**
4. Attendre ~2-3 minutes pour la création

### 2.2 Récupérer les informations de connexion

Une fois créée, noter les informations affichées :
- **Internal Database URL** (commence par `postgres://...`)
- **External Database URL** (commence par `postgres://...`)
- **PSQL Command** (pour se connecter manuellement)

### 2.3 Initialiser la base de données

#### Option A : Via Dashboard Render (Plus simple)

1. Dans la page de votre base de données, aller dans l'onglet **Shell**
2. Copier-coller le contenu du fichier `backend/database/schema.sql`
3. Copier-coller le contenu du fichier `backend/database/add-categories.sql`
4. Exécuter

#### Option B : Via psql local

```powershell
# Installer PostgreSQL client si nécessaire
# Puis utiliser la commande PSQL fournie par Render
psql -h <host> -U <user> -d <database> -f backend/database/schema.sql
psql -h <host> -U <user> -d <database> -f backend/database/add-categories.sql
```

### 2.4 Créer le super admin

Se connecter à la base et exécuter :

```sql
-- Générer le hash du mot de passe admin123
-- Via Node.js ou en ligne : https://bcrypt-generator.com/
-- Hash pour "admin123": $2b$10$rGvH8VQZhZGvH8VQZhZGvuY2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y2Y

INSERT INTO utilisateurs (nom, email, mot_de_passe, est_admin, est_super_admin, methode_auth)
VALUES (
    'Super Admin',
    'admin@opina.com',
    '$2b$10$N9qo8uLOickgx2ZZpqF/K.e2IkFmZO3IrV6rOv2S7GbCKLvDXmBK2',
    TRUE,
    TRUE,
    'local'
);
```

---

## 🌐 Étape 3 : Déployer le backend

### 3.1 Préparer votre code

**Option A : Push vers GitHub (Recommandé)**

```powershell
cd C:\Users\Amar\Documents\Opina

# Initialiser git si pas déjà fait
git init
git add .
git commit -m "Prepare for Render deployment"

# Créer un repo sur GitHub et pusher
git remote add origin https://github.com/VOTRE_USERNAME/opina.git
git branch -M main
git push -u origin main
```

**Option B : Fork le repo existant**

Si le repo existe déjà, forkez-le ou demandez l'accès.

### 3.2 Créer le Web Service sur Render

1. Dans Render Dashboard, cliquer **New +** → **Web Service**
2. Connecter votre repository GitHub
3. Configurer :

   **General:**
   - **Name :** `opina-backend`
   - **Region :** Même que la base de données
   - **Branch :** `main`
   - **Root Directory :** `backend`
   - **Runtime :** `Node`
   - **Build Command :** `npm install && npm run build`
   - **Start Command :** `npm start`

   **Plan:**
   - **Instance Type :** **Free** (750h/mois gratuit, redémarre après inactivité)

4. Cliquer **Create Web Service**

### 3.3 Configurer les variables d'environnement

Dans l'onglet **Environment** de votre web service, ajouter :

```env
# Base de données (copier depuis votre PostgreSQL Render)
DATABASE_URL=<votre_internal_database_url_render>

# Ou décomposé :
DB_HOST=<host_render>
DB_PORT=5432
DB_NAME=opina
DB_USER=<user_render>
DB_PASSWORD=<password_render>

# Configuration serveur
PORT=3000
NODE_ENV=production

# JWT Secret (générer une clé aléatoire forte)
JWT_SECRET=votre_super_secret_jwt_production_key_change_me_123456789

# Brevo Email (si vous avez une clé API)
BREVO_API_KEY=votre_cle_brevo
BREVO_SENDER_EMAIL=noreply@votredomaine.com
BREVO_SENDER_NAME=Opina

# Twilio SMS (optionnel)
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL (optionnel, pour CORS)
FRONTEND_URL=https://votre-frontend.com

# OAuth (si utilisé)
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
APPLE_CLIENT_ID=votre_apple_client_id
```

**🔒 Important :** Utilisez des secrets forts pour JWT_SECRET en production !

### 3.4 Déployer

1. Cliquer sur **Save Changes**
2. Render va automatiquement :
   - Installer les dépendances
   - Compiler TypeScript
   - Démarrer le serveur
3. Attendre 2-5 minutes

### 3.5 Vérifier le déploiement

1. Une fois déployé, Render affiche l'URL : `https://opina-backend.onrender.com`
2. Tester dans le navigateur : `https://opina-backend.onrender.com/api/health`
3. Devrait retourner : `{"status":"OK","message":"API Opina fonctionnelle"}`

---

## 📱 Étape 4 : Mettre à jour l'app mobile

### 4.1 Modifier l'API client

Éditer `frontend/src/lib/api.ts` :

```typescript
const getBaseURL = () => {
  if (isNativePlatform) {
    // URL de production Render
    return 'https://opina-backend.onrender.com/api';
  }
  // Sur web, utiliser le proxy Vite en dev
  return '/api';
};
```

### 4.2 Rebuild et resync

```powershell
cd C:\Users\Amar\Documents\Opina\frontend

# Build
npm run build

# Sync
npx cap sync

# Générer nouvel APK
cd android
.\gradlew assembleDebug
```

### 4.3 Tester

1. Installer le nouvel APK sur votre téléphone
2. L'app devrait maintenant communiquer avec Render
3. Plus besoin d'exposer votre IP locale ! 🎉

---

## 🔧 Configuration Avancée

### Auto-Deploy sur GitHub Push

Render détecte automatiquement les push sur `main` et redéploie.

Pour désactiver :
- Settings → Auto-Deploy → **Désactiver**

### Ajouter un domaine personnalisé

1. Acheter un domaine (ex: opina.com)
2. Dans Render : Settings → Custom Domain
3. Ajouter le domaine et configurer les DNS

### Monitoring et Logs

- **Logs :** Onglet "Logs" dans Render
- **Metrics :** Onglet "Metrics" pour CPU/RAM
- **Alertes :** Configurer dans Settings

### SSL/HTTPS

✅ Render fournit automatiquement un certificat SSL gratuit via Let's Encrypt.

---

## 💰 Limites du Plan Gratuit

### PostgreSQL Free
- ✅ 90 jours gratuit
- ✅ 256 MB RAM
- ✅ 1 GB stockage
- ✅ 2 connexions simultanées max
- ⚠️ Après 90 jours : $7/mois pour continuer

### Web Service Free
- ✅ 750 heures/mois
- ✅ 512 MB RAM
- ✅ Partage de CPU
- ⚠️ Se met en veille après 15 min d'inactivité
- ⚠️ Redémarrage ~30-60 secondes

**Alternative gratuite permanente :** Railway, Fly.io, ou hébergement VPS.

---

## 🐛 Troubleshooting

### ❌ "Build failed"
→ Vérifier les logs de build dans Render
→ Tester `npm run build` localement

### ❌ "Application failed to respond"
→ Vérifier que PORT=3000 dans les env vars
→ Vérifier les logs : erreurs de connexion DB ?

### ❌ "Database connection failed"
→ Vérifier DATABASE_URL correcte
→ Utiliser **Internal Database URL** (pas External)

### ❌ "App crashes immediately"
→ Vérifier que toutes les variables d'env sont définies
→ Vérifier les logs d'erreur

### ❌ "Mobile app can't connect"
→ Vérifier l'URL dans `api.ts`
→ Tester l'URL dans un navigateur
→ Vérifier CORS dans `backend/src/index.ts`

### ⚡ "App trop lente"
→ Le plan gratuit se met en veille après 15min
→ Première requête peut prendre 30-60s (cold start)
→ Upgrade vers un plan payant ($7/mois) pour éviter

---

## 📊 Next Steps

### Pour Production Sérieuse

1. **Upgrade PostgreSQL** ($7/mois) :
   - Pas de limite de 90 jours
   - Plus de RAM et stockage
   - Backups automatiques

2. **Upgrade Web Service** ($7/mois) :
   - Pas de mise en veille
   - Plus de ressources
   - Temps de réponse constant

3. **Monitoring** :
   - Intégrer Sentry pour tracking d'erreurs
   - Ajouter des logs structurés
   - Configurer des alertes

4. **CI/CD** :
   - GitHub Actions pour tests automatisés
   - Deploy preview pour chaque PR

5. **CDN** :
   - Héberger le frontend sur Vercel/Netlify
   - Accélérer le chargement global

---

## 🎉 Félicitations !

Votre backend Opina est maintenant :
- ✅ Hébergé sur Render avec HTTPS
- ✅ Base de données PostgreSQL cloud
- ✅ Accessible depuis n'importe où
- ✅ Pas besoin d'exposer votre IP locale
- ✅ Prêt pour distribuer l'app mobile

**URL API :** `https://opina-backend.onrender.com/api`

---

## 📚 Ressources

- Documentation Render : https://render.com/docs
- PostgreSQL Render : https://render.com/docs/databases
- Support Render : https://community.render.com/
- Status page : https://status.render.com/
