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
  nombre_votes?: string;
  pourcentage?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titre: string;
  description: string;
}

function DescriptionModal({ isOpen, onClose, titre, description }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-900">{titre}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
        </div>
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary w-full">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function TruncatedDescription({ description, titre }: { description: string; titre: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const maxLength = 100;
  const shouldTruncate = description.length > maxLength;
  const truncatedText = shouldTruncate ? description.substring(0, maxLength) + '...' : description;

  return (
    <>
      <div className="text-sm text-gray-600 mt-2 pl-3 border-l-2 border-gray-300">
        {truncatedText}
        {shouldTruncate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            Afficher plus
          </button>
        )}
      </div>
      <DescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        titre={titre}
        description={description}
      />
    </>
  );
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

  // Générer l'URL de partage
  const urlSondage = `${window.location.origin}/sondages/${id}`;
  
  const partagerSur = (plateforme: string) => {
    const titre = encodeURIComponent(sondage.titre);
    const url = encodeURIComponent(urlSondage);
    
    let urlPartage = '';
    
    switch (plateforme) {
      case 'twitter':
        urlPartage = `https://twitter.com/intent/tweet?text=${titre}&url=${url}`;
        break;
      case 'facebook':
        urlPartage = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        urlPartage = `https://wa.me/?text=${titre}%20${url}`;
        break;
      case 'linkedin':
        urlPartage = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'telegram':
        urlPartage = `https://t.me/share/url?url=${url}&text=${titre}`;
        break;
    }
    
    if (urlPartage) {
      window.open(urlPartage, '_blank', 'width=600,height=400');
    }
  };

  const copierLien = () => {
    navigator.clipboard.writeText(urlSondage);
    toast.success('Lien copié dans le presse-papier !');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">{sondage.titre}</h1>
        
        {sondage.description && (
          <p className="text-gray-600 mb-6">{sondage.description}</p>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6 text-sm text-gray-500">
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

          {/* Boutons de partage */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Partager:</span>
            <button
              onClick={() => partagerSur('twitter')}
              className="p-2 text-gray-600 hover:text-[#1DA1F2] hover:bg-blue-50 rounded-lg transition-colors"
              title="Partager sur Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </button>
            <button
              onClick={() => partagerSur('facebook')}
              className="p-2 text-gray-600 hover:text-[#1877F2] hover:bg-blue-50 rounded-lg transition-colors"
              title="Partager sur Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </button>
            <button
              onClick={() => partagerSur('whatsapp')}
              className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-green-50 rounded-lg transition-colors"
              title="Partager sur WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </button>
            <button
              onClick={() => partagerSur('linkedin')}
              className="p-2 text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
              title="Partager sur LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
            <button
              onClick={() => partagerSur('telegram')}
              className="p-2 text-gray-600 hover:text-[#0088cc] hover:bg-blue-50 rounded-lg transition-colors"
              title="Partager sur Telegram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </button>
            <button
              onClick={copierLien}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Copier le lien"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
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
                      <TruncatedDescription description={option.description} titre={option.texte} />
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
                  {estFerme ? 'Voici les résultats du sondage' : 'Les résultats seront disponibles après la clôture du sondage.'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                {estFerme ? 'Résultats:' : 'Votre choix:'}
              </h3>
              <div className="space-y-3">
                {sondage.options.map((option) => {
                  const estMonVote = sondage.vote?.id_option === option.id;
                  const maxVotes = estFerme && sondage.options.every((opt: Option) => opt.nombre_votes !== undefined)
                    ? Math.max(...sondage.options.map((opt: Option) => parseInt(opt.nombre_votes || '0')))
                    : 0;
                  const estGagnant = estFerme && parseInt(option.nombre_votes || '0') === maxVotes && maxVotes > 0;

                  return (
                    <div
                      key={option.id}
                      className={`p-4 border-2 rounded-lg ${
                        estMonVote
                          ? 'bg-green-50 border-green-500'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {estMonVote && (
                            <span className="text-green-600 font-bold text-lg">✓</span>
                          )}
                          <span className={`text-lg ${
                            estMonVote ? 'font-semibold text-green-800' : 'text-gray-900'
                          }`}>
                            {option.texte}
                          </span>
                          {estMonVote && (
                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                              Votre choix
                            </span>
                          )}
                          {estGagnant && (
                            <span className="text-lg">🏆</span>
                          )}
                        </div>
                        {estFerme && option.pourcentage !== undefined && (
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-primary-600">
                              {option.pourcentage}%
                            </span>
                            <span className="text-sm text-gray-500">
                              ({option.nombre_votes} vote{parseInt(option.nombre_votes || '0') > 1 ? 's' : ''})
                            </span>
                          </div>
                        )}
                      </div>
                      {estFerme && option.pourcentage !== undefined && (
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <div
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                              estMonVote
                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                : 'bg-gradient-to-r from-primary-500 to-primary-600'
                            }`}
                            style={{ width: `${option.pourcentage}%` }}
                          />
                        </div>
                      )}
                      {option.description && (
                        <TruncatedDescription description={option.description} titre={option.texte} />
                      )}
                    </div>
                  );
                })}
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
        ) : !utilisateur ? (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">🗳️</div>
            <h3 className="text-xl font-semibold text-primary-900 mb-3">
              Connectez-vous pour voter
            </h3>
            <p className="text-primary-700 mb-6">
              Vous devez être connecté pour participer à ce sondage.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/connexion', { state: { from: { pathname: `/sondages/${id}` } } })}
                className="btn-primary"
              >
                Se connecter
              </button>
              <button
                onClick={() => navigate('/inscription', { state: { from: { pathname: `/sondages/${id}` } } })}
                className="btn-secondary"
              >
                S'inscrire
              </button>
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
                          <TruncatedDescription description={option.description} titre={option.texte} />
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
