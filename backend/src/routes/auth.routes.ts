import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Inscription locale
router.post('/inscription',
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('numero_telephone').optional().isMobilePhone('any'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  authController.inscription
);

// Connexion locale
router.post('/connexion',
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe').notEmpty().withMessage('Le mot de passe est requis'),
  authController.connexion
);

// OAuth2 Google
router.post('/google', authController.googleAuth);

// OAuth2 Apple
router.post('/apple', authController.appleAuth);

// Vérifier le token
router.get('/verifier', authController.verifierToken);

export default router;
