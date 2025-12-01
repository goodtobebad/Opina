import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface FormData {
  titre: string;
  description: string;
  date_debut: string;
  heure_debut: string;
  date_fin: string;
  heure_fin: string;
  options: { texte: string }[];
}

export default function CreerSondage() {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      options: [{ texte: '' }, { texte: '' }]
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options'
  });
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(false);

  // Get minimum date (today) - update this to use useMemo or calculate inline
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

  // Watch date and time fields for validation
  const dateDebut = watch('date_debut');
  const heureDebut = watch('heure_debut');

  const onSubmit = async (data: FormData) => {
    // Validation: au moins 2 options non vides
    const optionsValides = data.options.filter(opt => opt.texte.trim());
    if (optionsValides.length < 2) {
      toast.error('Veuillez fournir au moins 2 options');
      return;
    }

    // Combiner date et heure
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

    setChargement(true);
    try {
      await api.post('/sondages', {
        titre: data.titre,
        description: data.description || null,
        date_debut: dateDebut.toISOString(),
        date_fin: dateFin.toISOString(),
        options: optionsValides.map(opt => opt.texte.trim())
      });

      toast.success('Sondage créé avec succès !');
      navigate('/sondages');
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors de la création du sondage');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">Créer un nouveau sondage</h1>

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
              disabled={chargement}
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
              disabled={chargement}
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
                disabled={chargement}
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
                disabled={chargement}
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
                disabled={chargement}
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
                disabled={chargement}
              />
              {errors.heure_fin && (
                <p className="text-red-600 text-sm mt-1">{errors.heure_fin.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Options du sondage * (minimum 2)
            </label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex space-x-2">
                  <input
                    type="text"
                    {...register(`options.${index}.texte` as const)}
                    className="input-field flex-1"
                    placeholder={`Option ${index + 1}`}
                    disabled={chargement}
                  />
                  {fields.length > 2 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      disabled={chargement}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => append({ texte: '' })}
              className="mt-3 btn-secondary"
              disabled={chargement}
            >
              + Ajouter une option
            </button>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={chargement}
            >
              {chargement ? 'Création en cours...' : 'Créer le sondage'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/sondages')}
              className="btn-secondary"
              disabled={chargement}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
