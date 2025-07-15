import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes, faRedo } from '@fortawesome/free-solid-svg-icons';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showRetry = true, 
  showDismiss = true,
  className = '',
  variant = 'error' // 'error', 'warning', 'info'
}) => {
  if (!error) return null;

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return faExclamationTriangle;
      case 'info':
        return faExclamationTriangle;
      default:
        return faExclamationTriangle;
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'warning':
        return 'error-message--warning';
      case 'info':
        return 'error-message--info';
      default:
        return 'error-message--error';
    }
  };

  return (
    <div className={`error-message ${getVariantClass()} ${className}`}>
      <div className="error-message__content">
        <FontAwesomeIcon 
          icon={getIcon()} 
          className="error-message__icon" 
        />
        <div className="error-message__text">
          <p className="error-message__title">
            {variant === 'warning' ? 'Advertencia' : 
             variant === 'info' ? 'Información' : 'Error'}
          </p>
          <p className="error-message__description">{error}</p>
        </div>
      </div>
      
      <div className="error-message__actions">
        {showRetry && onRetry && (
          <button 
            className="error-message__retry-btn"
            onClick={onRetry}
            title="Reintentar"
          >
            <FontAwesomeIcon icon={faRedo} />
            <span>Reintentar</span>
          </button>
        )}
        
        {showDismiss && onDismiss && (
          <button 
            className="error-message__dismiss-btn"
            onClick={onDismiss}
            title="Cerrar"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 