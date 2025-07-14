import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import ErrorMessage from './ErrorMessage';
import '../Login.css';
import '../App.css'; 

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await apiService.login({ correo: username, password });
      const userRole = data.rol;
      const token = data.token;

      // Notificar al componente padre con token y rol
      onLogin(token, userRole);
      
      // Redirigir según el rol
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'user') {
        navigate('/contenido');
      } else {
        throw new Error('Rol de usuario no válido');
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleRetry = () => {
    setError('');
    handleLogin();
  };

  const handleDismissError = () => {
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">Iniciar Sesión</h2>
        
        <div className="input-container">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            placeholder="Ingresa tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>
        
        <div className="input-container">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>
        
        <ErrorMessage 
          error={error}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
          showRetry={true}
          showDismiss={true}
        />
        
        <div className="button-container">
          <button 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
