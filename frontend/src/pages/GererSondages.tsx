import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Sondage {
  id: number;
  titre: string;
  description?: string;
  date_debut: string;
  date_fin: string;
  nombre_votes: number;
}

export default function GererSondages() {
  const [sondages, setSondages] = useState<Sondage[]>([]);
  const [chargement, setChargement] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    chargerSondages();
  }, []);

  const chargerSondages = async () => {
    try {
      const response = await api.get('/sondages');
      setSondages(response.data.sondages);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des sondages');
    } finally {
      setChargement(false);
    }
  };

  const supprimerSondage = async (id: number, titre: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le sondage "${titre}" ?`)) {
      return;
    }

    try {
      await api.delete(`/sondages/${id}`);
      toast.success('Sondage supprimé avec succès');
      chargerSondages();
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors de la suppression');
    }
  };

  const estAVenir = (dateDebut: string) => {
    return new Date(dateDebut) > new Date();
  };

  const estOuvert = (dateDebut: string, dateFin: string) => {
    const maintenant = new Date();
    return new Date(dateDebut) <= maintenant && new Date(dateFin) > maintenant;
  };

  const estTermine = (dateFin: string) => {
    return new Date(dateFin) <= new Date();
  };

  const sondagesAVenir = sondages.filter(s => estAVenir(s.date_debut));
  const sondagesOuverts = sondages.filter(s => estOuvert(s.date_debut, s.date_fin));
  const sondagesTermines = sondages.filter(s => estTermine(s.date_fin));

  if (chargement) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gérer les sondages</h1>
        <Link to="/admin/creer-sondage" className="btn-primary">
          + Créer un sondage
        </Link>
      </div>

      {sondages.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Aucun sondage créé</h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre premier sondage
          </p>
          <Link to="/admin/creer-sondage" className="btn-primary">
            Créer un sondage
          </Link>
        </div>
      ) : (
        <>
          {/* Sondages à venir */}
          {sondagesAVenir.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">À venir ({sondagesAVenir.length})</h2>
              <div className="space-y-4">
                {sondagesAVenir.map((sondage) => (
                  <div key={sondage.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{sondage.titre}</h3>
                          <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            À venir
                          </span>
                        </div>
                        {sondage.description && (
                          <p className="text-gray-600 mb-3">{sondage.description}</p>
                        )}
                        <div className="space-y-1 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Ouverture:</span>{' '}
                            {format(new Date(sondage.date_debut), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </div>
                          <div>
                            <span className="font-medium">Clôture:</span>{' '}
                            {format(new Date(sondage.date_fin), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => navigate(`/admin/modifier-sondage/${sondage.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => supprimerSondage(sondage.id, sondage.titre)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sondages ouverts */}
          {sondagesOuverts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">En cours ({sondagesOuverts.length})</h2>
              <div className="space-y-4">
                {sondagesOuverts.map((sondage) => (
                  <div key={sondage.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{sondage.titre}</h3>
                          <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            En cours
                          </span>
                        </div>
                        {sondage.description && (
                          <p className="text-gray-600 mb-3">{sondage.description}</p>
                        )}
                        <div className="space-y-1 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Participants:</span> {sondage.nombre_votes}
                          </div>
                          <div>
                            <span className="font-medium">Clôture:</span>{' '}
                            {format(new Date(sondage.date_fin), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link
                          to={`/sondages/${sondage.id}`}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Voir
                        </Link>
                        <button
                          onClick={() => supprimerSondage(sondage.id, sondage.titre)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sondages terminés */}
          {sondagesTermines.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Terminés ({sondagesTermines.length})</h2>
              <div className="space-y-4">
                {sondagesTermines.map((sondage) => (
                  <div key={sondage.id} className="card opacity-75">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{sondage.titre}</h3>
                          <span className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                            Terminé
                          </span>
                        </div>
                        {sondage.description && (
                          <p className="text-gray-600 mb-3">{sondage.description}</p>
                        )}
                        <div className="space-y-1 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Participants:</span> {sondage.nombre_votes}
                          </div>
                          <div>
                            <span className="font-medium">Clôturé le:</span>{' '}
                            {format(new Date(sondage.date_fin), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link
                          to={`/admin/statistiques/${sondage.id}`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Statistiques
                        </Link>
                        <button
                          onClick={() => supprimerSondage(sondage.id, sondage.titre)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
