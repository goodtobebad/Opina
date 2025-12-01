import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface FormData {
  titre: string;
  description: string;
  date_debut: string;
  heure_debut: string;
  date_fin: string;
  heure_fin: string;
}

export default function ModifierSondage() {
  const { id } = useParams();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(true);
  const [enCoursModification, setEnCoursModification] = useState(false);

  const getMinDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMinTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const minDate = getMinDate();
  const minTime = getMinTime();
  const dateDebut = watch('date_debut');

  useEffect(() => {
    chargerSondage();
  }, [id]);

  const chargerSondage = async () => {
    try {
      const response = await api.get(`/sondages/${id}`);
      const sondage = response.data.sondage;

      // Vérifier si le sondage a déjà commencé
      if (new Date(sondage.date_debut) <= new Date()) {
        toast.error('Ce sondage a déjà commencé et ne peut plus être modifié');
        navigate('/admin/gerer-sondages');
        return;
      }

      const dateDebut = new Date(sondage.date_debut);
      const dateFin = new Date(sondage.date_fin);

      setValue('titre', sondage.titre);
      setValue('description', sondage.description || '');
      setValue('date_debut', dateDebut.toISOString().split('T')[0]);
      setValue('heure_debut', dateDebut.toTimeString().slice(0, 5));
      setValue('date_fin', dateFin.toISOString().split('T')[0]);
      setValue('heure_fin', dateFin.toTimeString().slice(0, 5));
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors du chargement du sondage');
      navigate('/admin/gerer-sondages');
    } finally {
      setChargement(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    const dateDebut = new Date(`${data.date_debut}T${data.heure_debut}`);
    const dateFin = new Date(`${data.date_fin}T${data.heure_fin}`);
    const maintenant = new Date();

    if (dateDebut < maintenant) {
      toast.error('La date et heure de début ne peuvent pas être dans le passé');
      return;
    }

    if (dateFin <= dateDebut) {
      toast.error('La date de fin doit être après la date de début');
      return;
    }

    setEnCoursModification(true);
    try {
      await api.put(`/sondages/${id}`, {
        titre: data.titre,
        description: data.description || null,
        date_debut: dateDebut.toISOString(),
        date_fin: dateFin.toISOString()
      });

      toast.success('Sondage modifié avec succès !');
      navigate('/admin/gerer-sondages');
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors de la modification du sondage');
    } finally {
      setEnCoursModification(false);
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
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">Modifier le sondage</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
              Titre du sondage *
            </label>
            <input
              id="titre"
              type="text"
              {...register('titre', {
                required: 'Le titre est requis'
              })}
              className="input-field"
              disabled={enCoursModification}
            />
            {errors.titre && (
              <p className="text-red-600 text-sm mt-1">{errors.titre.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-500">(optionnel)</span>
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="input-field"
              disabled={enCoursModification}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                id="date_debut"
                type="date"
                min={minDate}
                {...register('date_debut', {
                  required: 'La date de début est requise'
                })}
                className="input-field"
                disabled={enCoursModification}
              />
              {errors.date_debut && (
                <p className="text-red-600 text-sm mt-1">{errors.date_debut.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="heure_debut" className="block text-sm font-medium text-gray-700 mb-1">
                Heure de début *
              </label>
              <input
                id="heure_debut"
                type="time"
                min={dateDebut === minDate ? minTime : undefined}
                {...register('heure_debut', {
                  required: 'L\'heure de début est requise'
                })}
                className="input-field"
                disabled={enCoursModification}
              />
              {errors.heure_debut && (
                <p className="text-red-600 text-sm mt-1">{errors.heure_debut.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin *
              </label>
              <input
                id="date_fin"
                type="date"
                min={dateDebut || minDate}
                {...register('date_fin', {
                  required: 'La date de fin est requise'
                })}
                className="input-field"
                disabled={enCoursModification}
              />
              {errors.date_fin && (
                <p className="text-red-600 text-sm mt-1">{errors.date_fin.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="heure_fin" className="block text-sm font-medium text-gray-700 mb-1">
                Heure de fin *
              </label>
              <input
                id="heure_fin"
                type="time"
                {...register('heure_fin', {
                  required: 'L\'heure de fin est requise'
                })}
                className="input-field"
                disabled={enCoursModification}
              />
              {errors.heure_fin && (
                <p className="text-red-600 text-sm mt-1">{errors.heure_fin.message}</p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Les options du sondage ne peuvent pas être modifiées. 
              Seuls le titre, la description et les dates peuvent être mis à jour.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={enCoursModification}
            >
              {enCoursModification ? 'Modification en cours...' : 'Enregistrer les modifications'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/gerer-sondages')}
              className="btn-secondary"
              disabled={enCoursModification}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
