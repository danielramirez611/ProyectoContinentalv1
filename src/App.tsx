// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import ProjectPage from './pages/ProyectPage';
import { useAuth } from './context/AuthContext';
import GridPage from './pages/GridPage';
import ComponentePrueba from './components/ComponentePrueba';
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GridPage />} />
        <Route
          path="/project/:id"
          element={
              <ProjectPage />
          }
        />
        <Route
          path="/login"
          element={
              <Login />
          }
        />
        <Route
          path="/prueba"
          element={
              <ComponentePrueba />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
       

        
      </Routes>
    </Router>
  );
};

export default App;