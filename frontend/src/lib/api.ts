import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Détecter si on est sur mobile ou web
const isNativePlatform = Capacitor.isNativePlatform();

// URL de base selon l'environnement
const getBaseURL = () => {
  if (isNativePlatform) {
    // Mobile app - use Render production API
    return 'https://opina-w341.onrender.com/api';
  }
  // Web - use Render production API (or local for development)
  // return '/api'; // Use this for local backend via Vite proxy
  return 'https://opina-w341.onrender.com/api'; // Use Render directly
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ne rediriger que si on est déjà connecté (token invalide/expiré)
      // Pas si on est sur la page de connexion (échec de connexion)
      const token = localStorage.getItem('token');
      const isLoginPage = window.location.pathname === '/connexion';
      
      if (token && !isLoginPage) {
        localStorage.removeItem('token');
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
