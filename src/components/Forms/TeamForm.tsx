import React, { useState, useRef, useEffect } from "react";
import { ProjectData, TeamMember } from "../../data/project";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { addTeamMember, getTeamMembers, deleteTeamMember, updateTeamMember } from "../../../api";

interface TeamFormProps {
  project: ProjectData;
  setProject: (data: ProjectData) => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ project, setProject }) => {
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, [project.id]);

  const fetchTeamMembers = async () => {
    if (!project.id) return;
    try {
      const members = await getTeamMembers(project.id);
      setProject({ ...project, team: members });
    } catch (error) {
      console.error("Error al obtener miembros del equipo:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMember({ ...newMember, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrEditMember = async () => {
    if (!newMember.name || !newMember.role || !newMember.bio || !newMember.avatar || !project.id) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      if (editingIndex !== null) {
        // Modo edición
        const memberToUpdate = {
          ...project.team[editingIndex],
          ...newMember,
          project_id: project.id,
        };

        if (memberToUpdate.id) {
          await updateTeamMember(memberToUpdate.id, memberToUpdate);
          const updatedTeam = [...project.team];
          updatedTeam[editingIndex] = memberToUpdate;
          setProject({ ...project, team: updatedTeam });
        }

        setEditingIndex(null);
      } else {
        // Modo agregar
        const savedMember = await addTeamMember({
          project_id: project.id,
          name: newMember.name,
          role: newMember.role,
          bio: newMember.bio,
          avatar: newMember.avatar,
        });

        setProject({
          ...project,
          team: [...(project.team || []), savedMember],
          showTeam: true,
        });
      }

      setNewMember({}); // Limpiar el formulario
    } catch (error) {
      console.error("❌ Error al guardar miembro:", error);
    }
  };

  const handleDeleteMember = async (index: number) => {
    const memberToDelete = project.team[index];
    if (!memberToDelete.id) return;

    try {
      // Eliminar de la API
      await deleteTeamMember(memberToDelete.id);

      // Actualizar el estado local
      const updatedTeam = project.team.filter((_, i) => i !== index);
      setProject({ ...project, team: updatedTeam });
    } catch (error) {
      console.error("Error al eliminar miembro:", error);
    }
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    const member = project.team[index];
    setNewMember({ name: member.name, role: member.role, bio: member.bio, avatar: member.avatar });
  };

  const uploadImageToServer = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:5000/api/team-members/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Error al subir imagen:", res.status, errText);
        return null;
      }

      const data = await res.json();
      if (data.avatarUrl) {
        return window.location.origin + data.avatarUrl;
      }

      return null;
    } catch (error) {
      console.error("❌ Error al subir imagen:", error);
      return null;
    }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {project.team?.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{member.name}</h4>
              <div className="space-x-3">
                <button
                  onClick={() => handleEditClick(index)}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button
                  onClick={() => handleDeleteMember(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">Avatar</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const uploadedUrl = await uploadImageToServer(file);
                        if (uploadedUrl) {
                          const updatedTeam = [...project.team];
                          updatedTeam[index].avatar = uploadedUrl;
                          setProject({ ...project, team: updatedTeam });

                          if (updatedTeam[index].id) {
                            await updateTeamMember(updatedTeam[index].id!, updatedTeam[index]);
                          }
                        }
                      }
                    }}
                    className="hidden"
                    id={`avatar-upload-${index}`}
                  />
                  <label
                    htmlFor={`avatar-upload-${index}`}
                    className="cursor-pointer text-primary hover:text-primary-dark"
                  >
                    {member.avatar ? "Cambiar Avatar" : "Subir Avatar"}
                  </label>
                  {member.avatar && (
                    <img src={member.avatar} alt={member.name} className="mt-4 rounded-lg max-h-40 mx-auto" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">Nombre</label>
                  <input
                    value={member.name}
                    onChange={(e) => {
                      const updatedTeam = [...project.team];
                      updatedTeam[index].name = e.target.value;
                      setProject({ ...project, team: updatedTeam });

                      if (updatedTeam[index].id) {
                        updateTeamMember(updatedTeam[index].id!, updatedTeam[index]);
                      }
                    }}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">Rol</label>
                  <input
                    value={member.role}
                    onChange={(e) => {
                      const updatedTeam = [...project.team];
                      updatedTeam[index].role = e.target.value;
                      setProject({ ...project, team: updatedTeam });

                      if (updatedTeam[index].id) {
                        updateTeamMember(updatedTeam[index].id!, updatedTeam[index]);
                      }
                    }}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">Biografía</label>
                  <textarea
                    value={member.bio}
                    onChange={(e) => {
                      const updatedTeam = [...project.team];
                      updatedTeam[index].bio = e.target.value;
                      setProject({ ...project, team: updatedTeam });

                      if (updatedTeam[index].id) {
                        updateTeamMember(updatedTeam[index].id!, updatedTeam[index]);
                      }
                    }}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          {editingIndex !== null ? "Editar Miembro" : "Agregar Nuevo Miembro"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-600">Avatar</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                id="new-avatar-upload"
              />
              <label htmlFor="new-avatar-upload" className="cursor-pointer text-primary hover:text-primary-dark">
                {newMember.avatar ? "Cambiar Avatar" : "Subir Avatar"}
              </label>
              {newMember.avatar && (
                <img src={newMember.avatar} alt="Nuevo miembro" className="mt-4 rounded-lg max-h-40 mx-auto" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">Nombre</label>
              <input
                value={newMember.name || ""}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">Rol</label>
              <input
                value={newMember.role || ""}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">Biografía</label>
              <textarea
                value={newMember.bio || ""}
                onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleAddOrEditMember}
            className="flex items-center gap-2 bg-primario text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            {editingIndex !== null ? "Guardar Cambios" : "Agregar Miembro"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamForm;