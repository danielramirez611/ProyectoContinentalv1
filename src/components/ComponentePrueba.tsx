import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const animationConfig = {
  baseSpring: { type: "spring", stiffness: 180, damping: 15 },
  smoothTransition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
  fadeScale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  }
};

const ComponentePrueba = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const typingVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { 
        delay: i * 0.05 + 0.3,
        type: "spring",
        stiffness: 150,
        damping: 12
      }
    })
  };

  const buttonVariants = {
    initial: { 
      scale: 1,
      background: "linear-gradient(45deg, #6802C1 0%, #8C32FF 100%)"
    },
    tap: { scale: 0.95 },
    submitting: {
      scale: [1, 0.98, 0.96],
      background: "linear-gradient(45deg, #4a1d8c 0%, #6c1de4 100%)",
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: { 
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const validateForm = (formData: { [key: string]: string }) => {
    const errors: { [key: string]: string } = {};

    if (!formData.nombre) {
      errors.nombre = "El nombre es requerido";
    }

    if (!formData.email) {
      errors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El correo electrónico no es válido";
    }

    if (!formData.mensaje) {
      errors.mensaje = "El mensaje es requerido";
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formValues = Object.fromEntries(formData.entries()) as { [key: string]: string };

    const errors = validateForm(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }, 3000);
  };

  return (
    <section id="contacto" className="py-24 bg-[#F8F8F8] relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Sección de texto */}
          <div className="text-center lg:text-left">
            <motion.h3
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 relative"
            >
              {"¡Hablemos!".split("").map((char, i) => (
                <motion.span
                  key={i}
                  variants={typingVariants}
                  custom={i}
                  className="inline-block hover:scale-110 transition-transform"
                  whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...animationConfig.smoothTransition, delay: 1 }}
              className="text-[var(--color-primario)] text-xl md:text-4xl mb-8"
              whileHover={{ x: 10 }}
            >
              ¿Listo para llevar tu proyecto al siguiente nivel?
            </motion.p>

            <motion.div
              className="flex justify-center lg:justify-start"
              whileHover={{ scale: 1.05 }}
            >
              <motion.a
                href="mailto:info@algunlado.com"
                className="text-2xl bg-gradient-to-r rounded-full from-[#6802C1] to-[#8C32FF] text-white px-8 py-4 font-medium inline-block relative overflow-hidden"
                whileHover={{ 
                  scale: 1.05,
                  background: "linear-gradient(45deg, #8C32FF 0%, #6802C1 100%)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">info@algunlado.com</span>
              </motion.a>
            </motion.div>
          </div>

          {/* Formulario */}
          <div className="bg-white p-8 sm:p-10 shadow-2xl relative">
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {['nombre', 'email', 'mensaje'].map((field, index) => (
                <motion.div
                  key={field}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: 0.8 + index * 0.15,
                        ...animationConfig.baseSpring
                      }
                    }
                  }}
                  className="space-y-3 relative"
                >
                  <label
                    htmlFor={field}
                    className="text-xl font-medium text-gray-900"
                  >
                    {{
                      nombre: 'Nombre Completo',
                      email: 'Correo Electrónico',
                      mensaje: 'Tu Mensaje'
                    }[field]}
                  </label>
                  {field === 'mensaje' ? (
                    <motion.textarea
                      id={field}
                      name={field}
                      rows={6}
                      className="w-full px-5 py-4 bg-white border-2 border-gray-200 focus:border-[var(--color-primario)] focus:outline-none transition-all text-lg placeholder-gray-500 resize-none"
                      placeholder="Escribe tu mensaje aquí..."
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 10px 30px rgba(104, 2, 193, 0.2)"
                      }}
                      whileHover={{ 
                        y: -5,
                        boxShadow: "0 15px 30px rgba(104, 2, 193, 0.1)"
                      }}
                    />
                  ) : (
                    <motion.input
                      type={field === 'email' ? 'email' : 'text'}
                      id={field}
                      name={field}
                      className="w-full px-5 py-4 bg-white border-2 border-gray-200 focus:border-[var(--color-primario)] focus:outline-none transition-all text-lg placeholder-gray-500"
                      placeholder={field === 'email' ? 'tucorreo@ejemplo.com' : 'Ingresa tu nombre'}
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 10px 30px rgba(104, 2, 193, 0.2)"
                      }}
                      whileHover={{ 
                        y: -5,
                        boxShadow: "0 15px 30px rgba(104, 2, 193, 0.1)"
                      }}
                    />
                  )}
                  {formErrors[field] && (
                    <motion.p
                      className="text-red-500 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {formErrors[field]}
                    </motion.p>
                  )}
                </motion.div>
              ))}

              <motion.button
                type="submit"
                variants={buttonVariants}
                initial="initial"
                whileTap="tap"
                animate={isSubmitting && !showSuccess ? "submitting" : "initial"}
                className="w-full mt-8 text-white px-6 rounded-full py-4 font-medium text-xl relative overflow-hidden"
                disabled={isSubmitting || showSuccess}
              >
                <div className="relative z-10">
                  <AnimatePresence mode="wait">
                    {isSubmitting && !showSuccess ? (
                      <motion.div
                        key="spinner"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="h-6 w-6 border-2 border-white rounded-full border-t-transparent mx-auto"
                      />
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {showSuccess ? "Mensaje Enviado" : "Enviar Mensaje"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </form>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 p-6 bg-green-100 border-2 border-green-400 text-green-700 text-center relative overflow-hidden"
                  transition={{ ...animationConfig.smoothTransition }}
                >
                  <motion.svg
                    className="w-12 h-12 mx-auto mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <motion.circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                    <motion.path
                      d="M8 12L11 15L16 9"
                      variants={checkmarkVariants}
                      initial="hidden"
                      animate="visible"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                  
                  <p className="text-xl font-medium">¡Mensaje enviado con éxito!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComponentePrueba;