import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/NavBar';
import Content from './Components/Contenido'; 
import Hablar from './Components/Hablar';
import Monitorear from './Components/Monitorear';
import Llave from './Components/Llave';
import AdminDashboard from './Components/AdminDashboard';
import Login from './Components/Login'; // Importa el componente Login
import './App.css';  // Importa el CSS global que podría incluir estilos para Navbar
import './Login.css'; // Importa el CSS para el Login

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);  
  const [userRole, setUserRole] = useState('user');    

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
  };

  console.log(isLoggedIn)

  return (
    <Router>
      <div>
        <Navbar onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Navigate to="/contenido" />} />
          <Route path="/contenido" element={<Content />} />
          <Route path="/hablar" element={<Hablar />} />
          <Route path="/monitorear" element={<Monitorear />} />
          <Route path="/llave" element={<Llave />} />
          <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/contenido" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} /> {/* Ruta para Login */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
