import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { getWorkflow, getWorkflowSteps, addWorkflowStep, updateWorkflowStep, deleteWorkflowStep } from "../../../api";
import "swiper/swiper-bundle.css";
import styles from "../../WorkflowSection.module.css";

interface WorkflowSectionProps {
  projectId: number;
}

const WorkflowSection = ({ projectId }: WorkflowSectionProps) => {
  const [workflow, setWorkflow] = useState([]);
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [workflowSubtitle, setWorkflowSubtitle] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Función para cargar los datos del workflow desde la API
  const fetchWorkflowData = async () => {
    try {
      const stepsResponse = await getWorkflowSteps(projectId);
      const workflowResponse = await getWorkflow(projectId);

      const formattedSteps = stepsResponse.map((step: any) => ({
        step: step.step_number,
        title: step.title,
        description: step.description,
        image: step.image_url ? `http://localhost:5000${step.image_url}` : null,
      }));

      setWorkflow(formattedSteps);
      setWorkflowTitle(workflowResponse?.title || "");
      setWorkflowSubtitle(workflowResponse?.subtitle || "");
    } catch (error) {
      console.error("Error al cargar workflow:", error);
    }
  };

  // Cargar los datos al montar el componente
  useEffect(() => {
    fetchWorkflowData();
  }, [projectId]);

  // Observador para animaciones
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Función para agregar un paso
  const handleAddStep = async (newStep) => {
    try {
      // Agregar el paso a la API
      const savedStep = await addWorkflowStep(projectId, newStep);

      // Actualizar el estado local
      setWorkflow((prevWorkflow) => [...prevWorkflow, savedStep]);
    } catch (error) {
      console.error("Error al agregar paso:", error);
    }
  };

  // Función para editar un paso
  const handleEditStep = async (stepId, updatedStep) => {
    try {
      // Actualizar el paso en la API
      const updatedStepResponse = await updateWorkflowStep(projectId, stepId, updatedStep);

      // Actualizar el estado local
      setWorkflow((prevWorkflow) =>
        prevWorkflow.map((step) =>
          step.id === stepId ? updatedStepResponse : step
        )
      );
    } catch (error) {
      console.error("Error al editar paso:", error);
    }
  };

  // Función para eliminar un paso
  const handleDeleteStep = async (stepId) => {
    try {
      // Eliminar el paso de la API
      await deleteWorkflowStep(projectId, stepId);

      // Actualizar el estado local
      setWorkflow((prevWorkflow) =>
        prevWorkflow.filter((step) => step.id !== stepId)
      );
    } catch (error) {
      console.error("Error al eliminar paso:", error);
    }
  };

  const imageCount = workflow.filter((step) => step.image).length;

  const renderContent = () => {
    if (imageCount === 0) {
      return (
        <div className="grid md:grid-cols-2 gap-8 text-center">
          <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900">Nuestro Enfoque</h3>
            <p className="text-gray-600">{workflowSubtitle}</p>
          </div>
          <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900">Metodología</h3>
            <p className="text-gray-600">{workflowTitle}</p>
          </div>
        </div>
      );
    }

    if (imageCount === 1) {
      return (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
            <img
              src={workflow[0].image}
              alt={workflow[0].title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-gray-900">{workflow[0].title}</h3>
            <p className="text-gray-600 text-lg">{workflow[0].description}</p>
          </div>
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="grid md:grid-cols-2 gap-8">
          {workflow.slice(0, 2).map((step, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h4 className="text-xl font-bold">
                      <span className="text-white text-2xl font-bold mr-2">
                        {step.step}.
                      </span>
                      {step.title}
                    </h4>
                    <p className="text-sm opacity-90">{step.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <>
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={{
            prevEl: `.${styles.swiperButtonPrev}`,
            nextEl: `.${styles.swiperButtonNext}`,
          }}
          pagination={{
            clickable: true,
            el: `.${styles.swiperPagination}`,
          }}
          loop={workflow.length > 2}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="w-full relative"
        >
          {workflow.map((step, index) => (
            <SwiperSlide key={index}>
              <div className="relative group h-full">
                <div className="relative h-72 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transform transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h4 className="text-xl font-bold">
                        <span className="text-white text-2xl font-bold mr-2">
                          {step.step}.
                        </span>
                        {step.title}
                      </h4>
                      <p className="text-sm opacity-90">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className={`${styles.swiperButtonPrev}`}>
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
            &lt;
          </button>
        </div>
        <div className={`${styles.swiperButtonNext}`}>
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
            &gt;
          </button>
        </div>

        <div className={`${styles.swiperPagination}`}></div>
      </>
    );
  };

  return (
    <section
      ref={sectionRef}
      className={`py-20 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            {workflowTitle}
          </h2>
          <p className="text-gray-600 text-lg md:text-2xl max-w-3xl mx-auto">
            {workflowSubtitle}
          </p>
        </div>

        {renderContent()}
      </div>
    </section>
  );
};

export default WorkflowSection;