// HeroGrid.tsx
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ReactNode, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faTimes,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

interface HeroSectionProps {
  title: string;
  description: string;
  backgroundImage: string;
  ctaButtons?: ReactNode;
  isAdmin?: boolean;
  onSave?: (newData: { title: string; description: string; image: string }) => void;
}

export const HeroGrid = ({
  title,
  description,
  backgroundImage,
  ctaButtons,
  isAdmin = false,
  onSave,
}: HeroSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(title);
  const [updatedDescription, setUpdatedDescription] = useState(description);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      // Simular carga de imagen
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (updatedTitle.trim() && updatedDescription.trim()) {
      onSave?.({
        title: updatedTitle,
        description: updatedDescription,
        image: imagePreview || backgroundImage,
      });
      setIsEditing(false);
    } else {
      // Animación de error en caso de campos vacíos
      document.querySelectorAll(".hero-edit-input").forEach((input) => {
        if (!(input as HTMLInputElement).value) {
          input.parentElement?.classList.add("animate-shake");
          setTimeout(
            () => input.parentElement?.classList.remove("animate-shake"),
            500
          );
        }
      });
    }
  };

  /* 
   * Variants para un contenedor principal, 
   * para lograr una animación de stagger (retardo secuencial) 
   * en los elementos hijos.
   */
  const containerVariants = {
    hidden: { opacity: 1 }, // puede estar visible pero con hijos ocultos
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25, // retardo al mostrar cada hijo
      },
    },
  };

  // Variants para el fondo: fade + scale in
  const backgroundVariants = {
    hidden: { opacity: 0, scale: 1.2 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  // Variants para el texto (título, descripción): 
  // un poquito de rotación y fade in, para más impacto
  const itemVariants = {
    hidden: { opacity: 0, y: 80, rotate: -3 },
    show: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -40 },
  };

  return (
    <section className="relative h-screen flex items-center justify-start text-left text-white overflow-hidden px-4">
      {/* Capa de fondo con animación de escala */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('${imagePreview || backgroundImage}')` }}
        variants={backgroundVariants}
        initial="hidden"
        animate="show"
      >
        {isAdmin && (
          <motion.label
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 cursor-pointer transition-opacity"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={!isEditing}
            />
            <motion.div
              animate={isUploading ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl"
            >
              {isUploading ? (
                <div className="w-8 h-8 border-4 border-white/50 border-t-white rounded-full" />
              ) : (
                <FontAwesomeIcon icon={faUpload} className="text-4xl opacity-75" />
              )}
            </motion.div>
          </motion.label>
        )}
      </motion.div>

      {/* Overlay semi-transparente */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      <LayoutGroup>
        {/* Contenedor principal: stagger en hijos */}
        <motion.div
          className="relative z-20 max-w-4xl px-4 md:px-6 flex flex-col items-start space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          layout
        >
          {/* Botones de edición (admin) */}
          {isAdmin && (
            <motion.div
              className="flex gap-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg"
                  onClick={() => setIsEditing(true)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-green-500/80 backdrop-blur-sm rounded-lg"
                    onClick={handleSave}
                  >
                    <FontAwesomeIcon icon={faSave} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg"
                    onClick={() => setIsEditing(false)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isEditing ? (
              // Título editable
              <motion.div
                key="edit-title"
                initial="hidden"
                animate="show"
                exit="exit"
                variants={itemVariants}
                className="w-full"
              >
                <input
                  value={updatedTitle}
                  onChange={(e) => setUpdatedTitle(e.target.value)}
                  className="hero-edit-input w-full bg-transparent text-5xl md:text-7xl xl:text-8xl font-black border-b-2 border-white/50 focus:outline-none focus:border-white"
                />
              </motion.div>
            ) : (
              // Título normal
              <motion.h1
                key="title"
                className="text-5xl md:text-7xl xl:text-8xl font-black leading-tight"
                initial="hidden"
                animate="show"
                exit="exit"
                variants={itemVariants}
              >
                {updatedTitle}
              </motion.h1>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isEditing ? (
              // Descripción editable
              <motion.div
                key="edit-desc"
                initial="hidden"
                animate="show"
                exit="exit"
                variants={itemVariants}
                className="w-full"
              >
                <textarea
                  value={updatedDescription}
                  onChange={(e) => setUpdatedDescription(e.target.value)}
                  className="hero-edit-input w-full bg-transparent text-xl md:text-2xl border-b-2 border-white/50 focus:outline-none focus:border-white resize-none"
                  rows={3}
                />
              </motion.div>
            ) : (
              // Descripción normal
              <motion.p
                key="description"
                className="text-xl md:text-2xl max-w-2xl"
                initial="hidden"
                animate="show"
                exit="exit"
                variants={itemVariants}
              >
                {updatedDescription}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Botones de Call To Action */}
          {ctaButtons && (
            <motion.div
              className="flex flex-col md:flex-row gap-4"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={itemVariants}
            >
              {ctaButtons}
            </motion.div>
          )}
        </motion.div>
      </LayoutGroup>
    </section>
  );
};
