import { useState, useEffect } from 'react';
import authService from '../services/authService';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Verificar estado de autenticación
  const checkAuthStatus = () => {
    const authenticated = authService.isAuthenticated();
    const role = authService.getUserRole();
    const token = authService.getToken();

    if (authenticated && token && role) {
      // Verificar si el token no ha expirado
      if (!authService.isTokenExpired()) {
        setIsAuthenticated(true);
        setUserRole(role);
      } else {
        // Token expirado, hacer logout automático
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUserRole('');
    }
    
    setIsLoading(false);
  };

  // Login
  const login = (token, role) => {
    authService.setSession(token, role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  // Logout
  const logout = () => {
    authService.logoutWithoutRedirect();
    setIsAuthenticated(false);
    setUserRole('');
  };

  // Logout con redirección
  const logoutWithRedirect = () => {
    authService.logout();
  };

  // Verificar estado inicial
  useEffect(() => {
    checkAuthStatus();
    
    // Escuchar eventos de logout de otras pestañas
    const removeListener = authService.listenForLogoutEvents(() => {
      setIsAuthenticated(false);
      setUserRole('');
    });

    return () => {
      removeListener();
    };
  }, []);

  return {
    isAuthenticated,
    userRole,
    isLoading,
    login,
    logout,
    logoutWithRedirect,
    checkAuthStatus
  };
};

export default useAuth; 