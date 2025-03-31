import React from "react";
import { useNavigate } from "react-router-dom";
import { ProjectCard } from "./ProjectCard";
import { motion, AnimatePresence } from "framer-motion";
import { ODS_CATEGORIES } from "./ODSSelectorModal";

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description?: string;
}

interface ProjectSliderProps {
  sections: ProjectSection[]; // <-- Nueva prop
  title?: string;
  projects: Project[];
  onDeleteProject?: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
  isAdmin?: boolean;
}

export const ProjectSlider: React.FC<ProjectSliderProps> = ({
  title,
  sections,
  projects,
  onDeleteProject,
  onEditProject,
  isAdmin,
}) => {
  const navigate = useNavigate();

  const extractIconName = (url: string) => {
    // Captura FaPeace, FaBook, etc. al final de cualquier string
    const match = url.match(/(Fa[A-Za-z0-9]+)$/);
    return match ? match[1] : "FaQuestionCircle";
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/project/${project.id}`, { state: { project } });
  };

  return (
    <section className="py-10 px-4 md:px-8 lg:px-16">
      {title && (
        <motion.h2
          className="text-2xl md:text-3xl font-bold mb-6 text-gray-800"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>
      )}

      {/* Grilla Responsive (tarjetas más grandes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {projects.map((project) => {
            const section = sections.find((s) => s.id === project.section_id);
            const odsCategory = ODS_CATEGORIES.find(
              (ods) => ods.title === section?.name
            );
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
                className="cursor-pointer"
                onClick={() => handleProjectClick(project)} // 🔹 Redirige al hacer clic en la tarjeta
              >
                <ProjectCard
                  title={project.title}
                  category={odsCategory?.title || project.category}
                  image={project.image}
                  odsIcon={extractIconName(section?.image_url || "")}
                  odsColor={odsCategory?.color || "#000000"}
                  onClick={() => handleProjectClick(project)}
                />

                {/* 🔹 Botones de edición/eliminación, solo para admin */}
                {isAdmin && (
                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // ⛔ Evita la navegación al hacer clic en el botón
                        if (onDeleteProject) onDeleteProject(project.id);
                      }}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // ⛔ Evita la navegación al hacer clic en el botón
                        if (onEditProject) onEditProject(project);
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};
