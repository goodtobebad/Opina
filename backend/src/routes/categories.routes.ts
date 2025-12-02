import { Router } from 'express';
import { body } from 'express-validator';
import * as categoriesController from '../controllers/categories.controller';
import { authentifier, verifierAdmin } from '../middleware/auth.middleware';

const router = Router();

// Obtenir toutes les catégories (public)
router.get('/', categoriesController.obtenirCategories);

// Obtenir une catégorie par ID (public)
router.get('/:id', categoriesController.obtenirCategorieParId);

// Créer une catégorie (admin)
router.post('/',
  authentifier,
  verifierAdmin,
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('couleur').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Couleur invalide (format: #RRGGBB)'),
  categoriesController.creerCategorie
);

// Modifier une catégorie (admin)
router.put('/:id',
  authentifier,
  verifierAdmin,
  body('nom').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('couleur').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Couleur invalide (format: #RRGGBB)'),
  categoriesController.modifierCategorie
);

// Supprimer une catégorie (admin)
router.delete('/:id',
  authentifier,
  verifierAdmin,
  categoriesController.supprimerCategorie
);

export default router;
