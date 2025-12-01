import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Accueil from './pages/Accueil';
import Sondages from './pages/Sondages';
import Historique from './pages/Historique';
import DetailSondage from './pages/DetailSondage';
import CreerSondage from './pages/CreerSondage';
import GererSondages from './pages/GererSondages';
import ModifierSondage from './pages/ModifierSondage';
import Statistiques from './pages/Statistiques';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  if (!utilisateur) {
    return <Navigate to="/connexion" replace />;
  }

  if (adminOnly && !utilisateur.est_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="connexion" element={<Connexion />} />
          <Route path="inscription" element={<Inscription />} />
          <Route path="sondages" element={<Sondages />} />
          <Route path="sondages/:id" element={<DetailSondage />} />
          <Route 
            path="historique" 
            element={
              <ProtectedRoute>
                <Historique />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/creer-sondage" 
            element={
              <ProtectedRoute adminOnly>
                <CreerSondage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/gerer-sondages" 
            element={
              <ProtectedRoute adminOnly>
                <GererSondages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/modifier-sondage/:id" 
            element={
              <ProtectedRoute adminOnly>
                <ModifierSondage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/statistiques/:id" 
            element={
              <ProtectedRoute adminOnly>
                <Statistiques />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
