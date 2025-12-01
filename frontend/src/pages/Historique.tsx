import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, getYear, getMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Option {
  id: number;
  texte: string;
  description?: string;
  ordre: number;
  nombre_votes: string;
  pourcentage: string;
}

interface Vote {
  id: number;
  id_sondage: number;
  titre: string;
  option_votee_id: number;
  date_vote: string;
  date_debut: string;
  date_fin: string;
  nombre_votes_total: number;
  options: Option[];
}

const moisNoms = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function Historique() {
  const [historique, setHistorique] = useState<Vote[]>([]);
  const [historiqueFiltré, setHistoriqueFiltré] = useState<Vote[]>([]);
  const [chargement, setChargement] = useState(true);
  const [annéeSélectionnée, setAnnéeSélectionnée] = useState<string>('all');
  const [moisSélectionné, setMoisSélectionné] = useState<string>('all');
  const [annéesDisponibles, setAnnéesDisponibles] = useState<number[]>([]);

  useEffect(() => {
    chargerHistorique();
  }, []);

  useEffect(() => {
    filtrerHistorique();
  }, [historique, annéeSélectionnée, moisSélectionné]);

  const chargerHistorique = async () => {
    try {
      const response = await api.get('/votes/historique');
      const votes = response.data.historique;
      setHistorique(votes);
      
      // Extraire les années disponibles
      const années = [...new Set(votes.map((vote: Vote) => getYear(new Date(vote.date_vote))))];
      setAnnéesDisponibles(années.sort((a, b) => b - a));
    } catch (error: any) {
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setChargement(false);
    }
  };

  const filtrerHistorique = () => {
    let résultat = [...historique];

    if (annéeSélectionnée !== 'all') {
      const année = parseInt(annéeSélectionnée);
      résultat = résultat.filter(vote => getYear(new Date(vote.date_vote)) === année);

      if (moisSélectionné !== 'all') {
        const mois = parseInt(moisSélectionné);
        résultat = résultat.filter(vote => getMonth(new Date(vote.date_vote)) === mois);
      }
    }

    setHistoriqueFiltré(résultat);
  };

  const réinitialiserFiltres = () => {
    setAnnéeSélectionnée('all');
    setMoisSélectionné('all');
  };

  if (chargement) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Historique de mes votes</h1>

      {historique.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">Aucun vote dans l'historique</h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez participé à aucun sondage pour le moment.
          </p>
          <Link to="/sondages" className="btn-primary">
            Voir les sondages disponibles
          </Link>
        </div>
      ) : (
        <>
          {/* Filtres */}
          <div className="card mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="année" className="block text-sm font-medium text-gray-700 mb-1">
                  Année
                </label>
                <select
                  id="année"
                  value={annéeSélectionnée}
                  onChange={(e) => {
                    setAnnéeSélectionnée(e.target.value);
                    setMoisSélectionné('all'); // Réinitialiser le mois quand on change d'année
                  }}
                  className="input-field"
                >
                  <option value="all">Toutes les années</option>
                  {annéesDisponibles.map(année => (
                    <option key={année} value={année}>{année}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label htmlFor="mois" className="block text-sm font-medium text-gray-700 mb-1">
                  Mois
                </label>
                <select
                  id="mois"
                  value={moisSélectionné}
                  onChange={(e) => setMoisSélectionné(e.target.value)}
                  className="input-field"
                  disabled={annéeSélectionnée === 'all'}
                >
                  <option value="all">Tous les mois</option>
                  {moisNoms.map((nom, index) => (
                    <option key={index} value={index}>{nom}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={réinitialiserFiltres}
                  className="btn-secondary"
                >
                  Réinitialiser
                </button>
                <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-lg">
                  {historiqueFiltré.length} résultat{historiqueFiltré.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Liste des votes */}
          {historiqueFiltré.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
              <p className="text-gray-600 mb-4">
                Aucun vote trouvé pour les critères sélectionnés.
              </p>
              <button onClick={réinitialiserFiltres} className="btn-secondary">
                Voir tous les votes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {historiqueFiltré.map((vote) => {
            const estTermine = new Date(vote.date_fin) < new Date();
            const optionVotee = vote.options.find(opt => opt.id === vote.option_votee_id);

            return (
              <div key={vote.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{vote.titre}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Votre choix:</span>{' '}
                        <span className="text-primary-600 font-medium">{optionVotee?.texte}</span>
                      </div>
                      <div>
                        <span className="font-medium">Date du vote:</span>{' '}
                        {format(new Date(vote.date_vote), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </div>
                      <div>
                        <span className="font-medium">Participants totaux:</span> {vote.nombre_votes_total}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {estTermine && (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                        Terminé
                      </span>
                    )}
                    <Link 
                      to={`/sondages/${vote.id_sondage}`}
                      className="btn-primary text-sm"
                    >
                      Voir les résultats
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
          )}
        </>
      )}
    </div>
  );
}
