import { Router } from 'express';
import * as statistiquesController from '../controllers/statistiques.controller';
import { authentifier } from '../middleware/auth.middleware';

const router = Router();

// Obtenir les statistiques d'un sondage (uniquement si terminé)
router.get('/:id_sondage', authentifier, statistiquesController.obtenirStatistiques);

export default router;
