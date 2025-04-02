import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/proyect/HeroSection";
import { AdvantagesSection } from "../components/proyect/AdvantagesSection";
import { FeaturesSection } from "../components/proyect/FeaturesSection";
import WorkflowSection from "../components/proyect/WorkflowSection";
import ImpactoSection from "../components/proyect/ImpactoSection";
import TeamSection from "../components/proyect/TeamSection";
import InvestigacionSection from "../components/proyect/InvestigacionSection"
import ContactForm from "../components/proyect/ContactForm";
import Footer from "../components/Footer";
import ProjectForm from "../components/Forms/ProjectForm";
import { ProjectData, initialProjectData } from "../data/project";
import { useAuth } from "../context/AuthContext";
import { FiSettings } from "react-icons/fi";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getProjectById, deleteAdvantage, getProjectConfig } from "../../api";
import { motion, AnimatePresence } from "framer-motion";

const ProjectPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData>(initialProjectData);
  const [showForm, setShowForm] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const [workflowVersion, setWorkflowVersion] = useState(0);
  const [showFlags, setShowFlags] = useState({
    showAdvantages: false,
    showFeatures: false,
    showWorkflow: false,
    showTeam: false,
    showContact: false,
    showImpacto: false,         // 🔥 NUEVO
    showInvestigacion: false    // 🔥 NUEVO
  });
  const handleWorkflowUpdated = () => {
    setWorkflowVersion((prev) => prev + 1); // 🔄 fuerza actualización en WorkflowSection
  };
  
  // Cargar configuración del proyecto
  useEffect(() => {
    const loadConfig = async () => {
      if (!id) return; // Asegúrate de que el ID del proyecto esté disponible
  
      try {
        // Llama a la API con o sin token, dependiendo de si el usuario está logueado
        const config = await getProjectConfig(id, token || undefined);
        setShowFlags({
          showAdvantages: !!config.showAdvantages,
          showFeatures: !!config.showFeatures,
          showWorkflow: !!config.showWorkflow,
          showTeam: !!config.showTeam,
          showContact: !!config.showContact,
          showImpacto: !!config.showImpacto,               // 🔥 NUEVO
          showInvestigacion: !!config.showInvestigacion    // 🔥 NUEVO
        });
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };
  
    loadConfig();
  }, [id, token]); // Dependencias: id y token
  // Cargar datos del proyecto
  useEffect(() => {
    // En el useEffect de carga del proyecto
    const loadProjectData = async () => {
      try {
        if (location.state?.project) {
          setProject(location.state.project);
        } else if (id) {
          const data = await getProjectById(id);
          // Cargar ventajas separadamente si no vienen en el proyecto
          const advantagesData = await getAdvantages(id);
          setProject({
            ...data,
            advantages: advantagesData,
          });
        }
      } catch (error) {
        console.error("❌ Error al cargar proyecto:", error);
      }
    };

    loadProjectData();
  }, [id, location.state]);

  // Handler para eliminar ventajas
  const handleDeleteAdvantage = async (advantageId: number) => {
    if (!user || !token) {
      console.error("❌ Error: Usuario no autenticado o token no disponible.");
      alert("Debe iniciar sesión para eliminar una ventaja.");
      return;
    }

    if (!window.confirm("¿Seguro que deseas eliminar esta ventaja?")) return;

    try {
      await deleteAdvantage(project.id, advantageId, token);
      setProject((prev) => ({
        ...prev,
        advantages:
          prev.advantages?.filter((adv) => adv.id !== advantageId) || [],
      }));
    } catch (error) {
      console.error("❌ Error al eliminar ventaja:", error);
    }
  };

  const handleUpdateAdvantages = (updatedAdvantages: Advantage[]) => {
    setProject((prev) => ({
      ...prev,
      advantages: updatedAdvantages,
    }));
  };

  // Handler para actualizar las banderas de visibilidad
  const handleUpdateFlags = (newFlags: typeof showFlags) => {
    setShowFlags(newFlags);
  };

  return (
    <div className="flex flex-col min-h-screen">
    <Navbar project={project} flags={showFlags} />

      <main className="flex-grow">
        <Hero
          title={project.title}
          image={project.image}
          description={project.description}
        />

        {/* Sección de Ventajas */}

        <AnimatePresence>
          {showFlags.showAdvantages && (
            <motion.div
              key="advantages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdvantagesSection
                projectId={id}
                title={project.advantagesTitle}
                subtitle={project.advantagesSubtitle}
                advantages={project.advantages || []}
                onUpdate={(updatedAdvantages) => {
                  setProject((prev) => ({
                    ...prev,
                    advantages: updatedAdvantages,
                  }));
                }}
                onDelete={handleDeleteAdvantage}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sección de Características */}
        <AnimatePresence>
          {showFlags.showFeatures && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FeaturesSection
                key={project.features ? project.features.length : 0}
                projectId={project.id}
                featuresTitle={project.featuresTitle}
                featuresSubtitle={project.featuresSubtitle}
                features={project.features}
                stats={project.stats}
                featuresVideoUrl={project.featuresVideoUrl}
                onEdit={() => setShowForm(true)}
                onDelete={(id) => console.log("Eliminar característica:", id)}
                onEditStat={(stat) => console.log("Editar estadística:", stat)}
                onDeleteStat={(id) => console.log("Eliminar estadística:", id)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sección de Flujo de Trabajo */}
        <AnimatePresence>
          {showFlags.showWorkflow && (
            <motion.div
              key="workflow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WorkflowSection
  key={workflowVersion} // 👈 ESTO fuerza re-render TOTAL al cambiar versión
  projectId={project.id}
                workflow={project.workflow}
                workflowTitle={project.workflowTitle}
                workflowSubtitle={project.workflowSubtitle}
                onEdit={() => setShowForm(true)}
                onDelete={(index) => console.log("Eliminar paso:", index)}
                version={workflowVersion} // 👈 clave para recargar cambios

              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sección de Equipo */}
        <AnimatePresence>
          {showFlags.showTeam && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TeamSection
                project={project}
                setProject={setProject}
                onEdit={() => setShowForm(true)}
                onDelete={(index) => console.log("Eliminar miembro:", index)}
              />
            </motion.div>
          )}
        </AnimatePresence>
                {/* Sección de Impacto */}

        <AnimatePresence>
          {showFlags.showImpacto && (
            <motion.div
              key="impacto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ImpactoSection projectId={Number(id)} />
            </motion.div>
          )}
        </AnimatePresence>
                {/* Sección de Investigación */}

        <AnimatePresence>
  {showFlags.showInvestigacion && (
    <motion.div
      key="investigaciones"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <InvestigacionSection projectId={Number(id)} />
    </motion.div>
  )}
</AnimatePresence>

        {/* Sección de Contacto */}
        <AnimatePresence>
          {showFlags.showContact && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ContactForm email={project.contactEmail} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />

      {/* Botón de Configuración */}
      {user?.role === "admin" && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="fixed bottom-8 right-8 bg-primario text-white p-4 rounded-full shadow-lg hover:bg-purple-600 transition"
        >
          <FiSettings className="text-2xl" />
        </button>
      )}

      {/* Formulario de Edición */}
      {user?.role === "admin" && showForm && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/20 flex justify-center items-center p-4 z-[1000]"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ProjectForm
              project={project}
              setProject={setProject}
              onFinish={() => setShowForm(false)}
              onUpdateFlags={handleUpdateFlags}
              onWorkflowUpdated={() => setWorkflowVersion((v) => v + 1)} // ✅ nuevo

            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
