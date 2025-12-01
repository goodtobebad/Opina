import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

interface FormData {
  email: string;
  mot_de_passe: string;
}

export default function Connexion() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(false);

  const onSubmit = async (data: FormData) => {
    setChargement(true);
    try {
      await connexion(data.email, data.mot_de_passe);
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
        <h2 className="text-3xl font-bold text-center mb-6">Connexion</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="mot_de_passe"
              type="password"
              {...register('mot_de_passe', {
                required: 'Le mot de passe est requis'
              })}
              className="input-field"
              disabled={chargement}
            />
            {errors.mot_de_passe && (
              <p className="text-red-600 text-sm mt-1">{errors.mot_de_passe.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full btn-primary"
            disabled={chargement}
          >
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-primary-600 hover:text-primary-700 font-medium">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
