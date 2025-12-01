import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Obtenir les statistiques d'un sondage
export const obtenirStatistiques = async (req: AuthRequest, res: Response) => {
  try {
    const { id_sondage } = req.params;

    // Vérifier que le sondage existe
    const sondageResult = await pool.query(
      `SELECT * FROM sondages WHERE id = $1`,
      [id_sondage]
    );

    if (sondageResult.rows.length === 0) {
      return res.status(404).json({ erreur: 'Sondage non trouvé' });
    }

    const sondage = sondageResult.rows[0];
    const maintenant = new Date();

    // Vérifier que le sondage est terminé
    if (new Date(sondage.date_fin) > maintenant) {
      return res.status(403).json({ 
        erreur: 'Les statistiques ne sont disponibles qu\'après la clôture du sondage' 
      });
    }

    // Obtenir le nombre total de votes valides
    const totalVotesResult = await pool.query(
      `SELECT COUNT(*) as total FROM votes WHERE id_sondage = $1 AND est_valide = true`,
      [id_sondage]
    );

    const totalVotes = parseInt(totalVotesResult.rows[0].total);

    // Obtenir les statistiques par option
    const statistiquesResult = await pool.query(
      `SELECT o.id, o.texte, o.ordre,
       COUNT(v.id) as nombre_votes,
       CASE 
         WHEN $2 > 0 THEN ROUND((COUNT(v.id)::numeric / $2) * 100, 2)
         ELSE 0
       END as pourcentage
       FROM options_sondage o
       LEFT JOIN votes v ON o.id = v.id_option AND v.est_valide = true
       WHERE o.id_sondage = $1
       GROUP BY o.id, o.texte, o.ordre
       ORDER BY o.ordre`,
      [id_sondage, totalVotes]
    );

    res.json({
      sondage: {
        id: sondage.id,
        titre: sondage.titre,
        description: sondage.description,
        date_debut: sondage.date_debut,
        date_fin: sondage.date_fin
      },
      total_votes: totalVotes,
      statistiques: statistiquesResult.rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ erreur: 'Erreur lors de la récupération des statistiques' });
  }
};
