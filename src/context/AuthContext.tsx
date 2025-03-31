import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { login as apiLogin, verifySession } from '../../api';
import { User } from '../data/user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  guestLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // 🔹 **Verificar token guardado al iniciar**
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
  
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
  
      if (storedToken !== 'guest-token') {
        verifySession(storedToken)
          .then((data) => {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          })
          .catch((error) => {
            console.error(`❌ Error verificando sesión: ${error.message}`);
            logout(); // Cerrar sesión si el token no es válido
          });
      }
    }
  }, []);
  

  // 🔹 **Función para iniciar sesión (Administrador)**
  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Correo y contraseña son requeridos');
      }
  
      const response = await apiLogin(email, password);
      if (!response.token) {
        throw new Error('No se recibió un token');
      }
  
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user)); // ✅ Guarda el usuario
  
      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      console.error(`❌ Error en login: ${error.message}`);
      throw new Error(error.message || 'Error de autenticación');
    }
  };
  

  // 🔹 **Función para ingresar como Invitado (Sin token)**
  const guestLogin = () => {
    localStorage.setItem('token', 'guest-token'); // 🔹 Usa un marcador en vez de token falso
    setToken('guest-token');
    setUser({
      id: Date.now(),
      name: 'Invitado',
      email: 'guest@example.com',
      role: 'user',
    });
  };

  // 🔹 **Función para cerrar sesión**
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // ✅ También borrar usuario guardado
    setUser(null);
    setToken(null);
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, token, login, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
