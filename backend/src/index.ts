import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import sondagesRoutes from './routes/sondages.routes';
import votesRoutes from './routes/votes.routes';
import statistiquesRoutes from './routes/statistiques.routes';
import categoriesRoutes from './routes/categories.routes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost'
];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (mobile apps)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est dans la liste autorisée
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('capacitor')) {
      callback(null, true);
    } else {
      // En production, bloquer les origines non autorisées
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS'));
      } else {
        // En développement, autoriser tout
        callback(null, true);
      }
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sondages', sondagesRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/statistiques', statistiquesRoutes);
app.use('/api/categories', categoriesRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Opina fonctionnelle' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ erreur: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    erreur: err.message || 'Erreur interne du serveur'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 API disponible sur: http://localhost:${PORT}/api`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
