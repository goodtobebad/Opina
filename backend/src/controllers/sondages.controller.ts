import { Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Obtenir tous les sondages ouverts
export const obtenirSondagesOuverts = async (req: AuthRequest, res: Response) => {
  try {
    const maintenant = new Date().toISOString();
    
    const result = await pool.query(
      `SELECT s.*, u.nom as nom_createur,
       (SELECT COUNT(*) FROM votes WHERE id_sondage = s.id AND est_valide = true) as nombre_votes
       FROM sondages s
       JOIN utilisateurs u ON s.id_createur = u.id
       WHERE s.date_fin > $1::timestamp
       ORDER BY s.date_debut ASC, s.date_creation DESC`,
      [maintenant]
    );

    console.log(`Found ${result.rows.length} surveys`);
    res.json({ sondages: result.rows });
  } catch (error) {
    res.status(500).json({ erreur: 'Erreur lors de la récupération des sondages' });
  }
};

// Obtenir tous les sondages (admin)
export const obtenirTousSondages = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.nom as nom_createur,
       (SELECT COUNT(*) FROM votes WHERE id_sondage = s.id AND est_valide = true) as nombre_votes
       FROM sondages s
       JOIN utilisateurs u ON s.id_createur = u.id
       ORDER BY s.date_creation DESC`
    );

    res.json({ sondages: result.rows });
  } catch (error) {
    console.error('Erreur lors de la récupération des sondages:', error);
    res.status(500).json({ erreur: 'Erreur lors de la récupération des sondages' });
  }
};

// Obtenir un sondage par ID
export const obtenirSondageParId = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const sondageResult = await pool.query(
      `SELECT s.*, u.nom as nom_createur,
       (SELECT COUNT(*) FROM votes WHERE id_sondage = s.id AND est_valide = true) as nombre_votes
       FROM sondages s
       JOIN utilisateurs u ON s.id_createur = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (sondageResult.rows.length === 0) {
      return res.status(404).json({ erreur: 'Sondage non trouvé' });
    }

    const sondage = sondageResult.rows[0];

    // Récupérer les options
    const optionsResult = await pool.query(
      `SELECT * FROM options_sondage WHERE id_sondage = $1 ORDER BY ordre`,
      [id]
    );

    sondage.options = optionsResult.rows;

    // Vérifier si l'utilisateur a déjà voté
    if (req.utilisateur) {
      const voteResult = await pool.query(
        `SELECT * FROM votes WHERE id_sondage = $1 AND id_utilisateur = $2`,
        [id, req.utilisateur.id]
      );
      sondage.a_vote = voteResult.rows.length > 0;
      sondage.vote = voteResult.rows[0] || null;
    }

    res.json({ sondage });
  } catch (error) {
    console.error('Erreur lors de la récupération du sondage:', error);
    res.status(500).json({ erreur: 'Erreur lors de la récupération du sondage' });
  }
};

// Créer un sondage (admin)
export const creerSondage = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }

    const { titre, description, options, date_debut, date_fin } = req.body;

    // Vérifier que la date de fin est après la date de début
    if (new Date(date_fin) <= new Date(date_debut)) {
      return res.status(400).json({ erreur: 'La date de fin doit être après la date de début' });
    }

    // Vérifier si un sondage avec ce titre existe déjà
    const titreExistant = await client.query(
      'SELECT id FROM sondages WHERE titre = $1',
      [titre]
    );

    if (titreExistant.rows.length > 0) {
      return res.status(400).json({ erreur: 'Un sondage avec ce titre existe déjà' });
    }

    await client.query('BEGIN');

    // Créer le sondage
    const sondageResult = await client.query(
      `INSERT INTO sondages (titre, description, date_debut, date_fin, id_createur)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [titre, description || null, date_debut, date_fin, req.utilisateur!.id]
    );

    const sondage = sondageResult.rows[0];

    // Créer les options
    const optionsPromises = options.map((option: string, index: number) => {
      return client.query(
        `INSERT INTO options_sondage (id_sondage, texte, ordre)
         VALUES ($1, $2, $3) RETURNING *`,
        [sondage.id, option, index]
      );
    });

    const optionsResults = await Promise.all(optionsPromises);
    sondage.options = optionsResults.map(r => r.rows[0]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Sondage créé avec succès',
      sondage
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la création du sondage:', error);
    res.status(500).json({ erreur: 'Erreur lors de la création du sondage' });
  } finally {
    client.release();
  }
};

// Modifier un sondage (admin)
export const modifierSondage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { titre, description, date_debut, date_fin } = req.body;

    // Vérifier que le sondage existe
    const sondageExistant = await pool.query(
      'SELECT * FROM sondages WHERE id = $1',
      [id]
    );

    if (sondageExistant.rows.length === 0) {
      return res.status(404).json({ erreur: 'Sondage non trouvé' });
    }

    const sondage = sondageExistant.rows[0];
    const maintenant = new Date().toISOString();

    // Vérifier si le sondage a déjà commencé
    if (sondage.date_debut <= maintenant) {
      return res.status(400).json({ erreur: 'Impossible de modifier un sondage qui a déjà commencé' });
    }

    // Si un nouveau titre est fourni, vérifier qu'il n'existe pas déjà
    if (titre && titre !== sondage.titre) {
      const titreExistant = await pool.query(
        'SELECT id FROM sondages WHERE titre = $1 AND id != $2',
        [titre, id]
      );

      if (titreExistant.rows.length > 0) {
        return res.status(400).json({ erreur: 'Un sondage avec ce titre existe déjà' });
      }
    }

    // Vérifier que la date de fin est après la date de début
    const nouvelleDateDebut = date_debut || sondage.date_debut;
    const nouvelleDateFin = date_fin || sondage.date_fin;
    
    if (new Date(nouvelleDateFin) <= new Date(nouvelleDateDebut)) {
      return res.status(400).json({ erreur: 'La date de fin doit être après la date de début' });
    }

    // Mettre à jour le sondage
    const result = await pool.query(
      `UPDATE sondages 
       SET titre = COALESCE($1, titre),
           description = COALESCE($2, description),
           date_debut = COALESCE($3, date_debut),
           date_fin = COALESCE($4, date_fin),
           date_modification = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [titre, description, date_debut, date_fin, id]
    );

    res.json({
      message: 'Sondage modifié avec succès',
      sondage: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur lors de la modification du sondage:', error);
    res.status(500).json({ erreur: 'Erreur lors de la modification du sondage' });
  }
};

// Supprimer un sondage (admin)
export const supprimerSondage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM sondages WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Sondage non trouvé' });
    }

    res.json({ message: 'Sondage supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du sondage:', error);
    res.status(500).json({ erreur: 'Erreur lors de la suppression du sondage' });
  }
};
