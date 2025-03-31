// src/components/proyect/HeroSection.tsx
import { motion } from "framer-motion";
import { useState } from "react";
import {useNavigate} from "react-router-dom"
import { FiEdit, FiImage, FiUpload } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import Modal from "../common/Modal"; // Asume que tienes un componente Modal genérico
interface HeroSectionProps {
  title: string;
  description: string;
  image: string;
}
const HeroSection: React.FC<HeroSectionProps> = ({ title, description, image }) => {
  const { user } = useAuth();
  const navigate = useNavigate()
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [localImage, setLocalImage] = useState<File | null>(null);
  
  const handleProject = () => {
    navigate("/grilla")
  };

  const handleSaveBackgroundImage = () => {
    if (localImage) {
      const imageUrl = URL.createObjectURL(localImage);
    }
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLocalImage(e.target.files[0]);
    }
  };

  return (
    <section
      id="hero"
      className="relative h-[100vh] flex items-center justify-start text-left text-white overflow-hidden px-5"
    >
      {/* Fondo de la imagen */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${image})` }}
      ></div>

      {/* Overlay para mejorar la legibilidad */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-1"></div>

    

      {/* Contenido del Hero */}
      <motion.div
        className="relative z-10 max-w-4xl px-6 flex flex-col items-start space-y-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Título editable */}
        <div className="relative group">
          {isEditingTitle && user?.role === "admin" ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditingTitle(false);
              }}
              className="text-7xl md:text-8xl font-black mb-4 leading-tight bg-transparent border-b-2 border-white outline-none w-full"
              autoFocus
            />
          ) : (
            <motion.h1
              className="text-7xl md:text-8xl font-black mb-4 leading-tight cursor-pointer hover:opacity-80 transition-opacity"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              onClick={() => user?.role === "admin" && setIsEditingTitle(true)}
            >
              {title}
            </motion.h1>
          )}
          {user?.role === "admin" && (
            <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <FiEdit className="text-white text-2xl cursor-pointer" />
            </div>
          )}
        </div>

        {/* Descripción editable */}
        <div className="relative group">
          {isEditingDescription && user?.role === "admin" ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setIsEditingDescription(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey === false) {
                  e.preventDefault();
                  setIsEditingDescription(false);
                }
              }}
              className="text-2xl md:text-3xl h-[25vh] mb-8 max-w-2xl bg-transparent border-b-2 border-white outline-none resize-none w-[700px]"
              rows={3}
              autoFocus
            />
          ) : (
            <motion.p
              className="text-2xl md:text-3xl mb-8 max-w-2xl cursor-pointer hover:opacity-80 transition-opacity"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1 }}
              onClick={() => user?.role === "admin" && setIsEditingDescription(true)}
            >
              {description}
            </motion.p>
          )}
          {user?.role === "admin" && (
            <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <FiEdit className="text-white text-2xl cursor-pointer" />
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <motion.div
          className="flex space-x-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <button onClick={handleProject} className="bg-[var(--color-primario)] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#5a2fc2] transition">
            Ver Proyectos
          </button>
          <button className="bg-transparent border-2 border-[var(--color-primario)] text-[var(--color-primario)] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[var(--color-primario)] hover:text-white transition">
            Contactar
          </button>
        </motion.div>
      </motion.div>

      {/* Modal para editar la imagen de fondo */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Cambiar imagen de fondo</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="sr-only">Seleccionar archivo</span>
              <div className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                <FiUpload className="text-gray-500 text-2xl mr-2" />
                <span className="text-gray-700">
                  {localImage ? localImage.name : "Arrastra o selecciona una imagen"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </label>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBackgroundImage}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default HeroSection;