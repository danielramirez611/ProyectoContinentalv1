import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-[#6802C1] py-12 text-white">
      <div className="container mx-auto px-4 text-center">
        {/* Iconos de redes sociales */}
        <div className="flex justify-center space-x-8 mb-6">
          <a
            href="#"
            className="text-white hover:text-gray-200 transition-colors text-2xl"
          >
            <FontAwesomeIcon icon={faFacebook} />
          </a>
          <a
            href="#"
            className="text-white hover:text-gray-200 transition-colors text-2xl"
          >
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a
            href="#"
            className="text-white hover:text-gray-200 transition-colors text-2xl"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a
            href="#"
            className="text-white hover:text-gray-200 transition-colors text-2xl"
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
          <a
            href="#"
            className="text-white hover:text-gray-200 transition-colors text-2xl"
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>

        {/* Texto de derechos reservados */}
        <p className="text-gray-100 text-lg font-light mb-2">
          &copy; 2025 FabLab UC - Todos los derechos reservados
        </p>

        {/* Texto de desarrollo */}
        <p className="text-gray-200 text-sm font-light">
          Desarrollado con <span className="text-red-400">❤️</span> por el equipo de innovación
        </p>
      </div>
    </footer>
  );
};

export default Footer;