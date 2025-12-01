import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Accueil() {
  const { utilisateur } = useAuth();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Bienvenue sur Opina
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          La plateforme française pour créer et participer à des sondages en toute simplicité
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/sondages" className="btn-primary text-lg px-8 py-3">
            Voir les sondages
          </Link>
          {!utilisateur && (
            <Link to="/inscription" className="btn-secondary text-lg px-8 py-3">
              Créer un compte
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Créez des sondages</h3>
          <p className="text-gray-600">
            Les administrateurs peuvent créer des sondages avec plusieurs options et définir des dates d'ouverture et de clôture.
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-semibold mb-2">Votez en toute sécurité</h3>
          <p className="text-gray-600">
            Chaque vote est validé par email ou SMS pour garantir l'authenticité et éviter les doublons.
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-semibold mb-2">Consultez les résultats</h3>
          <p className="text-gray-600">
            Les statistiques détaillées sont disponibles après la clôture du sondage avec des pourcentages précis.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="card">
        <h2 className="text-3xl font-bold text-center mb-8">Comment ça marche ?</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-lg">Inscrivez-vous</h4>
              <p className="text-gray-600">
                Créez un compte avec votre nom, email et numéro de téléphone. Vous pouvez aussi utiliser OAuth2 (Google ou Apple).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-lg">Parcourez les sondages</h4>
              <p className="text-gray-600">
                Consultez la liste des sondages actuellement ouverts et choisissez ceux qui vous intéressent.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-lg">Votez et validez</h4>
              <p className="text-gray-600">
                Sélectionnez votre choix et validez votre vote avec le code reçu par email ou SMS.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-lg">Consultez les résultats</h4>
              <p className="text-gray-600">
                Après la clôture du sondage, visualisez les statistiques et les pourcentages de chaque option.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
