import { useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs para evitar infinite loops
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Verificar estado de autenticación optimizado
  const checkAuthStatus = useCallback(() => {
    if (!isMountedRef.current) return;

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
    isInitializedRef.current = true;
  }, []);

  // Login optimizado
  const login = useCallback((token, role) => {
    if (!isMountedRef.current) return;

    authService.setSession(token, role);
    setIsAuthenticated(true);
    setUserRole(role);
    setIsLoading(false);
  }, []);

  // Logout optimizado
  const logout = useCallback(() => {
    if (!isMountedRef.current) return;

    authService.logoutWithoutRedirect();
    setIsAuthenticated(false);
    setUserRole('');
    setIsLoading(false);
  }, []);

  // Logout con redirección optimizado
  const logoutWithRedirect = useCallback(() => {
    authService.logout();
  }, []);

  // Verificar estado inicial solo una vez
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    checkAuthStatus();
    
    // Escuchar eventos de logout de otras pestañas
    const removeListener = authService.listenForLogoutEvents(() => {
      if (isMountedRef.current) {
        setIsAuthenticated(false);
        setUserRole('');
        setIsLoading(false);
      }
    });

    return () => {
      removeListener();
    };
  }, [checkAuthStatus]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
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