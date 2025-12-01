import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

interface FormData {
  nom: string;
  email: string;
  numero_telephone: string;
  mot_de_passe: string;
  confirmation_mot_de_passe: string;
}

export default function Inscription() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const { inscription } = useAuth();
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(false);

  const onSubmit = async (data: FormData) => {
    setChargement(true);
    try {
      await inscription(data.nom, data.email, data.numero_telephone, data.mot_de_passe);
      navigate('/sondages');
    } catch (error) {
      // L'erreur est gérée par le contexte Auth avec toast
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-3xl font-bold text-center mb-6">Inscription</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              id="nom"
              type="text"
              {...register('nom', {
                required: 'Le nom est requis'
              })}
              className="input-field"
              disabled={chargement}
            />
            {errors.nom && (
              <p className="text-red-600 text-sm mt-1">{errors.nom.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'L\'email est requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email invalide'
                }
              })}
              className="input-field"
              disabled={chargement}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="numero_telephone" className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de téléphone <span className="text-gray-500">(optionnel)</span>
            </label>
            <input
              id="numero_telephone"
              type="tel"
              {...register('numero_telephone')}
              className="input-field"
              placeholder="+33 6 12 34 56 78"
              disabled={chargement}
            />
          </div>

          <div>
            <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="mot_de_passe"
              type="password"
              {...register('mot_de_passe', {
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit contenir au moins 6 caractères'
                }
              })}
              className="input-field"
              disabled={chargement}
            />
            {errors.mot_de_passe && (
              <p className="text-red-600 text-sm mt-1">{errors.mot_de_passe.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmation_mot_de_passe" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmation_mot_de_passe"
              type="password"
              {...register('confirmation_mot_de_passe', {
                required: 'Veuillez confirmer le mot de passe',
                validate: (value) =>
                  value === watch('mot_de_passe') || 'Les mots de passe ne correspondent pas'
              })}
              className="input-field"
              disabled={chargement}
            />
            {errors.confirmation_mot_de_passe && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmation_mot_de_passe.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full btn-primary"
            disabled={chargement}
          >
            {chargement ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="text-primary-600 hover:text-primary-700 font-medium">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
