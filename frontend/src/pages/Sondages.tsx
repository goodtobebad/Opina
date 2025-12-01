import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  nom_createur: string;
  nombre_votes: number;
}

export default function Sondages() {
  const [sondages, setSondages] = useState<Sondage[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerSondages();
  }, []);

  const chargerSondages = async () => {
    try {
      const response = await api.get('/sondages/ouverts');
      setSondages(response.data.sondages);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des sondages');
    } finally {
      setChargement(false);
    }
  };

  const estOuvert = (dateDebut: string) => {
    return new Date(dateDebut) <= new Date();
  };

  const estAVenir = (dateDebut: string) => {
    return new Date(dateDebut) > new Date();
  };

  const sondagesOuverts = sondages.filter(s => estOuvert(s.date_debut));
  const sondagesAVenir = sondages.filter(s => estAVenir(s.date_debut));

  if (chargement) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600">Chargement des sondages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {sondages.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Aucun sondage disponible</h3>
          <p className="text-gray-600">
            Il n'y a actuellement aucun sondage disponible. Revenez plus tard !
          </p>
        </div>
      ) : (
        <>
          {/* Sondages ouverts */}
          {sondagesOuverts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Sondages ouverts</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sondagesOuverts.map((sondage) => (
                  <Link
                    key={sondage.id}
                    to={`/sondages/${sondage.id}`}
                    className="card hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                      {sondage.titre}
                    </h3>
                    {sondage.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {sondage.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="font-medium">Participants:</span>
                        <span className="ml-2">{sondage.nombre_votes}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Clôture:</span>
                        <span className="ml-2">
                          {format(new Date(sondage.date_fin), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 text-primary-600 font-medium">
                      Participer →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sondages à venir */}
          {sondagesAVenir.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Sondages à venir</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sondagesAVenir.map((sondage) => (
                  <div
                    key={sondage.id}
                    className="card opacity-75"
                  >
                    <div className="mb-2">
                      <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        À venir
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                      {sondage.titre}
                    </h3>
                    {sondage.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {sondage.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="font-medium">Ouverture:</span>
                        <span className="ml-2">
                          {format(new Date(sondage.date_debut), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Clôture:</span>
                        <span className="ml-2">
                          {format(new Date(sondage.date_fin), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 text-gray-400 font-medium">
                      Pas encore ouvert
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
