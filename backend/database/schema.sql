-- Schema de base de données pour Opina

-- Table des utilisateurs
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    numero_telephone VARCHAR(20),
    mot_de_passe VARCHAR(255),
    est_admin BOOLEAN DEFAULT FALSE,
    methode_auth VARCHAR(50) DEFAULT 'local', -- 'local', 'google', 'apple'
    oauth_id VARCHAR(255),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des sondages
CREATE TABLE sondages (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(500) NOT NULL,
    description TEXT,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    id_createur INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT dates_valides CHECK (date_fin > date_debut)
);

-- Table des options de sondage
CREATE TABLE options_sondage (
    id SERIAL PRIMARY KEY,
    id_sondage INTEGER REFERENCES sondages(id) ON DELETE CASCADE,
    texte VARCHAR(500) NOT NULL,
    ordre INTEGER NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des votes
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    id_sondage INTEGER REFERENCES sondages(id) ON DELETE CASCADE,
    id_utilisateur INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    id_option INTEGER REFERENCES options_sondage(id) ON DELETE CASCADE,
    est_valide BOOLEAN DEFAULT FALSE,
    date_vote TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_sondage, id_utilisateur)
);

-- Table des tokens de validation
CREATE TABLE tokens_validation (
    id SERIAL PRIMARY KEY,
    id_vote INTEGER REFERENCES votes(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'email' ou 'sms'
    expire_le TIMESTAMP NOT NULL,
    utilise BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_sondages_dates ON sondages(date_debut, date_fin);
CREATE INDEX idx_votes_sondage ON votes(id_sondage);
CREATE INDEX idx_votes_utilisateur ON votes(id_utilisateur);
CREATE INDEX idx_options_sondage ON options_sondage(id_sondage);
CREATE INDEX idx_tokens_vote ON tokens_validation(id_vote);
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
