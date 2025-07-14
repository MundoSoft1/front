import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faAddressBook } from '@fortawesome/free-solid-svg-icons';
import useWebSocket from '../hooks/useWebSocket';
import useStateOptimized from '../hooks/useStateOptimized';
import '../App.css';

function Content() {
  // Estados optimizados
  const { state: showImage, setState: setShowImage } = useStateOptimized(false);
  const { state: cameraIP, setState: setCameraIP } = useStateOptimized(null);
  const { state: imageSrc, setState: setImageSrc } = useStateOptimized('');

  // Hook optimizado para WebSocket
  const {
    isConnected,
    isConnecting,
    error: wsError,
    sendMessage
  } = useWebSocket('ws://52.20.121.208', {
    onOpen: () => {
      console.log('WebSocket conectado');
      sendMessage('Hello from client');
    },
    onMessage: (event) => {
      console.log('Received message:', event.data);
      try {
        const message = event.data;
        if (typeof message === 'string' && message.startsWith('Mensaje de RabbitMQ:')) {
          const parts = message.split(': ');
          if (parts.length === 3) {
            const ip = parts[2].trim();
            console.log('Received camera IP:', ip);
            setCameraIP(ip);
          } else {
            console.log('Unexpected message format:', message);
          }
        } else {
          console.log('Received unexpected message format:', message);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  // Función optimizada para actualizar imagen
  const updateImageSource = useCallback(() => {
    const newSrc = cameraIP 
      ? `http://${cameraIP}/capture?${new Date().getTime()}`
      : 'https://via.placeholder.com/640x480.png?text=Waiting+for+camera+IP';
    console.log('Updating image source:', newSrc);
    setImageSrc(newSrc);
  }, [cameraIP, setImageSrc]);

  // Efecto optimizado para manejo de imagen
  useEffect(() => {
    console.log('Effect triggered. showImage:', showImage, 'cameraIP:', cameraIP);
    
    if (!showImage) {
      return;
    }

    // Actualizar imagen inmediatamente
    updateImageSource();

    // Configurar intervalo para actualizaciones periódicas
    const interval = setInterval(updateImageSource, 5000);

    // Cleanup del intervalo
    return () => {
      clearInterval(interval);
    };
  }, [showImage, cameraIP, updateImageSource]);

  // Función optimizada para manejar click en monitor
  const handleMonitorClick = useCallback(() => {
    console.log('Monitor button clicked');
    setShowImage(prevShowImage => {
      console.log('Setting showImage to:', !prevShowImage);
      return !prevShowImage;
    });
  }, [setShowImage]);

  // Función optimizada para manejar error de imagen
  const handleImageError = useCallback((e) => {
    console.error('Error loading image:', e);
    e.target.src = 'https://via.placeholder.com/640x480.png?text=Error+loading+image';
  }, []);

  // URL de imagen calculada con useMemo para optimización
  const currentImageUrl = useMemo(() => {
    if (!showImage) return '';
    return cameraIP 
      ? `http://${cameraIP}/capture?${new Date().getTime()}`
      : 'https://via.placeholder.com/640x480.png?text=Waiting+for+camera+IP';
  }, [showImage, cameraIP]);

  console.log('Current image URL:', currentImageUrl);

  return (
    <div className="content-container">
      <div className="image-container">
        {showImage && (
          <img
            src={currentImageUrl}
            alt="ESP32-CAM"
            className="content-image"
            onError={handleImageError}
          />
        )}
      </div>

      <div className="icon-container">
        <div
          className="icon-link"
          onClick={handleMonitorClick}
        >
          <div className="icon">
            <FontAwesomeIcon icon={faAddressBook} size="3x" />
            <p>MONITOREAR</p>
          </div>
        </div>

        <div className="icon-link">
          <div className="icon">
            <FontAwesomeIcon icon={faPhone} size="3x" />
            <p>HABLAR</p>
          </div>
        </div>
      </div>

      {/* Indicador de estado de WebSocket */}
      {wsError && (
        <div className="ws-error">
          Error de conexión WebSocket: {wsError}
        </div>
      )}
      
      {isConnecting && (
        <div className="ws-connecting">
          Conectando al servidor...
        </div>
      )}
    </div>
  );
}

export default Content;
