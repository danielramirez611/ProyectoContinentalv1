import React, { useState, useEffect } from "react";
import { ProjectResearch } from "../../data/project";
import {
  getResearch,
  addResearch,
  updateResearch,
  deleteResearch,
} from "../../../api";
import { useAuth } from "../../context/AuthContext";

interface InvestigacionFormProps {
  projectId: number;
}

const InvestigacionForm = ({ projectId }: InvestigacionFormProps) => {
  const { token } = useAuth();
  const [researchList, setResearchList] = useState<ProjectResearch[]>([]);
  const [editing, setEditing] = useState<ProjectResearch | null>(null);

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [copyright, setCopyright] = useState("CC");

  // 🔹 Cargar investigaciones
  const loadResearch = async () => {
    try {
      const data = await getResearch(projectId);
      setResearchList(data);
    } catch (error) {
      console.error("❌ Error al cargar investigaciones:", error);
    }
  };

  useEffect(() => {
    loadResearch();
  }, [projectId]);

  // 🔹 Cuando seleccionas una para editar
  const handleEdit = (research: ProjectResearch) => {
    setEditing(research);
    setTitle(research.title);
    setLink(research.link);
    setCopyright(research.copyright || "CC");
  };

  // 🔹 Guardar nueva o editar existente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !link) return alert("Título y enlace requeridos");

    try {
      const data = { title, link, copyright, project_id: projectId };

      if (editing?.id) {
        await updateResearch(projectId, editing.id, data, token);
        alert("Investigación actualizada");
      } else {
        await addResearch(projectId, data, token);
        alert("Investigación agregada");
      }

      // Limpiar
      setEditing(null);
      setTitle("");
      setLink("");
      setCopyright("CC");
      loadResearch();
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      alert("Error al guardar investigación");
    }
  };

  // 🔹 Eliminar
  const handleDelete = async () => {
    if (!editing?.id) return;
    if (!confirm("¿Eliminar esta investigación?")) return;

    try {
      await deleteResearch(projectId, editing.id, token);
      alert("Investigación eliminada");
      setEditing(null);
      setTitle("");
      setLink("");
      setCopyright("CC");
      loadResearch();
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
      alert("Error al eliminar investigación");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 border-b pb-6">
        <h2 className="text-lg font-semibold">
          {editing ? "Editar investigación" : "Nueva investigación"}
        </h2>

        <div>
          <label className="block font-medium">Título</label>
          <input
            type="text"
            className="w-full border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Enlace</label>
          <input
            type="url"
            className="w-full border px-3 py-2"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Tipo de licencia</label>
          <input
            type="text"
            className="w-full border px-3 py-2"
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editing ? "Actualizar" : "Agregar"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Eliminar
            </button>
          )}
        </div>
      </form>

      {/* Lista de investigaciones */}
      <div>
        <h3 className="text-lg font-medium mb-2">Investigaciones guardadas</h3>
        <ul className="space-y-2">
          {researchList.length === 0 && (
            <li className="text-gray-500">No hay investigaciones aún.</li>
          )}
          {researchList.map((item) => (
            <li
              key={item.id}
              className="border p-3 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => handleEdit(item)}
            >
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-blue-600">{item.link}</p>
              <p className="text-xs text-gray-500">
                Derechos: {item.copyright || "CC"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InvestigacionForm;
