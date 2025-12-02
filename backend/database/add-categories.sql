-- Ajouter la table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  couleur VARCHAR(7) DEFAULT '#3B82F6', -- Code couleur hexadécimal
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter quelques catégories par défaut
INSERT INTO categories (nom, description, couleur) VALUES
  ('Politique', 'Sondages sur des sujets politiques', '#EF4444'),
  ('Sport', 'Sondages liés au sport', '#10B981'),
  ('Culture', 'Sondages sur la culture, l''art et le divertissement', '#8B5CF6'),
  ('Technologie', 'Sondages sur la technologie et l''innovation', '#3B82F6'),
  ('Santé', 'Sondages sur la santé et le bien-être', '#F59E0B'),
  ('Éducation', 'Sondages sur l''éducation', '#06B6D4'),
  ('Environnement', 'Sondages sur l''environnement et l''écologie', '#22C55E'),
  ('Économie', 'Sondages sur l''économie et les finances', '#F97316'),
  ('Société', 'Sondages sur les questions de société', '#A855F7'),
  ('Autre', 'Autres sujets', '#6B7280')
ON CONFLICT (nom) DO NOTHING;

-- Ajouter la colonne id_categorie à la table sondages
ALTER TABLE sondages 
ADD COLUMN IF NOT EXISTS id_categorie INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- Mettre à jour les sondages existants avec une catégorie par défaut (Autre)
UPDATE sondages 
SET id_categorie = (SELECT id FROM categories WHERE nom = 'Autre' LIMIT 1)
WHERE id_categorie IS NULL;
