import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Vote {
  id: number;
  titre: string;
  option_choisie: string;
  date_vote: string;
  date_debut: string;
  date_fin: string;
  nombre_votes_total: number;
}

export default function Historique() {
  const [historique, setHistorique] = useState<Vote[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerHistorique();
  }, []);

  const chargerHistorique = async () => {
    try {
      const response = await api.get('/votes/historique');
      setHistorique(response.data.historique);
    } catch (error: any) {
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setChargement(false);
    }
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
        <div className="space-y-4">
          {historique.map((vote) => (
            <div key={vote.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{vote.titre}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Votre choix:</span>{' '}
                      <span className="text-primary-600 font-medium">{vote.option_choisie}</span>
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
                {new Date(vote.date_fin) < new Date() && (
                  <div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                      Terminé
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
