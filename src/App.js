import React, { useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/NavBar';
import Content from './Components/Contenido'; 
import Hablar from './Components/Hablar';
import Monitorear from './Components/Monitorear';
import Llave from './Components/Llave';
import AdminDashboard from './Components/AdminDashboard';
import Login from './Components/Login';
import ProtectedRoute from './Components/ProtectedRoute';
import LoadingSpinner from './Components/LoadingSpinner';
import useAuth from './hooks/useAuth';
import { GlobalStateProvider } from './hooks/useGlobalState';
import './App.css';
import './Login.css';

function AppContent() {
  const { isAuthenticated, userRole, isLoading, login, logout } = useAuth();

  // Función optimizada para manejar login
  const handleLogin = useCallback((token, role) => {
    login(token, role);
  }, [login]);

  // Función optimizada para manejar logout
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Estado calculado para rutas
  const routeConfig = useMemo(() => {
    if (isLoading) {
      return { shouldShowLoading: true };
    }

    if (isAuthenticated) {
      return {
        shouldShowLoading: false,
        defaultRoute: '/contenido',
        loginRoute: '/contenido'
      };
    }

    return {
      shouldShowLoading: false,
      defaultRoute: '/login',
      loginRoute: '/login'
    };
  }, [isAuthenticated, isLoading]);

  // Mostrar loading mientras se verifica la autenticación
  if (routeConfig.shouldShowLoading) {
    return <LoadingSpinner message="Verificando sesión..." />;
  }

  return (
    <Router>
      <div>
        <Navbar onLogout={handleLogout} isLoggedIn={isAuthenticated} />
        <Routes>
          {/* Ruta raíz - redirigir según autenticación */}
          <Route 
            path="/" 
            element={
              <Navigate to={routeConfig.defaultRoute} replace />
            } 
          />
          
          {/* Ruta de login */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to={routeConfig.loginRoute} replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          
          {/* Rutas protegidas */}
          <Route 
            path="/contenido" 
            element={
              <ProtectedRoute>
                <Content />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/hablar" 
            element={
              <ProtectedRoute>
                <Hablar />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/monitorear" 
            element={
              <ProtectedRoute>
                <Monitorear />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/llave" 
            element={
              <ProtectedRoute>
                <Llave />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta de admin - requiere rol admin */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta catch-all - redirigir a login */}
          <Route 
            path="*" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <GlobalStateProvider>
      <AppContent />
    </GlobalStateProvider>
  );
}

export default App;
