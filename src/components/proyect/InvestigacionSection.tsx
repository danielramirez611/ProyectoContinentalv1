import React, { useEffect, useState } from "react";
import { ProjectResearch } from "../../data/project";
import { getResearch } from "../../../api";

interface InvestigacionSectionProps {
  projectId: number;
}

const InvestigacionSection = ({ projectId }: InvestigacionSectionProps) => {
  const [investigaciones, setInvestigaciones] = useState<ProjectResearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestigaciones = async () => {
      try {
        const data = await getResearch(projectId);
        setInvestigaciones(data);
      } catch (error) {
        console.error("❌ Error al cargar investigaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestigaciones();
  }, [projectId]);

  return (
    <section className="px-6 py-12 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Investigaciones</h2>

      {loading ? (
        <p className="text-gray-500">Cargando investigaciones...</p>
      ) : investigaciones.length === 0 ? (
        <p className="text-gray-500">No se encontraron investigaciones.</p>
      ) : (
        <ul className="space-y-4">
          {investigaciones.map((item) => (
            <li key={item.id} className="border rounded p-4 shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-blue-800">{item.title}</h3>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {item.link}
              </a>
              <p className="text-sm text-gray-500 mt-1">© {item.copyright || "CC"}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default InvestigacionSection;
