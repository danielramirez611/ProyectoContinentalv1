import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit, FiTrash } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getTeamMembers, deleteTeamMember } from "../../../api";
import { ProjectData, TeamMember } from "../../data/project";

interface TeamSectionProps {
  project: ProjectData;
  setProject: (data: ProjectData) => void;
  onEdit: (member: TeamMember) => void;
}

const TeamSection = ({ project, setProject, onEdit }: TeamSectionProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project?.id) return;

    const fetchTeamMembers = async () => {
      try {
        const members = await getTeamMembers(project.id);
        setProject({ ...project, team: members });
      } catch (error) {
        console.error("Error al obtener miembros del equipo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [project.id]);

  const handleDeleteMember = async (index: number) => {
    const memberToDelete = project.team[index];
    if (!memberToDelete.id) return;

    try {
      await deleteTeamMember(memberToDelete.id);
      const updatedTeam = project.team.filter((_, i) => i !== index);
      setProject({ ...project, team: updatedTeam });
    } catch (error) {
      console.error("Error al eliminar miembro:", error);
    }
  };

  const getGridColumns = (teamLength: number) => {
    if (teamLength === 1) return "grid-cols-1";
    if (teamLength === 2) return "grid-cols-2";
    if (teamLength === 3) return "grid-cols-3";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <section id="equipo" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <motion.h3
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Equipo de Innovación
          </motion.h3>
          <motion.p
            className="text-[var(--color-primario)] text-lg md:text-2xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Profesionales especializados en fabricación digital e ingeniería industrial.
          </motion.p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Cargando equipo...</p>
        ) : (
          <div className={`grid ${getGridColumns(project.team?.length || 0)} gap-8 justify-center`}>
            <AnimatePresence>
              {project.team?.map((member, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col items-center text-center hover:shadow-xl hover:border-[var(--color-primario)] transition-all duration-300 relative"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  {user?.role === "admin" && (
                    <div className="absolute top-4 right-4 flex gap-2 bg-white/90 p-1 rounded-full">
                      <button
                        onClick={() => onEdit(member)}
                        className="p-1 hover:text-blue-600 transition-colors"
                        aria-label="Editar"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(index)}
                        className="p-1 hover:text-red-600 transition-colors"
                        aria-label="Eliminar"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-6">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-[var(--color-primario)]">
                        {member.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </span>
                    )}
                  </div>

                  {/* Nombre y Rol */}
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h4>
                  <p className="text-[var(--color-primario)] text-sm md:text-base mb-4">
                    {member.role}
                  </p>

                  {/* Descripción */}
                  <p className="text-gray-600 text-sm md:text-base">
                    {member.bio}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;