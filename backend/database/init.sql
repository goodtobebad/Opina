-- Script d'initialisation de la base de données pour Render

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    numero_telephone VARCHAR(20),
    mot_de_passe VARCHAR(255),
    est_admin BOOLEAN DEFAULT FALSE,
    est_super_admin BOOLEAN DEFAULT FALSE,
    methode_auth VARCHAR(50) DEFAULT 'local',
    oauth_id VARCHAR(255),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    couleur VARCHAR(7) DEFAULT '#6B7280',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des sondages
CREATE TABLE IF NOT EXISTS sondages (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(500) NOT NULL,
    description TEXT,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    id_categorie INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    id_createur INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT dates_valides CHECK (date_fin > date_debut)
);

-- Table des options de sondage
CREATE TABLE IF NOT EXISTS options_sondage (
    id SERIAL PRIMARY KEY,
    id_sondage INTEGER REFERENCES sondages(id) ON DELETE CASCADE,
    texte VARCHAR(500) NOT NULL,
    ordre INTEGER NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des votes
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    id_sondage INTEGER REFERENCES sondages(id) ON DELETE CASCADE,
    id_utilisateur INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    id_option INTEGER REFERENCES options_sondage(id) ON DELETE CASCADE,
    est_valide BOOLEAN DEFAULT FALSE,
    date_vote TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_sondage, id_utilisateur)
);

-- Table des tokens de validation
CREATE TABLE IF NOT EXISTS tokens_validation (
    id SERIAL PRIMARY KEY,
    id_vote INTEGER REFERENCES votes(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL,
    expire_le TIMESTAMP NOT NULL,
    utilise BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sondages_dates ON sondages(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_sondages_categorie ON sondages(id_categorie);
CREATE INDEX IF NOT EXISTS idx_votes_sondage ON votes(id_sondage);
CREATE INDEX IF NOT EXISTS idx_votes_utilisateur ON votes(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_options_sondage ON options_sondage(id_sondage);
CREATE INDEX IF NOT EXISTS idx_tokens_vote ON tokens_validation(id_vote);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email);

-- Insérer les catégories par défaut
INSERT INTO categories (nom, couleur) VALUES
    ('Politique', '#EF4444'),
    ('Sport', '#10B981'),
    ('Culture', '#8B5CF6'),
    ('Technologie', '#3B82F6'),
    ('Sante', '#EC4899'),
    ('Education', '#F59E0B'),
    ('Environnement', '#14B8A6'),
    ('Economie', '#6366F1'),
    ('Societe', '#F97316'),
    ('Autre', '#6B7280')
ON CONFLICT (nom) DO NOTHING;

-- Créer un super admin par défaut
-- Mot de passe: admin123 (hash bcrypt)
INSERT INTO utilisateurs (nom, email, mot_de_passe, est_admin, est_super_admin, methode_auth)
VALUES (
    'Super Admin',
    'admin@opina.com',
    '$2b$10$YourHashedPasswordHere', -- Vous devrez changer ceci
    TRUE,
    TRUE,
    'local'
)
ON CONFLICT (email) DO NOTHING;
