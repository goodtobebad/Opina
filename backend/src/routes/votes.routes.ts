import { Router } from 'express';
import { body } from 'express-validator';
import * as votesController from '../controllers/votes.controller';
import { authentifier } from '../middleware/auth.middleware';

const router = Router();

// Voter pour un sondage
router.post('/',
  authentifier,
  body('id_sondage').isInt().withMessage('ID de sondage invalide'),
  body('id_option').isInt().withMessage('ID d\'option invalide'),
  body('type_validation').isIn(['email', 'sms']).withMessage('Type de validation invalide'),
  votesController.voter
);

// Valider un vote avec le code
router.post('/valider',
  authentifier,
  body('id_vote').isInt().withMessage('ID de vote invalide'),
  body('code').notEmpty().withMessage('Code de validation requis'),
  votesController.validerVote
);

// Obtenir l'historique des votes de l'utilisateur
router.get('/historique', authentifier, votesController.obtenirHistorique);

export default router;
