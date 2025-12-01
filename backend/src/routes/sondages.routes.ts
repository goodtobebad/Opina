import { Router } from 'express';
import { body } from 'express-validator';
import * as sondagesController from '../controllers/sondages.controller';
import { authentifier, verifierAdmin } from '../middleware/auth.middleware';

const router = Router();

// Obtenir tous les sondages ouverts (public)
router.get('/ouverts', sondagesController.obtenirSondagesOuverts);

// Obtenir tous les sondages (admin)
router.get('/', authentifier, verifierAdmin, sondagesController.obtenirTousSondages);

// Obtenir un sondage par ID
router.get('/:id', authentifier, sondagesController.obtenirSondageParId);

// Créer un sondage (admin uniquement)
router.post('/',
  authentifier,
  verifierAdmin,
  body('titre').notEmpty().withMessage('Le titre est requis'),
  body('options').isArray({ min: 2 }).withMessage('Au moins 2 options sont requises'),
  body('date_debut').isISO8601().withMessage('Date de début invalide'),
  body('date_fin').isISO8601().withMessage('Date de fin invalide'),
  sondagesController.creerSondage
);

// Modifier un sondage (admin uniquement)
router.put('/:id',
  authentifier,
  verifierAdmin,
  sondagesController.modifierSondage
);

// Supprimer un sondage (admin uniquement)
router.delete('/:id',
  authentifier,
  verifierAdmin,
  sondagesController.supprimerSondage
);

export default router;
