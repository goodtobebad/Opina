import { Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { envoyerEmail, envoyerSMS } from '../services/notification.service';

// Voter pour un sondage
export const voter = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }

    const { id_sondage, id_option, type_validation } = req.body;
    const id_utilisateur = req.utilisateur!.id;

    // Vérifier que l'utilisateur n'est pas admin
    if (req.utilisateur!.est_admin) {
      return res.status(403).json({ erreur: 'Les administrateurs ne peuvent pas voter' });
    }

    // Vérifier que le sondage existe et est ouvert
    const sondageResult = await client.query(
      `SELECT * FROM sondages WHERE id = $1`,
      [id_sondage]
    );

    if (sondageResult.rows.length === 0) {
      return res.status(404).json({ erreur: 'Sondage non trouvé' });
    }

    const sondage = sondageResult.rows[0];
    const maintenant = new Date();

    if (new Date(sondage.date_debut) > maintenant) {
      return res.status(400).json({ erreur: 'Ce sondage n\'est pas encore ouvert' });
    }

    if (new Date(sondage.date_fin) < maintenant) {
      return res.status(400).json({ erreur: 'Ce sondage est terminé' });
    }

    // Vérifier que l'utilisateur n'a pas déjà voté
    const voteExistant = await client.query(
      `SELECT * FROM votes WHERE id_sondage = $1 AND id_utilisateur = $2`,
      [id_sondage, id_utilisateur]
    );

    if (voteExistant.rows.length > 0) {
      return res.status(400).json({ erreur: 'Vous avez déjà voté pour ce sondage' });
    }

    // Vérifier que l'option appartient au sondage
    const optionResult = await client.query(
      `SELECT * FROM options_sondage WHERE id = $1 AND id_sondage = $2`,
      [id_option, id_sondage]
    );

    if (optionResult.rows.length === 0) {
      return res.status(400).json({ erreur: 'Option invalide' });
    }

    await client.query('BEGIN');

    // Créer le vote (non validé)
    const voteResult = await client.query(
      `INSERT INTO votes (id_sondage, id_utilisateur, id_option, est_valide)
       VALUES ($1, $2, $3, false) RETURNING *`,
      [id_sondage, id_utilisateur, id_option]
    );

    const vote = voteResult.rows[0];

    // Générer un code de validation
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireLe = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await client.query(
      `INSERT INTO tokens_validation (id_vote, code, type, expire_le)
       VALUES ($1, $2, $3, $4)`,
      [vote.id, code, type_validation, expireLe]
    );

    await client.query('COMMIT');

    // Envoyer le code de validation
    const utilisateurResult = await pool.query(
      'SELECT * FROM utilisateurs WHERE id = $1',
      [id_utilisateur]
    );
    const utilisateur = utilisateurResult.rows[0];

    try {
      if (type_validation === 'email') {
        await envoyerEmail(
          utilisateur.email,
          'Code de validation Sondy',
          `Votre code de validation est: ${code}\n\nCe code expire dans 15 minutes.`
        );
      } else if (type_validation === 'sms') {
        if (!utilisateur.numero_telephone) {
          return res.status(400).json({ erreur: 'Aucun numéro de téléphone enregistré' });
        }
        await envoyerSMS(
          utilisateur.numero_telephone,
          `Votre code de validation Sondy est: ${code}`
        );
      }
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification:', notificationError);
      // For development: Return the code in the response if notification fails
      if (process.env.NODE_ENV === 'development') {
        return res.status(201).json({
          message: 'Vote enregistré. Service de notification non configuré (mode développement).',
          id_vote: vote.id,
          type_validation,
          code_validation: code // Only in development!
        });
      }
      throw notificationError;
    }

    res.status(201).json({
      message: 'Vote enregistré. Veuillez valider avec le code envoyé.',
      id_vote: vote.id,
      type_validation
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors du vote:', error);
    res.status(500).json({ erreur: 'Erreur lors du vote' });
  } finally {
    client.release();
  }
};

// Valider un vote avec le code
export const validerVote = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }

    const { id_vote, code } = req.body;
    const id_utilisateur = req.utilisateur!.id;

    // Vérifier que le vote appartient à l'utilisateur
    const voteResult = await pool.query(
      `SELECT * FROM votes WHERE id = $1 AND id_utilisateur = $2`,
      [id_vote, id_utilisateur]
    );

    if (voteResult.rows.length === 0) {
      return res.status(404).json({ erreur: 'Vote non trouvé' });
    }

    const vote = voteResult.rows[0];

    if (vote.est_valide) {
      return res.status(400).json({ erreur: 'Ce vote est déjà validé' });
    }

    // Vérifier le code
    const tokenResult = await pool.query(
      `SELECT * FROM tokens_validation 
       WHERE id_vote = $1 AND code = $2 AND utilise = false AND expire_le > NOW()`,
      [id_vote, code]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ erreur: 'Code invalide ou expiré' });
    }

    // Valider le vote
    await pool.query(
      `UPDATE votes SET est_valide = true WHERE id = $1`,
      [id_vote]
    );

    await pool.query(
      `UPDATE tokens_validation SET utilise = true WHERE id = $1`,
      [tokenResult.rows[0].id]
    );

    res.json({ message: 'Vote validé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la validation du vote:', error);
    res.status(500).json({ erreur: 'Erreur lors de la validation du vote' });
  }
};

// Obtenir l'historique des votes de l'utilisateur
export const obtenirHistorique = async (req: AuthRequest, res: Response) => {
  try {
    const id_utilisateur = req.utilisateur!.id;

    const result = await pool.query(
      `SELECT v.id, v.date_vote, v.id_option as option_votee_id,
       s.id as id_sondage, s.titre, s.date_debut, s.date_fin,
       (SELECT COUNT(*) FROM votes WHERE id_sondage = s.id AND est_valide = true) as nombre_votes_total
       FROM votes v
       JOIN sondages s ON v.id_sondage = s.id
       WHERE v.id_utilisateur = $1 AND v.est_valide = true
       ORDER BY v.date_vote DESC`,
      [id_utilisateur]
    );

    // Pour chaque vote, récupérer toutes les options avec leurs statistiques
    const historique = await Promise.all(
      result.rows.map(async (vote) => {
        const optionsResult = await pool.query(
          `SELECT o.id, o.texte, o.description, o.ordre,
           COUNT(v.id) as nombre_votes,
           ROUND((COUNT(v.id)::numeric / NULLIF($2, 0)) * 100, 2) as pourcentage
           FROM options_sondage o
           LEFT JOIN votes v ON o.id = v.id_option AND v.est_valide = true
           WHERE o.id_sondage = $1
           GROUP BY o.id, o.texte, o.description, o.ordre
           ORDER BY o.ordre`,
          [vote.id_sondage, vote.nombre_votes_total]
        );

        return {
          ...vote,
          options: optionsResult.rows
        };
      })
    );

    res.json({ historique });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ erreur: 'Erreur lors de la récupération de l\'historique' });
  }
};
