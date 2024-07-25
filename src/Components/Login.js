import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Login.css';
import '../App.css'; 

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://54.173.247.52/login', { // URL correcta
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la autenticación: ${errorText}`);
      }

      const data = await response.json();
      const userRole = data.rol;
      const token = data.token;

      // Guarda el token en el almacenamiento local o en el estado de la aplicación
      localStorage.setItem('token', token);
      onLogin(userRole);
      
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'user') {
        navigate('/contenido');
      } else {
        throw new Error('Rol de usuario no válido');
      }
    } catch (error) {
      console.error('Error de autenticación:', error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="input-container">
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="input-container">
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="button-container">
        <button className='rojo' onClick={handleLogin}>Iniciar sesión</button>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default Login;
