import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Option {
  id: number;
  texte: string;
  description?: string;
  ordre: number;
}

interface Sondage {
  id: number;
  titre: string;
  description?: string;
  date_debut: string;
  date_fin: string;
  nom_createur: string;
  nombre_votes: number;
  options: Option[];
  a_vote: boolean;
  vote?: any;
}

export default function DetailSondage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const [sondage, setSondage] = useState<Sondage | null>(null);
  const [chargement, setChargement] = useState(true);
  const [optionSelectionnee, setOptionSelectionnee] = useState<number | null>(null);
  const [typeValidation, setTypeValidation] = useState<'email' | 'sms'>('email');
  const [enCoursDeVote, setEnCoursDeVote] = useState(false);
  const [voteEnAttente, setVoteEnAttente] = useState<number | null>(null);
  const [codeValidation, setCodeValidation] = useState('');

  useEffect(() => {
    chargerSondage();
  }, [id]);

  const chargerSondage = async () => {
    try {
      const response = await api.get(`/sondages/${id}`);
      setSondage(response.data.sondage);
    } catch (error: any) {
      toast.error('Erreur lors du chargement du sondage');
      navigate('/sondages');
    } finally {
      setChargement(false);
    }
  };

  const soumettreVote = async () => {
    if (!utilisateur) {
      toast.error('Vous devez être connecté pour voter');
      navigate('/connexion');
      return;
    }

    if (utilisateur.est_admin) {
      toast.error('Les administrateurs ne peuvent pas voter');
      return;
    }

    if (!optionSelectionnee) {
      toast.error('Veuillez sélectionner une option');
      return;
    }

    setEnCoursDeVote(true);
    try {
      const response = await api.post('/votes', {
        id_sondage: parseInt(id!),
        id_option: optionSelectionnee,
        type_validation: typeValidation
      });

      setVoteEnAttente(response.data.id_vote);
      
      // Show the validation code in development mode
      if (response.data.code_validation) {
        toast.success(`Code de validation: ${response.data.code_validation} (mode développement)`, {
          duration: 10000
        });
      } else {
        toast.success(`Code de validation envoyé par ${typeValidation === 'email' ? 'email' : 'SMS'}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors du vote');
    } finally {
      setEnCoursDeVote(false);
    }
  };

  const validerVote = async () => {
    if (!codeValidation) {
      toast.error('Veuillez entrer le code de validation');
      return;
    }

    try {
      await api.post('/votes/valider', {
        id_vote: voteEnAttente,
        code: codeValidation
      });

      toast.success('Vote validé avec succès !');
      navigate('/historique');
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Code invalide');
    }
  };

  if (chargement) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!sondage) {
    return null;
  }

  const estOuvert = new Date(sondage.date_debut) <= new Date();
  const estFerme = new Date(sondage.date_fin) <= new Date();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">{sondage.titre}</h1>
        
        {sondage.description && (
          <p className="text-gray-600 mb-6">{sondage.description}</p>
        )}

        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8">
          {estOuvert && (
            <div>
              <span className="font-medium">Participants:</span> {sondage.nombre_votes}
            </div>
          )}
          {!estOuvert && (
            <div>
              <span className="font-medium">Ouverture:</span>{' '}
              {format(new Date(sondage.date_debut), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </div>
          )}
          <div>
            <span className="font-medium">Clôture:</span>{' '}
            {format(new Date(sondage.date_fin), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </div>
        </div>

        {!estOuvert ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🕐</div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Sondage pas encore ouvert
            </h3>
            <p className="text-blue-700">
              Ce sondage ouvrira le {format(new Date(sondage.date_debut), 'dd MMMM yyyy à HH:mm', { locale: fr })}.
            </p>
            <p className="text-blue-600 text-sm mt-2">
              Revenez à cette date pour participer !
            </p>
          </div>
        ) : estFerme ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Sondage clôturé
            </h3>
            <p className="text-gray-700">
              Ce sondage est terminé. Les votes ne sont plus acceptés.
            </p>
          </div>
        ) : utilisateur?.est_admin ? (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">👨‍💼</div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  Vue administrateur
                </h3>
                <p className="text-orange-700">
                  Vous consultez ce sondage en tant qu'administrateur. Les administrateurs ne peuvent pas voter.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Options du sondage:</h3>
              <div className="space-y-3">
                {sondage.options.map((option) => (
                  <div
                    key={option.id}
                    className="p-4 border-2 rounded-lg bg-gray-50 border-gray-200"
                  >
                    <div className="text-lg font-medium text-gray-900 mb-1">
                      {option.texte}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-2 pl-3 border-l-2 border-gray-300">
                        {option.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : sondage.a_vote ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Vous avez déjà voté
                </h3>
                <p className="text-green-700">
                  Les résultats seront disponibles après la clôture du sondage.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Votre choix:</h3>
              <div className="space-y-3">
                {sondage.options.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 border-2 rounded-lg ${
                      sondage.vote?.id_option === option.id
                        ? 'bg-green-50 border-green-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {sondage.vote?.id_option === option.id && (
                        <span className="mr-3 text-green-600 font-bold">✓</span>
                      )}
                      <span className={`text-lg ${
                        sondage.vote?.id_option === option.id ? 'font-semibold text-green-800' : 'text-gray-500'
                      }`}>
                        {option.texte}
                      </span>
                    </div>
                    {option.description && (
                      <div className={`text-sm mt-2 pl-3 border-l-2 ${
                        sondage.vote?.id_option === option.id
                          ? 'text-green-700 border-green-300'
                          : 'text-gray-600 border-gray-300'
                      }`}>
                        {option.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : voteEnAttente ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Validez votre vote
              </h3>
              <p className="text-blue-800 mb-4">
                Un code de validation a été envoyé par {typeValidation === 'email' ? 'email' : 'SMS'}.
                Veuillez entrer le code ci-dessous.
              </p>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Code à 6 chiffres"
                  value={codeValidation}
                  onChange={(e) => setCodeValidation(e.target.value)}
                  className="input-field flex-1"
                  maxLength={6}
                />
                <button onClick={validerVote} className="btn-primary">
                  Valider
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choisissez une option:</h3>
              <div className="space-y-3">
                {sondage.options.map((option) => (
                  <label
                    key={option.id}
                    className="block p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: optionSelectionnee === option.id ? '#2563eb' : '#e5e7eb'
                    }}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="option"
                        value={option.id}
                        checked={optionSelectionnee === option.id}
                        onChange={() => setOptionSelectionnee(option.id)}
                        className="mr-3 h-5 w-5 text-primary-600 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-lg font-medium">{option.texte}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600 mt-2 pl-3 border-l-2 border-gray-300">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Méthode de validation:</h3>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type_validation"
                    value="email"
                    checked={typeValidation === 'email'}
                    onChange={() => setTypeValidation('email')}
                    className="mr-2 h-4 w-4 text-primary-600"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type_validation"
                    value="sms"
                    checked={typeValidation === 'sms'}
                    onChange={() => setTypeValidation('sms')}
                    className="mr-2 h-4 w-4 text-primary-600"
                  />
                  <span>SMS</span>
                </label>
              </div>
            </div>

            <button
              onClick={soumettreVote}
              disabled={!optionSelectionnee || enCoursDeVote}
              className="w-full btn-primary"
            >
              {enCoursDeVote ? 'Envoi en cours...' : 'Voter'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
