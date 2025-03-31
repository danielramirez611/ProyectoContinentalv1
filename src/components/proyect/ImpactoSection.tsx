import { useEffect, useState } from "react";
import { ProjectImpact } from "../../data/project";
import { getImpact } from "../../../api";

interface ImpactoSectionProps {
  projectId: number;
}

const ImpactoSection = ({ projectId }: ImpactoSectionProps) => {
  const [impactos, setImpactos] = useState<ProjectImpact[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getImpact(projectId);
        setImpactos(data);
      } catch (err) {
        console.error("❌ Error al cargar impactos:", err);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  return (
    <section className="py-8 px-4 md:px-8">
      <h2 className="text-2xl font-bold mb-6">Impacto del Proyecto</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {impactos.map((impact) => (
          <div key={impact.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">{impact.title}</h3>
            <p className="text-sm text-gray-700 mb-3">{impact.description}</p>
            {impact.image_url && (
              <img
                src={impact.image_url.startsWith("http") ? impact.image_url : `http://localhost:5000${impact.image_url}`}
                alt="Impacto"
                className="w-full h-48 object-cover rounded"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImpactoSection;
