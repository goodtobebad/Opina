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
       c.nom as nom_categorie, c.couleur as couleur_categorie,
       (SELECT COUNT(*) FROM votes WHERE id_sondage = s.id AND est_valide = true) as nombre_votes
       FROM sondages s
       JOIN utilisateurs u ON s.id_createur = u.id
       LEFT JOIN categories c ON s.id_categorie = c.id
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
       c.nom as nom_categorie, c.couleur as couleur_categorie,
       (SELECT COUNT(*) FROM votes WHERE id_sondage = s.id AND est_valide = true) as nombre_votes
       FROM sondages s
       JOIN utilisateurs u ON s.id_createur = u.id
       LEFT JOIN categories c ON s.id_categorie = c.id
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
       c.nom as nom_categorie, c.couleur as couleur_categorie,
       (SELECT COUNT(*) FROM votes WHERE id_sondage = s.id AND est_valide = true) as nombre_votes
       FROM sondages s
       JOIN utilisateurs u ON s.id_createur = u.id
       LEFT JOIN categories c ON s.id_categorie = c.id
       WHERE s.id = $1`,
      [id]
    );

    if (sondageResult.rows.length === 0) {
      return res.status(404).json({ erreur: 'Sondage non trouvé' });
    }

    const sondage = sondageResult.rows[0];
    const estFerme = new Date(sondage.date_fin) <= new Date();

    // Récupérer les options avec statistiques si le sondage est fermé et l'utilisateur a voté
    let aVote = false;
    let vote = null;
    
    if (req.utilisateur) {
      const voteResult = await pool.query(
        `SELECT * FROM votes WHERE id_sondage = $1 AND id_utilisateur = $2`,
        [id, req.utilisateur.id]
      );
      aVote = voteResult.rows.length > 0;
      vote = voteResult.rows[0] || null;
    }

    // Si le sondage est fermé et l'utilisateur a voté, inclure les statistiques
    if (estFerme && aVote) {
      const optionsResult = await pool.query(
        `SELECT o.id, o.texte, o.description, o.ordre,
         COUNT(v.id) as nombre_votes,
         ROUND((COUNT(v.id)::numeric / NULLIF($2, 0)) * 100, 2) as pourcentage
         FROM options_sondage o
         LEFT JOIN votes v ON o.id = v.id_option AND v.est_valide = true
         WHERE o.id_sondage = $1
         GROUP BY o.id, o.texte, o.description, o.ordre
         ORDER BY o.ordre`,
        [id, sondage.nombre_votes]
      );
      sondage.options = optionsResult.rows;
    } else {
      // Sinon, récupérer juste les options normales
      const optionsResult = await pool.query(
        `SELECT * FROM options_sondage WHERE id_sondage = $1 ORDER BY ordre`,
        [id]
      );
      sondage.options = optionsResult.rows;
    }

    sondage.a_vote = aVote;
    sondage.vote = vote;

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
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ erreurs: errors.array() });
    }

    const { titre, description, options, date_debut, date_fin, id_categorie } = req.body;
    
    console.log('📝 Création de sondage:', { titre, date_debut, date_fin, id_categorie, options_count: options?.length });

    // Vérifier que la catégorie est fournie
    if (!id_categorie) {
      console.error('❌ Catégorie manquante');
      return res.status(400).json({ erreur: 'La catégorie est obligatoire' });
    }

    // Vérifier que la catégorie existe
    const categorieExiste = await client.query(
      'SELECT id FROM categories WHERE id = $1',
      [id_categorie]
    );

    if (categorieExiste.rows.length === 0) {
      console.error('❌ Catégorie invalide:', id_categorie);
      return res.status(400).json({ erreur: 'Catégorie invalide' });
    }

    // Vérifier que la date de fin est après la date de début
    if (new Date(date_fin) <= new Date(date_debut)) {
      console.error('❌ Dates invalides');
      return res.status(400).json({ erreur: 'La date de fin doit être après la date de début' });
    }

    // Vérifier si un sondage avec ce titre existe déjà
    const titreExistant = await client.query(
      'SELECT id FROM sondages WHERE titre = $1',
      [titre]
    );

    if (titreExistant.rows.length > 0) {
      console.error('❌ Titre déjà existant');
      return res.status(400).json({ erreur: 'Un sondage avec ce titre existe déjà' });
    }

    await client.query('BEGIN');

    // Créer le sondage
    const sondageResult = await client.query(
      `INSERT INTO sondages (titre, description, date_debut, date_fin, id_createur, id_categorie)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [titre, description || null, date_debut, date_fin, req.utilisateur!.id, id_categorie]
    );

    const sondage = sondageResult.rows[0];
    console.log('✅ Sondage créé:', sondage.id);

    // Créer les options
    const optionsPromises = options.map((option: { texte: string }, index: number) => {
      return client.query(
        `INSERT INTO options_sondage (id_sondage, texte, ordre)
         VALUES ($1, $2, $3) RETURNING *`,
        [sondage.id, option.texte || option, index]
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
    console.error('❌ Erreur lors de la création du sondage:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ erreur: 'Erreur lors de la création du sondage' });
  } finally {
    client.release();
  }
};

// Modifier un sondage (admin)
export const modifierSondage = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { titre, description, date_debut, date_fin, options, id_categorie } = req.body;

    // Vérifier que le sondage existe
    const sondageExistant = await client.query(
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
      const titreExistant = await client.query(
        'SELECT id FROM sondages WHERE titre = $1 AND id != $2',
        [titre, id]
      );

      if (titreExistant.rows.length > 0) {
        return res.status(400).json({ erreur: 'Un sondage avec ce titre existe déjà' });
      }
    }

    // Si une nouvelle catégorie est fournie, vérifier qu'elle existe
    if (id_categorie) {
      const categorieExiste = await client.query(
        'SELECT id FROM categories WHERE id = $1',
        [id_categorie]
      );

      if (categorieExiste.rows.length === 0) {
        return res.status(400).json({ erreur: 'Catégorie invalide' });
      }
    }

    // Vérifier que la date de fin est après la date de début
    const nouvelleDateDebut = date_debut || sondage.date_debut;
    const nouvelleDateFin = date_fin || sondage.date_fin;
    
    if (new Date(nouvelleDateFin) <= new Date(nouvelleDateDebut)) {
      return res.status(400).json({ erreur: 'La date de fin doit être après la date de début' });
    }

    await client.query('BEGIN');

    // Mettre à jour le sondage
    const result = await client.query(
      `UPDATE sondages 
       SET titre = COALESCE($1, titre),
           description = COALESCE($2, description),
           date_debut = COALESCE($3, date_debut),
           date_fin = COALESCE($4, date_fin),
           id_categorie = COALESCE($5, id_categorie),
           date_modification = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [titre, description, date_debut, date_fin, id_categorie, id]
    );

    // Si des options sont fournies, les mettre à jour
    if (options && Array.isArray(options)) {
      // Supprimer les anciennes options
      await client.query('DELETE FROM options_sondage WHERE id_sondage = $1', [id]);

      // Créer les nouvelles options
      const optionsPromises = options.map((option: { id?: number; texte: string; description?: string }, index: number) => {
        return client.query(
          `INSERT INTO options_sondage (id_sondage, texte, description, ordre)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [id, option.texte, option.description || null, index]
        );
      });

      await Promise.all(optionsPromises);
    }

    await client.query('COMMIT');

    res.json({
      message: 'Sondage modifié avec succès',
      sondage: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la modification du sondage:', error);
    res.status(500).json({ erreur: 'Erreur lors de la modification du sondage' });
  } finally {
    client.release();
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
