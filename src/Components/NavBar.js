import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css"; // Importa el CSS global que incluye estilos para Navbar
import logo from '../img/Logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login'); 
  };

  const handleLoginRedirect = () => {
    navigate('/login'); 
  };

  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="navbar-logo" />
      <h1 className="navbar-title">THE VIGILANT</h1>
      <div className="navbar-actions">
        <button className="login-button" onClick={handleLoginRedirect}>
          Iniciar sesión
        </button>
        <div className="logout-icon" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
