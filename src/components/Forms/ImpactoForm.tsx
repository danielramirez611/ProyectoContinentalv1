import { useEffect, useState } from "react";
import { ProjectImpact } from "../../data/project";
import { addImpact, updateImpact, deleteImpact, getImpact } from "../../../api";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

const ImpactoForm = () => {
  const { token } = useAuth();
  const { id } = useParams();
const projectId = id ? Number(id) : null;


  const [impactos, setImpactos] = useState<ProjectImpact[]>([]);
  const [editing, setEditing] = useState<ProjectImpact | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchImpactos = async () => {
    try {
      const data = await getImpact(projectId);
      setImpactos(data);
    } catch (err) {
      console.error("❌ Error al obtener impacto:", err);
    }
  };

  useEffect(() => {
    if (!projectId || isNaN(projectId)) {
      console.error("ID de proyecto inválido:", id);
      return;
    }
    fetchImpactos();
  }, [projectId]);
  

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return alert("Título y descripción requeridos");

        try {
        if (editing) {
            await updateImpact(projectId, editing.id!, { project_id: projectId, title, description }, file || undefined, token);
        } else {
            await addImpact(projectId, { project_id: projectId, title, description }, file || undefined, token);
        }
        setTitle("");
        setDescription("");
        setFile(null);
        setEditing(null);
        fetchImpactos();
        } catch (error) {
        console.error("❌ Error al guardar impacto:", error);
        }
    };

  const handleEdit = (impact: ProjectImpact) => {
    setEditing(impact);
    setTitle(impact.title);
    setDescription(impact.description);
  };

  const handleDelete = async (impactId: number) => {
    if (!confirm("¿Estás seguro de eliminar este impacto?")) return;
    try {
      await deleteImpact(projectId, impactId, token);
      fetchImpactos();
    } catch (err) {
      console.error("❌ Error al eliminar impacto:", err);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Título</label>
          <input type="text" className="w-full border px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Descripción</label>
          <textarea className="w-full border px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Imagen (opcional)</label>
          <input type="file" accept="image/*" onChange={e => e.target.files && setFile(e.target.files[0])} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editing ? "Actualizar" : "Agregar"}
        </button>
        {editing && (
          <button type="button" className="ml-4 text-sm text-gray-500 underline" onClick={() => {
            setEditing(null);
            setTitle("");
            setDescription("");
            setFile(null);
          }}>
            Cancelar edición
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {impactos.map((impact) => (
          <div key={impact.id} className="border p-4 rounded bg-gray-50">
            <h3 className="font-semibold text-lg">{impact.title}</h3>
            <p className="text-sm mb-2">{impact.description}</p>
            {impact.image_url && (
              <img src={impact.image_url} alt="Impacto" className="w-full h-48 object-cover rounded" />
            )}
            <div className="mt-2 flex gap-2">
              <button onClick={() => handleEdit(impact)} className="text-blue-600 hover:underline text-sm">Editar</button>
              <button onClick={() => handleDelete(impact.id!)} className="text-red-600 hover:underline text-sm">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactoForm;
