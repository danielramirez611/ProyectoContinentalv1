import React, { useState, useEffect } from "react";
import { IconSelector } from "../common/IconSelector";
import { Advantage } from "../../data/project";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faTrash, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion"; // Importar motion para animaciones
import { getAdvantages, addAdvantage, deleteAdvantage, updateAdvantage } from "../../../api";

interface AdvantagesFormProps {
  projectId: string;
  token: string;
}

const AdvantagesForm = ({ projectId, token }: AdvantagesFormProps) => {
  const [advantages, setAdvantages] = useState<Advantage[]>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionSubtitle, setSectionSubtitle] = useState("");
  const [newAdvantage, setNewAdvantage] = useState<Partial<Advantage>>({
    title: "",
    description: "",
    icon: "",
    stat: "",
  });
  const [editingAdvantageId, setEditingAdvantageId] = useState<number | null>(null);
  const [isAdvantagesExpanded, setIsAdvantagesExpanded] = useState(true);

  useEffect(() => {
    if (!projectId) {
      console.warn("⚠ projectId no está definido. No se pueden cargar ventajas.");
      return;
    }

    const fetchAdvantages = async () => {
      try {
        const data = await getAdvantages(projectId);
        if (data.length > 0) {
          setSectionTitle(data[0].section_title || "");
          setSectionSubtitle(data[0].section_subtitle || "");
        }
        setAdvantages(data);
      } catch (error) {
        console.error("❌ Error al obtener ventajas:", error);
      }
    };
    fetchAdvantages();
  }, [projectId]);

  const handleUpdateSectionInfo = async () => {
    if (!sectionTitle || !sectionSubtitle) {
      alert("Título y subtítulo de la sección son obligatorios.");
      return;
    }

    try {
      await Promise.all(
        advantages.map((adv) =>
          updateAdvantage(projectId, adv.id!, { section_title: sectionTitle, section_subtitle: sectionSubtitle }, token)
        )
      );
      alert("Sección actualizada correctamente.");
    } catch (error) {
      console.error("❌ Error al actualizar la sección:", error);
    }
  };

  const handleSaveAdvantage = async () => {
    if (!projectId) {
      console.error("❌ Error: No se ha definido un ID de proyecto.");
      alert("Error: No se ha definido un ID de proyecto.");
      return;
    }

    if (!newAdvantage.title || !newAdvantage.description || !newAdvantage.icon || !newAdvantage.stat) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      if (editingAdvantageId) {
        await updateAdvantage(projectId, editingAdvantageId, {
          section_title: sectionTitle || "",
          section_subtitle: sectionSubtitle || "",
          title: newAdvantage.title,
          description: newAdvantage.description,
          icon: newAdvantage.icon, 
          stat: newAdvantage.stat,
        }, token);

        alert("Ventaja actualizada correctamente.");
      } else {
        await addAdvantage(projectId, {
          section_title: sectionTitle || "",
          section_subtitle: sectionSubtitle || "",
          title: newAdvantage.title,
          description: newAdvantage.description,
          icon: newAdvantage.icon, 
          stat: newAdvantage.stat,
        }, token);

        alert("Ventaja agregada correctamente.");
      }

      const updatedAdvantages = await getAdvantages(projectId);
      setAdvantages(updatedAdvantages);

      setNewAdvantage({ title: "", description: "", icon: "", stat: "" });
      setEditingAdvantageId(null);
    } catch (error) {
      console.error("❌ Error al guardar ventaja:", error);
    }
  };

  const handleDeleteAdvantage = async (advantageId: number) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta ventaja?")) return;
    try {
      await deleteAdvantage(projectId, advantageId, token);
      setAdvantages(advantages.filter((adv) => adv.id !== advantageId));
    } catch (error) {
      console.error("❌ Error al eliminar ventaja:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 "
    >
      <div className="border-b bg-white border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Configurar Ventajas</h2>
        <p className="text-gray-600 text-sm">Agrega o edita las ventajas competitivas de tu proyecto.</p>
      </div>

      {/* Lista de ventajas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="font-medium text-lg text-gray-900 mb-4">Ventajas Existentes</h4>
        <div className="space-y-4">
          {advantages.map((advantage) => (
            <motion.div
              key={advantage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-gray-200 p-4 rounded-lg bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{advantage.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setNewAdvantage(advantage);
                      setEditingAdvantageId(advantage.id);
                    }}
                    className="text-primario hover:text-purple-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteAdvantage(advantage.id!)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{advantage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Formulario para agregar o editar ventaja */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="font-medium text-lg text-gray-900 mb-4">
          {editingAdvantageId ? "Editar Ventaja" : "Agregar Nueva Ventaja"}
        </h4>
        <div className="space-y-4">
          <input
            placeholder="Título"
            value={newAdvantage.title}
            onChange={(e) => setNewAdvantage({ ...newAdvantage, title: e.target.value })}
            className="w-full p-3 border focus:outline-0 border-gray-200 rounded-lg focus:ring-2 focus:ring-primario focus:border-transparent"
          />
          <textarea
            placeholder="Descripción"
            value={newAdvantage.description}
            onChange={(e) => setNewAdvantage({ ...newAdvantage, description: e.target.value })}
            className="w-full focus:outline-0 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primario focus:border-transparent"
          />
          <IconSelector
            selected={newAdvantage.icon}
            onSelect={(icon) => setNewAdvantage({ ...newAdvantage, icon: icon })}
          />
          <input
            placeholder="Estadística"
            value={newAdvantage.stat}
            onChange={(e) => setNewAdvantage({ ...newAdvantage, stat: e.target.value })}
            className="w-full focus:outline-0 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primario focus:border-transparent"
          />
          <button
            onClick={handleSaveAdvantage}
            className="w-full bg-primario text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            {editingAdvantageId ? "Guardar Cambios" : "Agregar Ventaja"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvantagesForm;