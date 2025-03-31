import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit, FiTrash } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getAdvantages } from "../../../api";
import { iconMap } from "../common/IconSelector";
import AdvantagesForm from "../Forms/AdvantagesForm"; // 🔹 Importamos el formulario de edición

interface Advantage {
  id: number;
  title: string;
  description: string;
  icon: string;
  stat: string;
  section_title?: string;
  section_subtitle?: string;
}

interface AdvantagesSectionProps {
  projectId: string;
  onEdit: (advantage: Advantage) => void; // 🔹 Pasa la ventaja seleccionada
  onDelete: (id: number) => void;
}

export const AdvantagesSection = ({
  projectId,
  onEdit,
  
  onDelete,
}: AdvantagesSectionProps) => {
  const { user } = useAuth();
  const [advantages, setAdvantages] = useState<Advantage[]>([]);
  const [sectionTitle, setSectionTitle] = useState<string>("Ventajas");
  const [sectionSubtitle, setSectionSubtitle] = useState<string>("Descubre lo que nos diferencia");
  const [editingAdvantage, setEditingAdvantage] = useState<Advantage | null>(null); // 🔹 Estado para controlar la edición

  useEffect(() => {
    const fetchAdvantages = async () => {
      try {
        const data = await getAdvantages(projectId);

        if (data.length > 0) {
          setSectionTitle(data[0].section_title || "Ventajas");
          setSectionSubtitle(data[0].section_subtitle || "Descubre lo que nos diferencia");
        }

        const formattedAdvantages = data.map((adv: any) => ({
          ...adv,
          icon: adv.icon.replace(/['"]+/g, "").trim(),
        }));

        setAdvantages(formattedAdvantages);
      } catch (error) {
        console.error("❌ Error al obtener ventajas:", error);
      }
    };

    if (projectId) {
      fetchAdvantages();
    }
  }, [projectId]);

  return (
    <section id="ventajas" className="py-20 bg-[#F8F8F8]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h3
            className="text-7xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {sectionTitle}
          </motion.h3>
          <motion.p
            className="text-gray-600 text-lg md:text-3xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {sectionSubtitle}
          </motion.p>
        </div>

        {advantages.length === 0 ? (
          <p className="text-center text-gray-600">No hay ventajas registradas.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <AnimatePresence>
              {advantages.map((advantage) => (
                <motion.div
                  key={advantage.id}
                  className="relative bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  {user?.role === "admin" && (
                    <div className="absolute top-2 right-2 flex gap-2 bg-white/90 p-1 rounded-full shadow-md">
                      {/* Botón Editar */}
                      <button 
                        onClick={() => setEditingAdvantage(advantage)}
                        className="p-1 hover:text-blue-600 transition-colors"
                        aria-label="Editar"
                      >
                        <FiEdit />
                      </button>

                      {/* Botón Eliminar con confirmación */}
                      <button
  onClick={() => {
    if (window.confirm("¿Estás seguro de eliminar esta ventaja?")) {
      onDelete(advantage.id); // ✅ Se asegura que `onDelete` recibe el `id` correcto
    }
  }}
  className="p-1 hover:text-red-600 transition-colors"
  aria-label="Eliminar"
>
  <FiTrash />
</button>


                    </div>
                  )}

                  <div className="w-20 h-20 text-primario bg-purple-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    {iconMap[advantage.icon] ? (
                      React.createElement(iconMap[advantage.icon], { className: "text-4xl" })
                    ) : (
                      <span className="text-4xl">❓</span>
                    )}
                  </div>

                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    {advantage.title}
                  </h4>
                  <p className="text-gray-600 mb-6 text-center">
                    {advantage.description}
                  </p>
                  <div className="bg-purple-50 rounded-xl p-4 w-full text-center">
                    <span className="text-[var(--color-primario)] font-semibold">
                      {advantage.stat}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 🔹 Formulario de edición en un modal flotante */}
      {editingAdvantage && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/20 flex justify-center items-center p-4 z-[1000]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingAdvantage(null);
          }}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-lg shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <AdvantagesForm
              projectId={projectId}
              advantage={editingAdvantage}
              onClose={() => setEditingAdvantage(null)}
            />
          </div>
        </div>
      )}
    </section>
  );
};
