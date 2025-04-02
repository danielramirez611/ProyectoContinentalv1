import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import AdvantagesForm from "./AdvantagesForm";
import FeaturesForm from "./FeaturesForm";
import WorkflowForm from "./WorkFlowForm";
import TeamForm from "./TeamForm";
import ImpactoForm from "./ImpactoForm";
import Investigacion from "./InvestigacionForm";
import { useAuth } from "../../context/AuthContext";
import { getProjectConfig, createProjectConfig, updateProjectConfig } from "../../../api";

interface ProjectData {
  id: number;
  project_name?: string;
  showAdvantages?: boolean;
  showFeatures?: boolean;
  showWorkflow?: boolean;
  showTeam?: boolean;
  showContact?: boolean;
  showImpacto?: boolean;           // 🔥 NUEVO
  showInvestigacion?: boolean;    // 🔥 NUEVO
}

interface ProjectFormProps {
  project: ProjectData;
  setProject: (data: ProjectData) => void;
  onFinish: () => void;
  onUpdateFlags: (flags: {
    showAdvantages: boolean;
    showFeatures: boolean;
    showWorkflow: boolean;
    showTeam: boolean;
    showContact: boolean;
    showImpacto: boolean;          // 🔥 NUEVO
    showInvestigacion: boolean;   // 🔥 NUEVO
  }) => void;
  onWorkflowUpdated: () => void; // ✅ nuevo

}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  setProject,
  onFinish,
  onUpdateFlags,
  onWorkflowUpdated,// ✅ agrégalo aquí

}) => {
  const { user } = useAuth();
  const token = user?.token || "";
  const [workflowVersion, setWorkflowVersion] = useState(0);

  const [currentSection, setCurrentSection] = useState<number>(-1);
  const [selectedSections, setSelectedSections] = useState({
    advantages: false,
    features: false,
    workflow: false,
    team: false,
    contact: false,
    impacto: false,         // 🔥 NUEVO
  investigacion: false    // 🔥 NUEVO
  });
  const handleWorkflowUpdated = () => {
    setWorkflowVersion((prev) => prev + 1); // 🔄 fuerza actualización en WorkflowSection
  };
  
  // Cargar configuración inicial
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getProjectConfig(project.id, token);
        setSelectedSections({
          advantages: !!config.showAdvantages,
          features: !!config.showFeatures,
          workflow: !!config.showWorkflow,
          team: !!config.showTeam,
          contact: !!config.showContact,
          impacto: !!config.showImpacto,               // 🔥 NUEVO
        investigacion: !!config.showInvestigacion    // 🔥 NUEVO
        });
      } catch (error) {
        if (error.response?.status === 404) {
          // Si no existe la configuración, la creamos
          await createProjectConfig(
            project.id,
            {
              showAdvantages: 0,
              showFeatures: 0,
              showWorkflow: 0,
              showTeam: 0,
              showContact: 0,
              showImpacto: 0,          // 🔥 NUEVO
              showInvestigacion: 0     // 🔥 NUEVO
            },
            token
          );
        } else {
          console.error("Error loading config:", error);
        }
      }
    };

    loadConfig();
  }, [project.id, token]);

  // Handler para alternar secciones
  const handleSectionToggle = async (key: string) => {
    const newValue = !selectedSections[key];

    // Actualizar estado local
    const newFlags = {
      ...selectedSections,
      [key]: newValue,
    };

    setSelectedSections(newFlags);
    onUpdateFlags({
      showAdvantages: newFlags.advantages,
      showFeatures: newFlags.features,
      showWorkflow: newFlags.workflow,
      showTeam: newFlags.team,
      showContact: newFlags.contact,
      showImpacto: newFlags.impacto,               // 🔥 NUEVO
  showInvestigacion: newFlags.investigacion    // 🔥 NUEVO
    });

    // Actualizar API
    const fieldName = `show${key.charAt(0).toUpperCase() + key.slice(1)}`;
    try {
      await updateProjectConfig(project.id, { [fieldName]: newValue ? 1 : 0 }, token);
    } catch (error) {
      console.error("❌ Error al actualizar configuración:", error);
    }
  };

  const sections = [
    {
      name: "Ventajas",
      key: "advantages",
      component: <AdvantagesForm projectId={project.id || 0} token={token} />,
      validation: () => true, 
    },
    {
      name: "Características",
      key: "features",
      component: <FeaturesForm project={project} setProject={setProject} />,
      validation: () => true,
    },
    {
      name: "Flujo de trabajo",
      key: "workflow",
      component: (
        <WorkflowForm
          project={project} 
          setProject={setProject}
          token={token}
          onWorkflowUpdated={() => setWorkflowVersion((v) => v + 1)} // ✅ aquí actualizas
          />
      ),
      validation: () => true,
    },
    
    {
      name: "Equipo",
      key: "team",
      component: <TeamForm project={project} setProject={setProject} />,
      validation: () => true,
    },
    {
      name: "Impacto",
      key: "impacto",
      component: <ImpactoForm project={project} setProject={setProject} />,
      validation: () => true,
    },
    {
      name: "Investigacion",
      key: "investigacion",
      component:  <Investigacion projectId={project.id} onSuccess={() => {}} />,
      validation: () => true,
    },
    {
      name: "Contacto",
      key: "contact",
      component: null,
      validation: () => true,
    },
  ];

  const filteredSections = sections.filter(
    (section) => selectedSections[section.key] && section.component
  );

  const progress = filteredSections.length > 0
    ? ((currentSection + 1) / filteredSections.length) * 100
    : 0;

  const goNext = () => {
    if (currentSection < filteredSections.length - 1) {
      setCurrentSection((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  const handleStartForm = () => {
    setCurrentSection(0);
  };

  if (currentSection === -1 || filteredSections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto bg-white shadow-lg p-8 my-8 rounded-lg"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración del Proyecto
          </h2>
          <p className="text-gray-600">
            Selecciona las secciones que deseas incluir en tu proyecto.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * sections.indexOf(section) }}
              className="flex items-center p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSections[section.key]}
                onChange={() => handleSectionToggle(section.key)}
                className="form-checkbox h-5 w-5 text-primario rounded focus:ring-primario"
              />
              <label className="ml-3 text-lg text-gray-700">{section.name}</label>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleStartForm}
            disabled={filteredSections.length === 0}
            className="flex items-center px-6 py-3 bg-primario text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
          >
            Siguiente
            <FiChevronRight className="ml-2" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto bg-white shadow-lg p-8 my-8 rounded-lg"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración del Proyecto
        </h2>
        <p className="text-gray-600">
          Explora las distintas secciones para personalizar tu proyecto.
        </p>
      </div>

      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <motion.div
            className="h-2 bg-primario rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Progreso: {currentSection + 1}/{filteredSections.length}
        </p>
      </div>

      <div className="mb-8 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {filteredSections[currentSection].name}
        </h3>
        {filteredSections[currentSection].component}
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={goPrev}
          disabled={currentSection === 0}
          className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
        >
          <FiChevronLeft className="mr-2" />
          Anterior
        </button>

        {currentSection === filteredSections.length - 1 ? (
          <button
            onClick={onFinish}
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <FiCheck className="mr-2" />
            Finalizar
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center px-6 py-3 bg-primario text-white rounded-lg hover:bg-purple-600 transition"
          >
            Siguiente
            <FiChevronRight className="ml-2" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectForm;