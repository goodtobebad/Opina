import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.png';

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
      <nav className="bg-white shadow-sm safe-top pt-6 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24 md:h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Opina" className="h-10 md:h-12 w-auto" />
              </Link>
              {/* Menu desktop */}
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
                    {utilisateur?.est_super_admin && (
                      <Link to="/admin/gerer-categories" className={isActive('/admin/gerer-categories')}>
                        Catégories
                      </Link>
                    )}
                    <Link to="/admin/creer-sondage" className={isActive('/admin/creer-sondage')}>
                      Créer un sondage
                    </Link>
                  </>
                )}
              </div>
              {/* Menu mobile - liens principaux */}
              <div className="flex md:hidden space-x-3 text-sm">
                {!utilisateur?.est_admin && (
                  <>
                    <Link to="/sondages" className={`${isActive('/sondages')} whitespace-nowrap`}>
                      Sondages
                    </Link>
                    {utilisateur && (
                      <Link to="/historique" className={`${isActive('/historique')} whitespace-nowrap`}>
                        Historique
                      </Link>
                    )}
                  </>
                )}
                {utilisateur?.est_admin && (
                  <>
                    <Link to="/admin/gerer-sondages" className={`${isActive('/admin/gerer-sondages')} whitespace-nowrap text-xs`}>
                      Sondages
                    </Link>
                    {utilisateur?.est_super_admin && (
                      <Link to="/admin/gerer-categories" className={`${isActive('/admin/gerer-categories')} whitespace-nowrap text-xs`}>
                        Catégories
                      </Link>
                    )}
                    <Link to="/admin/creer-sondage" className={`${isActive('/admin/creer-sondage')} whitespace-nowrap text-xs`}>
                      Créer
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {utilisateur ? (
                <>
                  <span className="hidden sm:inline text-gray-700 text-sm md:text-base">Bonjour, {utilisateur.nom}</span>
                  {utilisateur.est_super_admin && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      Super Admin
                    </span>
                  )}
                  {utilisateur.est_admin && !utilisateur.est_super_admin && (
                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                      Admin
                    </span>
                  )}
                  <button onClick={handleDeconnexion} className="btn-secondary text-sm md:text-base px-3 md:px-4 py-1.5 md:py-2">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/connexion" className="btn-secondary text-sm md:text-base px-3 md:px-4 py-1.5 md:py-2">
                    Connexion
                  </Link>
                  <Link to="/inscription" className="btn-primary text-sm md:text-base px-3 md:px-4 py-1.5 md:py-2">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 md:pt-24">
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
