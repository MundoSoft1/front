import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  // Verificar si el usuario está autenticado
  const isAuthenticated = authService.isAuthenticated();
  
  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico, verificarlo
  if (requiredRole) {
    const userRole = authService.getUserRole();
    if (userRole !== requiredRole) {
      // Redirigir según el rol del usuario
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/contenido" replace />;
      }
    }
  }

  // Si todo está bien, renderizar el contenido
  return children;
};

export default ProtectedRoute; 