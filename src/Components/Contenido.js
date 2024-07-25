import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faAddressBook } from '@fortawesome/free-solid-svg-icons';
import '../App.css';

function Content() {
  const [showImage, setShowImage] = useState(false);
  const [cameraIP, setCameraIP] = useState(null);
  const [imageSrc, setImageSrc] = useState('');

  const connectWebSocket = useCallback(() => {
    console.log('Attempting to connect to WebSocket');
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      ws.send('Hello from client');
    };

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      try {
        const message = event.data;
        if (typeof message === 'string' && message.startsWith('Mensaje de RabbitMQ:')) {
          // Ajuste para el nuevo formato del mensaje
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
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed. Trying to reconnect...');
      setTimeout(connectWebSocket, 2000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  useEffect(() => {
    console.log('Effect triggered. showImage:', showImage, 'cameraIP:', cameraIP);
    let interval;
    if (showImage) {
      const updateImageSource = () => {
        const newSrc = cameraIP 
          ? `http://${cameraIP}/capture?${new Date().getTime()}`
          : 'https://via.placeholder.com/640x480.png?text=Waiting+for+camera+IP';
        console.log('Updating image source:', newSrc);
        setImageSrc(newSrc);
      };
      updateImageSource();
      interval = setInterval(updateImageSource, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showImage, cameraIP]);

  const handleMonitorClick = () => {
    console.log('Monitor button clicked');
    setShowImage(prev => {
      console.log('Setting showImage to:', !prev);
      return !prev;
    });
  };

  console.log(imageSrc)

  return (
    <div className="content-container">
      <div className="image-container">
        {showImage && (
          <img
            src={cameraIP ? `http://${cameraIP}/capture?${new Date().getTime()}` : 'https://via.placeholder.com/640x480.png?text=Waiting+for+camera+IP'}
            alt="ESP32-CAM"
            className="content-image"
            onError={(e) => {
              console.error('Error loading image:', e);
              e.target.src = 'https://via.placeholder.com/640x480.png?text=Error+loading+image';
            }}
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
    </div>
  );
}

export default Content;
