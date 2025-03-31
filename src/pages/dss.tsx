import React, { useState } from "react";
import { IconSelector } from "../common/IconSelector";
import { ProjectData } from "../../data/project";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface Feature {
  icon: any;
  title: string;
  description: string;
  stat: string;
}

interface Stat {
  icon: any;
  text: string;
}

interface FeaturesFormProps {
  project: ProjectData;
  setProject: (data: ProjectData) => void;
}

const FeaturesForm = ({ project, setProject }: FeaturesFormProps) => {
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({});
  const [newStat, setNewStat] = useState<Partial<Stat>>({});
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showAddStatModal, setShowAddStatModal] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  const handleAddFeature = () => {
    if (newFeature.title && newFeature.description && newFeature.stat) {
      setProject({
        ...project,
        features: [...project.features, newFeature as Feature],
        showFeatures: true,
      });
      setNewFeature({});
      setShowAddFeatureModal(false);
    } else {
      alert("Por favor, completa todos los campos.");
    }
  };

  const handleAddStat = () => {
    if (newStat.icon && newStat.text) {
      setProject({
        ...project,
        stats: [...project.stats, newStat as Stat],
      });
      setNewStat({});
      setShowAddStatModal(false);
    } else {
      alert("Por favor, completa todos los campos.");
    }
  };
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setProject({ ...project, featuresVideoUrl: url });
    }
  };
  return (
    <div className="space-y-6">
      {/* Sección de Título y Subtítulo */}
      <div className="border-gray-300 border-b pb-3">
        <h2 className="text-2xl font-bold">Configurar Características</h2>
        <p className="text-gray-600 text-sm">
          Agrega o edita las características técnicas de tu proyecto.
        </p>
      </div>

      {/* Pestañas */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("features")}
          className={`px-4 py-2 ${
            activeTab === "features"
              ? "border-b-2 border-purple-500 text-primario"
              : "text-gray-500"
          }`}
        >
          Características
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 ${
            activeTab === "stats"
              ? "border-b-2 border-purple-500 text-purple-500"
              : "text-gray-500"
          }`}
        >
          Estadísticas
        </button>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === "features" && (
        <div className="space-y-6">
          {/* Título y Subtítulo de la Sección */}
          <div>
            <label className="block text-sm font-medium mb-1">Título de la sección</label>
            <input
              value={project.featuresTitle}
              onChange={(e) => setProject({ ...project, featuresTitle: e.target.value })}
              className="w-full p-2 border-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej. Características Técnicas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subtítulo</label>
            <textarea
              value={project.featuresSubtitle}
              onChange={(e) => setProject({ ...project, featuresSubtitle: e.target.value })}
              className="w-full p-2 border-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej. Descubre las características que hacen único nuestro proyecto"
            />
          </div>

          {/* Video de Características */}
          <div>
            <label className="block text-sm font-medium mb-1">Video de Características</label>
            <input
              type="file"
              accept="video/mp4"
              onChange={handleVideoChange}
              className="w-full p-2 border-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Sección de Características */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mt-4 space-y-4">
              {project.features.map((feature, index) => (
                <div
                  key={index}
                  className="border-gray-300 border p-4 rounded-lg bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...project.features];
                        newFeatures[index].title = e.target.value;
                        setProject({ ...project, features: newFeatures });
                      }}
                      className="w-full p-2 border-gray-300 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej. Alto Rendimiento"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...project.features];
                        newFeatures[index].description = e.target.value;
                        setProject({ ...project, features: newFeatures });
                      }}
                      className="w-full p-2 border-gray-300 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej. Ofrecemos el mejor rendimiento del mercado"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estadística</label>
                    <input
                      value={feature.stat}
                      onChange={(e) => {
                        const newFeatures = [...project.features];
                        newFeatures[index].stat = e.target.value;
                        setProject({ ...project, features: newFeatures });
                      }}
                      className="w-full p-2 border-gray-300 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej. 99.9% de efectividad"
                    />
                  </div>
                </div>
              ))}

              {/* Botón para agregar nueva característica */}
              <button
                onClick={() => setShowAddFeatureModal(true)}
                className="w-full flex items-center justify-center p-6 bg-white rounded-xl border border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <span className="text-purple-500 font-semibold">Agregar Característica</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <div className="space-y-6">
          {/* Sección de Estadísticas e Íconos */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mt-4 space-y-4">
              {project.stats.map((stat, index) => (
                <div
                  key={index}
                  className="border-gray-300 border p-4 rounded-lg bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Ícono</label>
                    <IconSelector
                      selected={stat.icon}
                      onSelect={(icon) => {
                        const newStats = [...project.stats];
                        newStats[index].icon = icon;
                        setProject({ ...project, stats: newStats });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Texto</label>
                    <input
                      value={stat.text}
                      onChange={(e) => {
                        const newStats = [...project.stats];
                        newStats[index].text = e.target.value;
                        setProject({ ...project, stats: newStats });
                      }}
                      className="w-full p-2 border-gray-300 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej. 2x más rápido"
                    />
                  </div>
                </div>
              ))}

              {/* Botón para agregar nueva estadística */}
              <button
                onClick={() => setShowAddStatModal(true)}
                className="w-full flex items-center justify-center p-6 bg-white rounded-xl border border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <span className="text-purple-500 font-semibold">Agregar Estadística</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales para agregar nueva característica y estadística */}
      {showAddFeatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold mb-4">Agregar Nueva Característica</h3>
            <div className="space-y-4">
              <input
                placeholder="Estadística"
                className="w-full p-2 border rounded"
                value={newFeature.stat ?? ""}
                onChange={(e) => setNewFeature({ ...newFeature, stat: e.target.value })}
              />
              <input
                placeholder="Título"
                className="w-full p-2 border rounded"
                value={newFeature.title ?? ""}
                onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
              />
              <textarea
                placeholder="Descripción"
                className="w-full p-2 border rounded"
                value={newFeature.description ?? ""}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddFeatureModal(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddFeature}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddStatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold mb-4">Agregar Nueva Estadística</h3>
            <div className="space-y-4">
              <IconSelector
                selected={newStat.icon}
                onSelect={(icon) => setNewStat({ ...newStat, icon })}
              />
              <input
                placeholder="Texto"
                className="w-full p-2 border rounded"
                value={newStat.text ?? ""}
                onChange={(e) => setNewStat({ ...newStat, text: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddStatModal(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStat}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesForm;
