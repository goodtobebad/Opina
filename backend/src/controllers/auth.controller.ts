import { Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Inscription locale
export const inscription = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }

    const { nom, email, numero_telephone, mot_de_passe } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [email]
    );

    if (utilisateurExistant.rows.length > 0) {
      return res.status(400).json({ erreur: 'Un utilisateur avec cet email existe déjà' });
    }

    // Vérifier si le numéro de téléphone existe déjà (si fourni)
    if (numero_telephone) {
      const telephoneExistant = await pool.query(
        'SELECT * FROM utilisateurs WHERE numero_telephone = $1',
        [numero_telephone]
      );

      if (telephoneExistant.rows.length > 0) {
        return res.status(400).json({ erreur: 'Un utilisateur avec ce numéro de téléphone existe déjà' });
      }
    }

    // Hasher le mot de passe
    const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);

    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO utilisateurs (nom, email, numero_telephone, mot_de_passe, methode_auth)
       VALUES ($1, $2, $3, $4, 'local') RETURNING id, nom, email, est_admin`,
      [nom, email, numero_telephone, motDePasseHash]
    );

    const utilisateur = result.rows[0];

    // Créer le token JWT
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, est_admin: utilisateur.est_admin },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        est_admin: utilisateur.est_admin
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ erreur: 'Erreur lors de l\'inscription' });
  }
};

// Connexion locale
export const connexion = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }

    const { email, mot_de_passe } = req.body;

    // Trouver l'utilisateur
    const result = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1 AND methode_auth = $2',
      [email, 'local']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
    }

    const utilisateur = result.rows[0];

    // Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, est_admin: utilisateur.est_admin },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        est_admin: utilisateur.est_admin
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ erreur: 'Erreur lors de la connexion' });
  }
};

// OAuth2 Google (simplifié - nécessite configuration complète)
export const googleAuth = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implémenter la vérification du token Google
    const { token: googleToken, nom, email } = req.body;

    // Vérifier si l'utilisateur existe
    let result = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [email]
    );

    let utilisateur;

    if (result.rows.length === 0) {
      // Créer un nouvel utilisateur
      result = await pool.query(
        `INSERT INTO utilisateurs (nom, email, methode_auth, oauth_id)
         VALUES ($1, $2, 'google', $3) RETURNING id, nom, email, est_admin`,
        [nom, email, googleToken]
      );
      utilisateur = result.rows[0];
    } else {
      utilisateur = result.rows[0];
    }

    // Créer le token JWT
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, est_admin: utilisateur.est_admin },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authentification Google réussie',
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        est_admin: utilisateur.est_admin
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification Google:', error);
    res.status(500).json({ erreur: 'Erreur lors de l\'authentification Google' });
  }
};

// OAuth2 Apple (simplifié - nécessite configuration complète)
export const appleAuth = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implémenter la vérification du token Apple
    const { token: appleToken, nom, email } = req.body;

    // Vérifier si l'utilisateur existe
    let result = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [email]
    );

    let utilisateur;

    if (result.rows.length === 0) {
      // Créer un nouvel utilisateur
      result = await pool.query(
        `INSERT INTO utilisateurs (nom, email, methode_auth, oauth_id)
         VALUES ($1, $2, 'apple', $3) RETURNING id, nom, email, est_admin`,
        [nom, email, appleToken]
      );
      utilisateur = result.rows[0];
    } else {
      utilisateur = result.rows[0];
    }

    // Créer le token JWT
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, est_admin: utilisateur.est_admin },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authentification Apple réussie',
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        est_admin: utilisateur.est_admin
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification Apple:', error);
    res.status(500).json({ erreur: 'Erreur lors de l\'authentification Apple' });
  }
};

// Vérifier le token
export const verifierToken = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ erreur: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Récupérer les infos de l'utilisateur
    const result = await pool.query(
      'SELECT id, nom, email, est_admin FROM utilisateurs WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erreur: 'Utilisateur non trouvé' });
    }

    res.json({
      valide: true,
      utilisateur: result.rows[0]
    });
  } catch (error) {
    res.status(401).json({ erreur: 'Token invalide' });
  }
};
