// components/ODSSelectorModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGlobeAmericas,
  FaUserShield,
  FaHandHoldingHeart,
  FaBook,
  FaVenus,
  FaTint,
  FaSolarPanel,
  FaBriefcase,
  FaIndustry,
  FaBalanceScale,
  FaCity,
  FaRecycle,
  FaLeaf,
  FaFish,
  FaPeace,
  FaHandshake,
    
} from "react-icons/fa";
import {  FiX, FiCheck } from "react-icons/fi";

export const ODS_CATEGORIES = [
  { 
    id: 1,
    title: "Fin de la pobreza",
    icon: <FaHandHoldingHeart className="text-3xl" />,
    color: "#E5243B"
  },
  {
    id: 2,
    title: "Hambre cero",
    icon: <FaLeaf className="text-3xl" />,
    color: "#DDA63A"
  },
  {
    id: 3,
    title: "Salud y bienestar",
    icon: <FaUserShield className="text-3xl" />,
    color: "#4C9F38"
  },
  {
    id: 4,
    title: "Educación de calidad",
    icon: <FaBook className="text-3xl" />,
    color: "#C5192D"
  },
  {
    id: 5,
    title: "Igualdad de género",
    icon: <FaVenus className="text-3xl" />,
    color: "#FF3A21"
  },
  {
    id: 6,
    title: "Agua limpia y saneamiento",
    icon: <FaTint className="text-3xl" />,
    color: "#26BDE2"
  },
  {
    id: 7,
    title: "Energía asequible y no contaminante",
    icon: <FaSolarPanel className="text-3xl" />,
    color: "#FCC30B"
  },
  {
    id: 8,
    title: "Trabajo decente y crecimiento económico",
    icon: <FaBriefcase className="text-3xl" />,
    color: "#A21942"
  },
  {
    id: 9,
    title: "Industria, innovación e infraestructura",
    icon: <FaIndustry className="text-3xl" />,
    color: "#FD6925"
  },
  {
    id: 10,
    title: "Reducción de las desigualdades",
    icon: <FaBalanceScale className="text-3xl" />,
    color: "#DD1367"
  },
  {
    id: 11,
    title: "Ciudades y comunidades sostenibles",
    icon: <FaCity className="text-3xl" />,
    color: "#FD9D24"
  },
  {
    id: 12,
    title: "Producción y consumo responsables",
    icon: <FaRecycle className="text-3xl" />,
    color: "#BF8B2E"
  },
  {
    id: 13,
    title: "Acción por el clima",
    icon: <FaGlobeAmericas className="text-3xl" />,
    color: "#3F7E44"
  },
  {
    id: 14,
    title: "Vida submarina",
    icon: <FaFish className="text-3xl" />,
    color: "#0A97D9"
  },
  {
    id: 15,
    title: "Vida de ecosistemas terrestres",
    icon: <FaLeaf className="text-3xl" />,
    color: "#56C02B"
  },
  {
    id: 16,
    title: "Paz, justicia e instituciones sólidas",
    icon: <FaPeace className="text-3xl" />,
    color: "#00689D"
  },
  {
    id: 17,
    title: "Alianzas para lograr los objetivos",
    icon: <FaHandshake className="text-3xl" />,
    color: "#19486A"
  }
];

interface ODSSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ods: typeof ODS_CATEGORIES[number]) => void;
  mode?: 'filter' | 'create'; // Nuevo prop para diferenciar el modo
  selectedODSs?: number[]; // Solo necesario en modo filtro
  onApplyFilters?: () => void; // Solo necesario en modo filtro
  onClearFilters?: () => void
}

export const ODSSelectorModal = ({ 
  isOpen, 
  onClose, 
  onSelect,
  onClearFilters,
  mode = 'create', // Valor por defecto
  selectedODSs = [],
  onApplyFilters
}: ODSSelectorModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {mode === 'filter' 
                ? 'Filtrar por Objetivos de Desarrollo Sostenible' 
                : 'Seleccionar ODS'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ODS_CATEGORIES.map((ods) => (
              <motion.button
                key={ods.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(ods)}
                className={`p-4 rounded-lg flex flex-col items-center text-center 
                         transition-all border-2 ${
                           mode === 'filter' && selectedODSs.includes(ods.id)
                             ? "bg-gray-100"
                             : "hover:bg-gray-50"
                         }`}
                style={{ 
                  borderColor: ods.color,
                  backgroundColor: mode === 'filter' && selectedODSs.includes(ods.id) 
                    ? `${ods.color}20` 
                    : 'transparent'
                }}
              >
                <div
                  className="mb-2 p-2 rounded-full"
                  style={{ color: ods.color }}
                >
                  {ods.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {ods.title}
                </span>
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <span className="mr-1">ODS {ods.id}</span>
                  {mode === 'filter' && selectedODSs.includes(ods.id) && (
                    <FiCheck className="text-green-500" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {mode === 'filter' && (
            <div className="mt-6 flex justify-end gap-3">
              <button
               onClick={() => {
                onClearFilters?.(); 
                onClose();
              }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Limpiar filtros
              </button>
              <button
                onClick={() => {
                  onApplyFilters?.();
                  onClose();
                }}
                className="px-6 py-2 bg-[var(--color-primario)] text-white rounded-lg hover:bg-[#5a2fc2] transition"
              >
                Aplicar Filtros
              </button>
            </div>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);