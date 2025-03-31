import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";
import { getFeatures, getStats, getProjectExtras } from "../../../api";
import {
  faEdit,
  faTrash,
  faTrophy,
  faStar,
  faChartBar,
  faCompress,
  faExpand,
  faPause,
  faPlay,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";

// Mapeo de iconos para las estadísticas
const iconMap: Record<string, any> = {
  FiZap: faStar, // 🔹 Mapea correctamente FiZap a faStar
  Chart: faChartBar,
  Trophy: faTrophy,
};

interface Feature {
  id: number;
  title: string;
  subtitle: string;

  stat: string;
  media_type: string;
  media_url: string;
}

interface Extra {
  id: number;
  title: string;
  stat?: string;
  description?: string;
}

interface Stat {
  id: number;
  icon_key: string;
  title: string;
  text: string;
}

interface FeaturesSectionProps {
  projectId?: number;
  onEdit: (featureId: number) => void;
  onDelete: (featureId: number) => void;
}

export const FeaturesSection = ({ projectId, onEdit, onDelete }: FeaturesSectionProps) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [featuresVideoUrl, setFeaturesVideoUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof projectId === "number" && !isNaN(projectId)) {
      fetchData();
    } else {
      console.error("❌ projectId no válido o no recibido:", projectId);
    }
  }, [projectId]);

  const fetchData = async () => {
    try {
      if (!projectId || isNaN(projectId)) throw new Error("ID de proyecto inválido");

      const featuresData = await getFeatures(projectId);
      const extrasData = await getProjectExtras(projectId);
      const statsData = await getStats(projectId);

      setFeatures(featuresData);
      setExtras(extrasData);
      setStats(statsData);

      // Obtener el primer video disponible
      const videoFeature = featuresData.find((feature) => feature.media_type === "video");
      if (videoFeature) {
        setFeaturesVideoUrl(videoFeature.media_url);
      }
    } catch (error) {
      console.error("❌ Error al obtener datos:", error);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <section className="py-10 bg-white" id="caracteristicas">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <motion.h3
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Características del Proyecto
          </motion.h3>
        </div>

        {!projectId || isNaN(projectId) ? (
          <p className="text-red-500 text-center font-bold">
            ❌ Error: No se pudo cargar la información del proyecto.
          </p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 🟢 SECCIÓN DE CARACTERÍSTICAS */}
            <div className="space-y-8">
              <AnimatePresence>
                {features.length === 0 ? (
                  <p className="text-gray-500 text-center">No hay características registradas.</p>
                ) : (
                  features.map((feature) => (
                    <motion.div
                      key={feature.id}
                      className="group flex flex-col space-y-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 transition-all duration-300 cursor-pointer"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      {user?.role === "admin" && (
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => onEdit(feature.id)}
                            className="p-1 hover:text-blue-600"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => onDelete(feature.id)}
                            className="p-1 hover:text-red-600"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-50 p-3 rounded-lg group-hover:bg-purple-100 transition-colors">
                          <span className="text-[var(--color-primario)] text-xl font-semibold">
                            {feature.subtitle}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                            {feature.title}
                          </h4>
                      
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* 🟢 SECCIÓN DEL VIDEO */}
            <motion.div
              className="relative w-full max-w-4xl mt-24 mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {featuresVideoUrl ? (
                <div className="relative h-[420px] w-full rounded-2xl overflow-hidden shadow-lg group transform hover:scale-[0.98] transition-transform duration-500">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    src={featuresVideoUrl}
                  >
                    Tu navegador no soporta videos HTML5.
                  </video>

                  {/* Overlay y Controles Personalizados */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent flex items-end p-6">
                    <div className="w-full flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlayPause}
                          className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={isPlaying ? faPause : faPlay}
                            className="w-6 h-6 text-white"
                          />
                        </button>
                        <button
                          onClick={toggleMute}
                          className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={isMuted ? faVolumeMute : faVolumeUp}
                            className="w-6 h-6 text-white"
                          />
                        </button>
                      </div>
                      <button
                        onClick={toggleFullscreen}
                        className="bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={isFullscreen ? faCompress : faExpand}
                          className="w-6 h-6 text-white"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center">No hay videos disponibles.</p>
              )}

              {/* 🟢 SECCIÓN DE ESTADÍSTICAS */}
              <div className="flex justify-center gap-8 mt-6">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="text-center flex-1 flex flex-col items-center"
                  >
                    <div className="bg-gray-50 text-primario p-3 rounded-xl inline-block hover:bg-gray-100 transition-colors">
                      <FontAwesomeIcon icon={iconMap[stat.icon_key] || faChartBar} className="text-3xl" />
                    </div>
                    <p className="text-gray-700 mt-2 text-lg flex-grow">
                      {stat.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};