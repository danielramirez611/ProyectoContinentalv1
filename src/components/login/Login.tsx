import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../api'; // Usa la API real
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';
import { FiUser, FiLock } from 'react-icons/fi';
import { getLastProject } from "../../../api"; // ✅ Importar la función que obtiene el último proyecto

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin, guestLogin } = useAuth();

// 🔹 **Login con credenciales (Administrador)**
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await authLogin(email, password);

    // 🔹 Obtener el último proyecto
    const lastProject = await getLastProject();

    if (lastProject && lastProject.id) {
      navigate(`/project/${lastProject.id}`, { state: { project: lastProject } });
    } else {
      navigate('/grilla'); // Redirigir a la grilla si no hay proyecto
    }
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// 🔹 **Login como Invitado (Rol: User)**
const handleGuestLogin = async () => {
  try {
    guestLogin();
    const lastProject = await getLastProject();

    if (lastProject && lastProject.id) {
      navigate(`/project/${lastProject.id}`, { state: { project: lastProject } });
    } else {
      navigate('/grilla');
    }
  } catch (error) {
    console.error("❌ Error en login como invitado:", error);
    navigate('/grilla');
  }
};
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Bienvenido</h1>
        
        {/* 🔹 Formulario para Administrador */}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <FiUser className={styles.icon} />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <FiLock className={styles.icon} />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>

        {/* 🔹 Botón para Ingreso como Invitado 
        <button 
          onClick={handleGuestLogin} 
          className={`${styles.button} ${styles.guestButton}`}
        >
          Ingresar como Invitado
        </button>
        */}
      </div>
    </div>
  );
};

export default Login;
