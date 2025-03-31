import * as AllIcons from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  odsIcon: string;
  odsColor: string;
  onClick?: () => void;
}

const DynamicIcon = ({
  name,
  color,
  size,
}: {
  name: string;
  color: string;
  size?: number;
}) => {
  const IconComponent = (AllIcons as any)[name];
  return IconComponent ? <IconComponent color={color} size={size} /> : null;
};

export const ProjectCard = ({
  title,
  category,
  image,
  odsIcon,
  odsColor,
  onClick,
}: ProjectCardProps) => {
  return (
    <div
      // Contenedor principal “tipo Netflix”
      // Se agranda (scale) al hacer hover
      className="
        group relative w-full rounded-xl aspect-[4/3] overflow-hidden
        shadow-md bg-gray-100 cursor-pointer
        transition-transform duration-300
        hover:scale-105 hover:z-20
      "
      onClick={onClick}
    >
      {/* Imagen de fondo con “zoom” adicional al hover */}
      <img
        src={image}
        alt={title}
        className="
          w-full h-full object-cover
          transition-transform duration-300
          group-hover:scale-110
        "
      />

      {/* Capa oscura, aparece al hover */}
      <div
        className="
          absolute inset-0 bg-black/50 
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          z-10
        "
      />

      {/* Contenido */}
      <div
        className="
          absolute inset-0 z-20 p-4 flex flex-col justify-between 
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-300
        "
      >
        {/* Título, categoría e ícono */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <p className="text-gray-200 text-sm">{category}</p>
          </div>
          <div className="bg-white/90 p-2 rounded-full shadow">
            <DynamicIcon name={odsIcon} color={odsColor} size={24} />
          </div>
        </div>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            className="
              flex items-center gap-2 px-4 py-2 
              bg-white/90 text-gray-900 hover:bg-white 
              transition rounded-full text-sm font-medium shadow
            "
          >
            Ver Proyecto <FaArrowRight className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
};
