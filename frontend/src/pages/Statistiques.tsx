import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Statistique {
  id: number;
  texte: string;
  ordre: number;
  nombre_votes: string;
  pourcentage: string;
}

interface Sondage {
  id: number;
  titre: string;
  description?: string;
  date_debut: string;
  date_fin: string;
}

interface StatistiquesData {
  sondage: Sondage;
  total_votes: number;
  statistiques: Statistique[];
}

export default function Statistiques() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<StatistiquesData | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerStatistiques();
  }, [id]);

  const chargerStatistiques = async () => {
    try {
      const response = await api.get(`/statistiques/${id}`);
      setData(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors du chargement des statistiques');
      navigate('/admin/gerer-sondages');
    } finally {
      setChargement(false);
    }
  };

  if (chargement) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600">Chargement des statistiques...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const maxVotes = Math.max(...data.statistiques.map(s => parseInt(s.nombre_votes)));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/gerer-sondages')}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Retour à la gestion
        </button>
      </div>

      <div className="card">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{data.sondage.titre}</h1>
          {data.sondage.description && (
            <p className="text-gray-600 mb-4">{data.sondage.description}</p>
          )}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div>
              <span className="font-medium">Clôturé le:</span>{' '}
              {format(new Date(data.sondage.date_fin), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </div>
            <div>
              <span className="font-medium">Total de votes:</span>{' '}
              <span className="text-2xl font-bold text-primary-600">{data.total_votes}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Résultats</h2>
          
          {data.total_votes === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-gray-600">Aucun vote n'a été enregistré pour ce sondage</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.statistiques.map((stat) => (
                <div key={stat.id} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-medium">{stat.texte}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary-600">
                        {stat.pourcentage}%
                      </span>
                      <span className="text-sm text-gray-500">
                        ({stat.nombre_votes} vote{parseInt(stat.nombre_votes) > 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${stat.pourcentage}%` }}
                    />
                    {parseInt(stat.nombre_votes) === maxVotes && maxVotes > 0 && (
                      <div className="absolute top-0 left-0 h-full flex items-center justify-end pr-3 w-full">
                        <span className="text-xs font-semibold text-white drop-shadow">
                          🏆 Gagnant
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.total_votes > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Résumé</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card bg-blue-50">
                <div className="text-sm text-gray-600">Total de votes</div>
                <div className="text-2xl font-bold text-blue-600">{data.total_votes}</div>
              </div>
              <div className="card bg-green-50">
                <div className="text-sm text-gray-600">Option gagnante</div>
                <div className="text-lg font-bold text-green-600 truncate">
                  {data.statistiques.find(s => parseInt(s.nombre_votes) === maxVotes)?.texte || '-'}
                </div>
              </div>
              <div className="card bg-purple-50">
                <div className="text-sm text-gray-600">Score max</div>
                <div className="text-2xl font-bold text-purple-600">
                  {data.statistiques.find(s => parseInt(s.nombre_votes) === maxVotes)?.pourcentage || 0}%
                </div>
              </div>
              <div className="card bg-orange-50">
                <div className="text-sm text-gray-600">Nombre d'options</div>
                <div className="text-2xl font-bold text-orange-600">{data.statistiques.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
