import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import "../App.css";
import logo from '../img/Logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function Navbar({ onLogout, isLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Mostrar confirmación antes de hacer logout
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      // Usar el servicio de autenticación para logout seguro
      authService.logout();
      
      // Notificar al componente padre
      onLogout();
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="navbar-logo" />
      <h1 className="navbar-title">THE VIGILANT</h1>
      <div className="navbar-actions">
        {!isLoggedIn ? (
          <button className="login-button" onClick={handleLoginRedirect}>
            Iniciar sesión
          </button>
        ) : (
          <div className="logout-icon" onClick={handleLogout} title="Cerrar sesión">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
