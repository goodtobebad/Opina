import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Categorie {
  id: number;
  nom: string;
  description: string;
  couleur: string;
  date_creation: string;
}

export default function GererCategories() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [chargement, setChargement] = useState(true);
  const [modeEdition, setModeEdition] = useState<number | null>(null);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  
  const [formulaire, setFormulaire] = useState({
    nom: '',
    description: '',
    couleur: '#3B82F6'
  });

  useEffect(() => {
    if (!utilisateur?.est_admin) {
      navigate('/');
      return;
    }
    chargerCategories();
  }, [utilisateur, navigate]);

  const chargerCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setChargement(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formulaire.nom.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    try {
      if (modeEdition) {
        await api.put(`/categories/${modeEdition}`, formulaire);
        toast.success('Catégorie modifiée avec succès');
      } else {
        await api.post('/categories', formulaire);
        toast.success('Catégorie créée avec succès');
      }
      
      setFormulaire({ nom: '', description: '', couleur: '#3B82F6' });
      setModeEdition(null);
      setAfficherFormulaire(false);
      chargerCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors de l\'opération');
    }
  };

  const handleEditer = (categorie: Categorie) => {
    setFormulaire({
      nom: categorie.nom,
      description: categorie.description || '',
      couleur: categorie.couleur
    });
    setModeEdition(categorie.id);
    setAfficherFormulaire(true);
  };

  const handleSupprimer = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      await api.delete(`/categories/${id}`);
      toast.success('Catégorie supprimée avec succès');
      chargerCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.erreur || 'Erreur lors de la suppression');
    }
  };

  const handleAnnuler = () => {
    setFormulaire({ nom: '', description: '', couleur: '#3B82F6' });
    setModeEdition(null);
    setAfficherFormulaire(false);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gérer les catégories</h1>
        {!afficherFormulaire && (
          <button
            onClick={() => setAfficherFormulaire(true)}
            className="btn-primary"
          >
            + Nouvelle catégorie
          </button>
        )}
      </div>

      {afficherFormulaire && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {modeEdition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                value={formulaire.nom}
                onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })}
                className="input-field"
                placeholder="Ex: Politique, Sport..."
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formulaire.description}
                onChange={(e) => setFormulaire({ ...formulaire, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Description de la catégorie..."
              />
            </div>

            <div>
              <label htmlFor="couleur" className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="couleur"
                  value={formulaire.couleur}
                  onChange={(e) => setFormulaire({ ...formulaire, couleur: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formulaire.couleur}
                  onChange={(e) => setFormulaire({ ...formulaire, couleur: e.target.value })}
                  className="input-field flex-1"
                  placeholder="#3B82F6"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {modeEdition ? 'Modifier' : 'Créer'}
              </button>
              <button type="button" onClick={handleAnnuler} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((categorie) => (
          <div key={categorie.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: categorie.couleur }}
                />
                <h3 className="text-lg font-semibold">{categorie.nom}</h3>
              </div>
            </div>
            
            {categorie.description && (
              <p className="text-gray-600 text-sm mb-4">{categorie.description}</p>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEditer(categorie)}
                className="btn-secondary flex-1 text-sm"
              >
                Modifier
              </button>
              <button
                onClick={() => handleSupprimer(categorie.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-1 text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !afficherFormulaire && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="text-xl font-semibold mb-2">Aucune catégorie</h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre première catégorie
          </p>
        </div>
      )}
    </div>
  );
}
