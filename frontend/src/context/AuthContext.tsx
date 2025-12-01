import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  est_admin: boolean;
}

interface AuthContextType {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  connexion: (email: string, motDePasse: string) => Promise<void>;
  inscription: (nom: string, email: string, numeroTelephone: string, motDePasse: string) => Promise<void>;
  deconnexion: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    verifierToken();
  }, []);

  const verifierToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChargement(false);
      return;
    }

    try {
      const response = await api.get('/auth/verifier');
      setUtilisateur(response.data.utilisateur);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setChargement(false);
    }
  };

  const connexion = async (email: string, motDePasse: string) => {
    try {
      const response = await api.post('/auth/connexion', {
        email,
        mot_de_passe: motDePasse,
      });

      localStorage.setItem('token', response.data.token);
      setUtilisateur(response.data.utilisateur);
      toast.success('Connexion réussie !');
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors de la connexion');
      throw error;
    }
  };

  const inscription = async (nom: string, email: string, numeroTelephone: string, motDePasse: string) => {
    try {
      const response = await api.post('/auth/inscription', {
        nom,
        email,
        numero_telephone: numeroTelephone,
        mot_de_passe: motDePasse,
      });

      localStorage.setItem('token', response.data.token);
      setUtilisateur(response.data.utilisateur);
      toast.success('Inscription réussie !');
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors de l\'inscription');
      throw error;
    }
  };

  const deconnexion = () => {
    localStorage.removeItem('token');
    setUtilisateur(null);
    toast.success('Déconnexion réussie');
  };

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
