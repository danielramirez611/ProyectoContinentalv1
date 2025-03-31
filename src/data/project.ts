import { FiSmile, FiStar, FiHeart, FiCode, FiCamera, FiZap, FiCloud, FiSun } from "react-icons/fi";

// 🔹 **Mapa de íconos para referencia**
export const iconMap = {
  FiSmile,
  FiStar,
  FiHeart,
  FiCode,
  FiCamera,
  FiZap,
  FiCloud,
  FiSun,
};

export type IconKey = keyof typeof iconMap;

// 🔹 **Interfaz para Ventajas**
export interface Advantage {
  id: number;
  project_id: number;
  section_title?: string;  // ✅ Nuevo campo: Título de la sección de ventajas
  section_subtitle?: string; // ✅ Nuevo campo: Subtítulo de la sección de ventajas
  title: string;
  description: string;
  icon: string; // URL o nombre del ícono
  stat: string; // Estadística
}

// 🔹 **Interfaz para Características**
export interface Feature {
  id?: number;
  project_id: number;
  icon_key: string; // Clave del ícono (ej: "FiSmile")
  title: string;
  media?: string; // URL de imagen o video
  media_type: "image" | "video"; // Tipo de media
}

// 🔹 **Interfaz para Íconos Técnicos**
export interface TechnicalIcon {
  id?: number;
  project_id: number;
  icon: string; // Clave del ícono o URL de imagen
  text: string;
  type: "icon" | "image"; // Tipo: ícono o imagen
}

// 🔹 **Interfaz para Pasos del Flujo de Trabajo**
export interface WorkflowStep {
  id?: number;
  project_id: number;
  step: number; // Número del paso (ej: 1, 2, 3)
  title: string;
  description: string;
  image?: string; // URL de la imagen
}

// 🔹 **Interfaz para Miembros del Equipo**
export interface TeamMember {
  id?: number;
  project_id: number;
  name: string;
  role: string;
  bio: string;
  avatar: string; // URL del avatar
}
// 🔹 Investigación asociada al proyecto
export interface ProjectResearch {
  id?: number;
  project_id: number;
  title: string;
  link: string;
  copyright?: string;
}

// 🔹 Impacto del proyecto
export interface ProjectImpact {
  id?: number;
  project_id: number;
  title: string;
  description: string;
  image_url?: string;
}

// 🔹 **Interfaz para Estadísticas**
export interface Stat {
  id?: number;
  project_id: number;
  icon: string; // Ícono representado como string
  text: string; // Texto de la estadística
}

// 🔹 **Interfaz para Archivos Multimedia**
export interface MediaFile {
  id?: number;
  project_id: number;
  file_type: "image" | "video";
  file_url: string; // URL del archivo en `media/`
}

// 🔹 **Interfaz Principal para el Proyecto**
export interface ProjectData {
  id?: number;
  projectName: string;
  projectDescription: string;
  projectImage: string; // Nueva propiedad para la imagen del proyecto
  category: string; // 🔹 Nueva propiedad para la categoría
  section_id: string; // 🔹 Ahora cada proyecto está asociado a una sección específica

  // Sección de Ventajas
  advantages: Advantage[];
  showAdvantages: boolean;
  advantagesTitle?: string; // ✅ Nuevo campo para el título de la sección de ventajas
  advantagesSubtitle?: string; // ✅ Nuevo campo para el subtítulo de la sección de ventajas

  // Sección de Características
  features: Feature[];
  technicalIcons: TechnicalIcon[];
  showFeatures: boolean;
  featuresTitle: string;
  featuresSubtitle: string;
  featuresMediaUrl: string; // 🔹 Se renombró para incluir imagen o video
  featuresMediaType: "image" | "video"; // 🔹 Tipo de media: imagen o video

  // Sección de Estadísticas
  stats: Stat[];

  // Sección de Flujo de Trabajo
  workflow: WorkflowStep[];
  showWorkflow: boolean;
  workflowTitle: string;
  workflowSubtitle: string;
  workflowTextLeft?: string;
  workflowTextRight?: string;

  // Sección de Equipo
  team: TeamMember[];
  showTeam: boolean;

  // Sección de Contacto
  contactEmail: string;
  showContact: boolean;

  // Archivos Multimedia
  mediaFiles: MediaFile[];

   // 🔹 Nuevas secciones:
   showImpacto: boolean;                     // Mostrar sección de impacto
   impacto: ProjectImpact[];                // Lista de bloques de impacto
 
   showInvestigacion: boolean;              // Mostrar sección de investigaciones
   investigaciones: ProjectResearch[];      // Lista de investigaciones
}

// 🔹 **Datos Iniciales del Proyecto (Vacío)**
export const initialProjectData: ProjectData = {
  projectName: "",
  projectDescription: "",
  category: "", // 🔹 Agregamos un campo inicial para la categoría
  projectImage: "", // Inicialmente sin imagen
  section_id: "", // 🔹 Se usa `section_id` en lugar de `category`

  // Ventajas
  advantages: [],
  showAdvantages: false,
  advantagesTitle: "", // ✅ Inicializar con cadena vacía
  advantagesSubtitle: "", // ✅ Inicializar con cadena vacía

  // Características
  features: [],
  technicalIcons: [],
  showFeatures: false,
  featuresTitle: "",
  featuresSubtitle: "",
  featuresMediaUrl: "", // ✅ Ahora permite imagen o video
  featuresMediaType: "image", // ✅ Predeterminado a "image"


  // Estadísticas
  stats: [],

  // Flujo de Trabajo
  workflow: [],
  showWorkflow: false,
  workflowTitle: "",
  workflowSubtitle: "",

  // Equipo
  team: [],
  showTeam: false,

  // Contacto
  contactEmail: "",
  showContact: false,

  // Archivos Multimedia
  mediaFiles: [],
  
  // 🔹 Inicializar nuevas secciones
  showImpacto: false,
  impacto: [],
  showInvestigacion: false,
  investigaciones: [],
};
