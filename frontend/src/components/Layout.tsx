import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { utilisateur, deconnexion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600';
  };

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">Opina</h1>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link to="/" className={isActive('/')}>
                  Accueil
                </Link>
                {!utilisateur?.est_admin && (
                  <>
                    <Link to="/sondages" className={isActive('/sondages')}>
                      Sondages
                    </Link>
                    {utilisateur && (
                      <Link to="/historique" className={isActive('/historique')}>
                        Historique
                      </Link>
                    )}
                  </>
                )}
                {utilisateur?.est_admin && (
                  <>
                    <Link to="/admin/gerer-sondages" className={isActive('/admin/gerer-sondages')}>
                      Gérer les sondages
                    </Link>
                    <Link to="/admin/creer-sondage" className={isActive('/admin/creer-sondage')}>
                      Créer un sondage
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {utilisateur ? (
                <>
                  <span className="text-gray-700">Bonjour, {utilisateur.nom}</span>
                  {utilisateur.est_admin && (
                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                      Admin
                    </span>
                  )}
                  <button onClick={handleDeconnexion} className="btn-secondary">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/connexion" className="btn-secondary">
                    Connexion
                  </Link>
                  <Link to="/inscription" className="btn-primary">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            © 2025 Opina - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
