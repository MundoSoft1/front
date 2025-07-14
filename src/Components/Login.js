import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import ErrorMessage from './ErrorMessage';
import useFormState from '../hooks/useFormState';
import '../Login.css';
import '../App.css'; 

// Reglas de validación para el formulario
const validationRules = {
  username: [
    (value) => !value ? 'El usuario es requerido' : '',
    (value) => value.length < 3 ? 'El usuario debe tener al menos 3 caracteres' : ''
  ],
  password: [
    (value) => !value ? 'La contraseña es requerida' : '',
    (value) => value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : ''
  ]
};

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  
  // Hook optimizado para formularios
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    formState,
    updateField,
    setFieldTouched,
    resetForm,
    handleSubmit,
    handleChange,
    handleBlur,
    validateForm
  } = useFormState(
    { username: '', password: '' },
    validationRules
  );

  // Función optimizada para manejar login
  const handleLogin = useCallback(async () => {
    const success = await handleSubmit(async (data) => {
      const response = await apiService.login({ 
        correo: data.username, 
        password: data.password 
      });
      
      const userRole = response.rol;
      const token = response.token;

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
    });

    if (!success) {
      // Marcar todos los campos como tocados para mostrar errores
      setFieldTouched('username', true);
      setFieldTouched('password', true);
    }
  }, [handleSubmit, onLogin, navigate, setFieldTouched]);

  // Función optimizada para manejar tecla Enter
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }, [handleLogin]);

  // Función optimizada para reintentar
  const handleRetry = useCallback(() => {
    resetForm();
    handleLogin();
  }, [resetForm, handleLogin]);

  // Función optimizada para descartar error
  const handleDismissError = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // Función optimizada para limpiar formulario
  const handleClearForm = useCallback(() => {
    resetForm();
  }, [resetForm]);

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
            value={formData.username}
            onChange={handleChange('username')}
            onBlur={handleBlur('username')}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
            className={touched.username && errors.username ? 'input-error' : ''}
          />
          {touched.username && errors.username && (
            <span className="error-message">{errors.username}</span>
          )}
        </div>
        
        <div className="input-container">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
            className={touched.password && errors.password ? 'input-error' : ''}
          />
          {touched.password && errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>
        
        {/* Mostrar errores de validación generales */}
        {formState.hasErrors && (
          <div className="validation-errors">
            <p>Por favor, corrige los errores en el formulario</p>
          </div>
        )}
        
        <ErrorMessage 
          error={formState.hasErrors ? 'Errores de validación' : ''}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
          showRetry={formState.hasErrors}
          showDismiss={true}
        />
        
        <div className="button-container">
          <button 
            onClick={handleLogin}
            disabled={isSubmitting || !isValid}
            className={!isValid ? 'button-disabled' : ''}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
          
          <button 
            type="button"
            onClick={handleClearForm}
            disabled={isSubmitting}
            className="button-secondary"
          >
            Limpiar
          </button>
        </div>
        
        {/* Información de estado del formulario */}
        <div className="form-status">
          <p>Campos válidos: {Object.keys(formData).length - formState.errorCount}/{Object.keys(formData).length}</p>
          {isSubmitting && <p>Procesando...</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
