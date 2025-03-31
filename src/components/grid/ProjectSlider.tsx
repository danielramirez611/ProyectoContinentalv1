import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectCard } from "./ProjectCard";
import { motion, AnimatePresence } from "framer-motion";
import { ODS_CATEGORIES } from "./ODSSelectorModal";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description?: string;
  section_id?: string;
}

interface ProjectSection {
  id: string;
  name: string;
  image_url?: string;
}

interface ProjectSliderProps {
  sections: ProjectSection[];
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

  // Referencia al contenedor que hace scroll horizontal
  const carouselRef = useRef<HTMLDivElement>(null);

  // Índice de la “tarjeta actual”
  const [currentIndex, setCurrentIndex] = useState(0);

  // Función auxiliar para extraer el ícono de ODS
  const extractIconName = (url: string) => {
    const match = url.match(/(Fa[A-Za-z0-9]+)$/);
    return match ? match[1] : "FaQuestionCircle";
  };

  // Al hacer clic en una tarjeta => ir a detalle
  const handleProjectClick = (project: Project) => {
    navigate(`/project/${project.id}`, { state: { project } });
  };

  // Calcular scroll en base a la posición (currentIndex)
  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;

    // Ajusta el ancho de tus tarjetas y el gap (spacing)
    const CARD_WIDTH = 240; // px
    const GAP = 16;         // gap-4 => 16px

    const scrollPosition = index * (CARD_WIDTH + GAP);
    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  };

  // Cada vez que cambie el currentIndex, movemos el scroll
  useEffect(() => {
    scrollToIndex(currentIndex);
  }, [currentIndex]);

  // Funciones para ir a la tarjeta anterior / siguiente
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < projects.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <section className="py-10 px-4 md:px-8 lg:px-16 relative">
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

      {/* Contenedor principal del carrusel */}
      <div
        ref={carouselRef}
        className="relative w-full overflow-x-auto overflow-y-hidden scrollbar-hide"
      >
        <div className="flex gap-4">
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
                  onClick={() => handleProjectClick(project)}
                  className="
                    flex-shrink-0 w-[240px] relative cursor-pointer
                    group
                    transition-transform duration-300 ease-in-out
                    hover:z-20 hover:scale-105
                  "
                >
                  <ProjectCard
                    title={project.title}
                    category={odsCategory?.title || project.category}
                    image={project.image}
                    odsIcon={extractIconName(section?.image_url || "")}
                    odsColor={odsCategory?.color || "#000000"}
                  />

                  {/* Botones de edición/eliminación (solo si esAdmin) */}
                  {isAdmin && (
                    <div className="mt-2 flex gap-2 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject && onDeleteProject(project.id);
                        }}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProject && onEditProject(project);
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
      </div>

      {/* Flecha izquierda */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="
            absolute left-0 top-1/2 -translate-y-1/2 
            p-2 rounded-full bg-white text-gray-700 shadow
            hover:bg-gray-200
          "
        >
          <FaChevronLeft size={20} />
        </button>
      )}

      {/* Flecha derecha */}
      {currentIndex < projects.length - 1 && (
        <button
          onClick={handleNext}
          className="
            absolute right-0 top-1/2 -translate-y-1/2
            p-2 rounded-full bg-white text-gray-700 shadow
            hover:bg-gray-200
          "
        >
          <FaChevronRight size={20} />
        </button>
      )}
    </section>
  );
};
