import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  utilisateur?: {
    id: number;
    email: string;
    est_admin: boolean;
    est_super_admin: boolean;
  };
}

export const authentifier = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ erreur: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.utilisateur = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erreur: 'Token invalide' });
  }
};

export const verifierAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.utilisateur?.est_admin) {
    return res.status(403).json({ erreur: 'Accès refusé. Droits administrateur requis.' });
  }
  next();
};

export const verifierSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.utilisateur?.est_super_admin) {
    return res.status(403).json({ erreur: 'Accès refusé. Droits super administrateur requis.' });
  }
  next();
};

// Authentification optionnelle - ne bloque pas si pas de token
export const authentifierOptionnelle = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.utilisateur = decoded;
    }
    // Continue même sans token
    next();
  } catch (error) {
    // Continue même si le token est invalide
    next();
  }
};
