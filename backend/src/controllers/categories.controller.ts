import { Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Obtenir toutes les catégories
export const obtenirCategories = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY nom ASC'
    );

    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ erreur: 'Erreur lors de la récupération des catégories' });
  }
};

// Obtenir une catégorie par ID
export const obtenirCategorieParId = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Catégorie non trouvée' });
    }

    res.json({ categorie: result.rows[0] });
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({ erreur: 'Erreur lors de la récupération de la catégorie' });
  }
};

// Créer une catégorie (admin)
export const creerCategorie = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }

    const { nom, description, couleur } = req.body;

    // Vérifier si une catégorie avec ce nom existe déjà
    const existant = await pool.query(
      'SELECT id FROM categories WHERE nom = $1',
      [nom]
    );

    if (existant.rows.length > 0) {
      return res.status(400).json({ erreur: 'Une catégorie avec ce nom existe déjà' });
    }

    const result = await pool.query(
      `INSERT INTO categories (nom, description, couleur)
       VALUES ($1, $2, $3) RETURNING *`,
      [nom, description || null, couleur || '#3B82F6']
    );

    res.status(201).json({
      message: 'Catégorie créée avec succès',
      categorie: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({ erreur: 'Erreur lors de la création de la catégorie' });
  }
};

// Modifier une catégorie (admin)
export const modifierCategorie = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, description, couleur } = req.body;

    // Vérifier que la catégorie existe
    const categorieExistante = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );

    if (categorieExistante.rows.length === 0) {
      return res.status(404).json({ erreur: 'Catégorie non trouvée' });
    }

    // Si un nouveau nom est fourni, vérifier qu'il n'existe pas déjà
    if (nom && nom !== categorieExistante.rows[0].nom) {
      const nomExistant = await pool.query(
        'SELECT id FROM categories WHERE nom = $1 AND id != $2',
        [nom, id]
      );

      if (nomExistant.rows.length > 0) {
        return res.status(400).json({ erreur: 'Une catégorie avec ce nom existe déjà' });
      }
    }

    const result = await pool.query(
      `UPDATE categories 
       SET nom = COALESCE($1, nom),
           description = COALESCE($2, description),
           couleur = COALESCE($3, couleur)
       WHERE id = $4
       RETURNING *`,
      [nom, description, couleur, id]
    );

    res.json({
      message: 'Catégorie modifiée avec succès',
      categorie: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la catégorie:', error);
    res.status(500).json({ erreur: 'Erreur lors de la modification de la catégorie' });
  }
};

// Supprimer une catégorie (admin)
export const supprimerCategorie = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier combien de sondages utilisent cette catégorie
    const sondagesCount = await pool.query(
      'SELECT COUNT(*) as count FROM sondages WHERE id_categorie = $1',
      [id]
    );

    const count = parseInt(sondagesCount.rows[0].count);

    if (count > 0) {
      return res.status(400).json({ 
        erreur: `Impossible de supprimer cette catégorie car ${count} sondage(s) l'utilisent` 
      });
    }

    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Catégorie non trouvée' });
    }

    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ erreur: 'Erreur lors de la suppression de la catégorie' });
  }
};
