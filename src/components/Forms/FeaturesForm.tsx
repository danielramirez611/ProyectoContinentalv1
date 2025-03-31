import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconSelector } from "../common/IconSelector";
import {
  uploadFeatureMedia,
  createFeature,
  getFeatures,
  deleteFeature,
  getStats,
  addStat,
  deleteStat,
  getProjectExtras,
  addProjectExtra,
  deleteProjectExtra,
  updateFeature,
  updateStat,
  updateProjectExtra,
} from "../../../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faEdit,
  faTrophy,
  faStar,
  faTimes,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";

interface Feature {
  id?: number;
  icon_key: string;
  title: string;
  subtitle: string;
  media_type: "video";
  media_url?: string;
}

interface Stat {
  id?: number;
  icon_key: string;
  title: string;
  description: string;
  text: string;
}

interface Extra {
  id?: number;
  title: string;
  stat?: string;
  description?: string;
}

interface FeaturesFormProps {
  projectId?: number;
}

const iconMap: Record<string, any> = {
  FiZap: faStar, // 🔹 Mapea correctamente FiZap a faStar
  Chart: faChartBar,
  Trophy: faTrophy,
};

const FeaturesForm = ({ projectId }: FeaturesFormProps) => {
  const params = useParams<{ id?: string }>();
  const paramProjectId = params.id ? Number(params.id) : undefined;
  const finalProjectId = projectId ?? paramProjectId;

  if (!finalProjectId || isNaN(finalProjectId)) {
    console.error("❌ Error: projectId no fue recibido o no es válido.", {
      finalProjectId,
    });
    return (
      <div className="text-red-500 font-bold p-4 border border-red-600 rounded-lg bg-red-100">
        ❌ Error: No se pudo cargar la configuración del proyecto. Verifica la
        URL o selecciona un proyecto válido.
      </div>
    );
  }

  const [features, setFeatures] = useState<Feature[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({});
  const [newStat, setNewStat] = useState<Partial<Stat>>({});
  const [newExtra, setNewExtra] = useState<Partial<Extra>>({});
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(
    null
  );
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [activeTab, setActiveTab] = useState("features");
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const isEditingFeature = !!editingFeature;
  const isEditingStat = !!editingStat;
  const isEditingExtra = !!editingExtra;

  useEffect(() => {
    fetchFeatures();
    fetchStats();
    fetchExtras();
  }, [finalProjectId]);

  const fetchFeatures = async () => {
    try {
      const data = await getFeatures(finalProjectId);
      setFeatures(data);
    } catch (error) {
      console.error("❌ Error al obtener features:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getStats(finalProjectId);
      setStats(data);
    } catch (error) {
      console.error("❌ Error al obtener stats:", error);
    }
  };

  const fetchExtras = async () => {
    try {
      const data = await getProjectExtras(finalProjectId);
      setExtras(data);
    } catch (error) {
      console.error("❌ Error al obtener extras:", error);
    }
  };

  const handleAddFeature = async () => {
    if (!newFeature.title || !newFeature.media_type) {
      alert("El título y el tipo de media son obligatorios.");
      return;
    }

    try {
      let mediaUrl = null;
      if (newFeature.media_type && newFeature.media_file) {
        mediaUrl = await uploadFeatureMedia(
          newFeature.media_file,
          newFeature.media_type,
          ""
        );
      }

      if (!mediaUrl) {
        console.error("❌ No se pudo obtener la URL del archivo subido.");
        alert("Hubo un problema al subir el archivo.");
        return;
      }

      const featureData = {
        project_id: finalProjectId,
        title: newFeature.title,
        subtitle: newFeature.subtitle ?? "",
        icon_key: newFeature.icon_key ?? "",
        media_type: newFeature.media_type,
        media_url: mediaUrl,
      };

      const savedFeature = await createFeature(
        finalProjectId,
        featureData,
        newFeature.media_file,
        ""
      );

      // Actualizar el estado local directamente
      setFeatures((prevFeatures) => [...prevFeatures, savedFeature]);

      setShowFeatureModal(false);
      setNewFeature({});
    } catch (error) {
      console.error("❌ Error al agregar feature:", error);
    }
  };

  const handleAddStat = async () => {
    if (
      !newStat.icon_key ||
      !newStat.title ||
      !newStat.description ||
      !newStat.text
    ) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const savedStat = await addStat(finalProjectId, newStat, "");

      // Actualizar el estado local directamente
      setStats((prevStats) => [...prevStats, savedStat]);

      setShowStatModal(false);
      setNewStat({});
    } catch (error) {
      console.error("❌ Error al agregar stat:", error);
    }
  };

  const handleDeleteStat = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar esta estadística?")) {
      try {
        await deleteStat(id);

        // Actualizar el estado local directamente
        setStats((prevStats) => prevStats.filter((stat) => stat.id !== id));
      } catch (error) {
        console.error("❌ Error al eliminar stat:", error);
      }
    }
  };

  const handleDeleteFeature = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar esta característica?")) {
      try {
        await deleteFeature(id);

        // Actualizar el estado local directamente
        setFeatures((prevFeatures) =>
          prevFeatures.filter((feature) => feature.id !== id)
        );
      } catch (error) {
        console.error("❌ Error al eliminar feature:", error);
      }
    }
  };

  const handleEditStat = async (updatedStat: Stat) => {
    if (!updatedStat.id) return;

    try {
      const updatedStatResponse = await updateStat(updatedStat.id, updatedStat);

      // Actualizar el estado local directamente
      setStats((prevStats) =>
        prevStats.map((stat) =>
          stat.id === updatedStat.id ? updatedStatResponse : stat
        )
      );

      setShowStatModal(false);
      setNewStat({});
    } catch (error) {
      console.error("❌ Error al editar stat:", error);
      alert("Ocurrió un error al editar la estadística.");
    }
  };

  const handleEditFeature = async (updatedFeature: Feature) => {
    if (!updatedFeature.id) return;

    try {
      const updatedFeatureResponse = await updateFeature(
        updatedFeature.id,
        updatedFeature
      );

      // Actualizar el estado local directamente
      setFeatures((prevFeatures) =>
        prevFeatures.map((feature) =>
          feature.id === updatedFeature.id ? updatedFeatureResponse : feature
        )
      );

      setShowFeatureModal(false);
      setNewFeature({});
    } catch (error) {
      console.error("❌ Error al editar feature:", error);
      alert("Ocurrió un error al editar la característica.");
    }
  };

  const handleEditExtra = async (updatedExtra: Extra) => {
    if (!updatedExtra.id) return;

    try {
      await updateProjectExtra(updatedExtra.id, updatedExtra);
      fetchExtras();
      setShowExtraModal(false);
      setNewExtra({});
    } catch (error) {
      console.error("❌ Error al editar extra:", error);
      alert("Ocurrió un error al editar el extra.");
    }
  };

  const handleDeleteExtra = async (extraId: number) => {
    if (!extraId) return;

    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar este extra?"
    );
    if (!confirm) return;

    try {
      await deleteProjectExtra(extraId);
      fetchExtras();
    } catch (error) {
      console.error("❌ Error al eliminar extra:", error);
      alert("Ocurrió un error al eliminar el extra.");
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Pestañas */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("features")}
          className={`px-4 py-2 text-lg ${
            activeTab === "features"
              ? "border-b-2 border-purple-500 text-purple-500"
              : "text-gray-500"
          }`}
        >
          Características
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 text-lg ${
            activeTab === "stats"
              ? "border-b-2 border-purple-500 text-purple-500"
              : "text-gray-500"
          }`}
        >
          Estadísticas
        </button>
      </div>

      {/* Estadísticas */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <button
            onClick={() => setShowStatModal(true)}
            className="w-full p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Estadística
          </button>

          <AnimatePresence>
            {stats.length === 0 ? (
              <p className="text-gray-500">No hay estadísticas registradas.</p>
            ) : (
              stats.map((stat) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center space-x-4 p-3 border-b last:border-b-0"
                >
                  <FontAwesomeIcon
                    icon={iconMap[stat.icon_key] || faChartBar}
                    className="text-3xl text-primary"
                  />
                  <div>
                    <h5 className="font-semibold text-gray-900">
                      {stat.title}
                    </h5>
                    <p className="text-gray-700">{stat.text}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setEditingStat(stat);
                        setNewStat(stat);
                        setShowStatModal(true);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDeleteStat(stat.id!)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Características */}
      {activeTab === "features" && (
        <div className="space-y-6">
          <button
            onClick={() => setShowFeatureModal(true)}
            className="w-full p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Característica
          </button>

          <AnimatePresence>
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.subtitle}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingFeature(feature);
                        setNewFeature(feature);
                        setShowFeatureModal(true);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDeleteFeature(feature.id!)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal para agregar Característica */}
      {/* Modal para agregar Característica */}
      {showFeatureModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex text-lg items-center justify-center p-4 z-50"
          onClick={() => setShowFeatureModal(false)}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cierre */}
            <button
              onClick={() => setShowFeatureModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
            </button>

            {/* Título del modal */}
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {isEditingFeature
                ? "Editar Característica"
                : "Agregar Nueva Característica"}
            </h3>

            {/* Campos del formulario */}
            <div className="space-y-4">
              <input
                placeholder="Título"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent transition-all"
                value={newFeature.title || ""}
                onChange={(e) =>
                  setNewFeature({ ...newFeature, title: e.target.value })
                }
              />
              <input
                placeholder="Subtítulo"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent transition-all"
                value={newFeature.subtitle || ""}
                onChange={(e) =>
                  setNewFeature({ ...newFeature, subtitle: e.target.value })
                }
              />
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const isVideo = file.type.startsWith("video/");
                    setNewFeature({
                      ...newFeature,
                      media_file: file,
                      media_type: isVideo ? "video" : "image",
                    });
                  }
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {newFeature.media_url && newFeature.media_type === "image" && (
                <img
                  src={newFeature.media_url}
                  alt="Vista previa"
                  className="mt-2 w-full h-auto rounded-lg"
                />
              )}
              {newFeature.media_url && newFeature.media_type === "video" && (
                <video
                  src={newFeature.media_url}
                  controls
                  className="mt-2 w-full h-auto rounded-lg"
                />
              )}
            </div>

            {/* Botón de acción */}
            <button
              onClick={
                isEditingFeature
                  ? () => handleEditFeature(newFeature as Feature)
                  : handleAddFeature
              }
              className="w-full mt-6 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              {isEditingFeature ? "Guardar Cambios" : "Agregar Característica"}
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Modal para agregar Extra */}
      {showExtraModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex text-lg items-center justify-center p-4 z-50"
          onClick={() => setShowExtraModal(false)}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowExtraModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900">
              {editingExtra ? "Editar Extra" : "Agregar Nuevo Extra"}
            </h3>
            <input
              placeholder="Título"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-0 focus:ring-primario focus:border-transparent"
              value={newExtra.title || ""}
              onChange={(e) =>
                setNewExtra({ ...newExtra, title: e.target.value })
              }
            />
            <textarea
              placeholder="Descripción"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-0 focus:ring-primario focus:border-transparent"
              value={newExtra.description || ""}
              onChange={(e) =>
                setNewExtra({ ...newExtra, description: e.target.value })
              }
            />
            <input
              placeholder="Stat (opcional)"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-0 focus:ring-primario focus:border-transparent"
              value={newExtra.stat || ""}
              onChange={(e) =>
                setNewExtra({ ...newExtra, stat: e.target.value })
              }
            />
            <button
              onClick={
                editingExtra
                  ? () => handleEditExtra(newExtra as Extra)
                  : handleAddExtra
              }
              className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {editingExtra ? "Guardar Cambios" : "Agregar"}
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Modal para agregar Estadística */}
      {showStatModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex text-lg items-center justify-center p-4 z-50"
          onClick={() => setShowStatModal(false)}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStatModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900">
              {editingStat ? "Editar Estadística" : "Agregar Nueva Estadística"}
            </h3>
            <IconSelector
              selected={newStat.icon_key}
              onSelect={(icon) => setNewStat({ ...newStat, icon_key: icon })}
            />
            <input
              placeholder="Título"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-0 focus:ring-primario focus:border-transparent"
              value={newStat.title || ""}
              onChange={(e) =>
                setNewStat({ ...newStat, title: e.target.value })
              }
            />
            <textarea
              placeholder="Descripción"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-0 focus:ring-primario focus:border-transparent"
              value={newStat.description || ""}
              onChange={(e) =>
                setNewStat({ ...newStat, description: e.target.value })
              }
            />
            <input
              placeholder="Texto"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-0 focus:ring-primario focus:border-transparent"
              value={newStat.text || ""}
              onChange={(e) => setNewStat({ ...newStat, text: e.target.value })}
            />
            <button
              onClick={
                editingStat
                  ? () => handleEditStat(newStat as Stat)
                  : handleAddStat
              }
              className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {editingStat ? "Guardar Cambios" : "Agregar"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FeaturesForm;
