import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para manejo optimizado de WebSocket
 * Incluye reconexión automática, cleanup y manejo de estados
 */
const useWebSocket = (url, options = {}) => {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 2000,
    maxReconnectAttempts = 5,
    autoReconnect = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  // Función para conectar WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (event) => {
        if (!isMountedRef.current) return;
        
        console.log('WebSocket conectado');
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        reconnectAttemptsRef.current = 0;
        
        if (onOpen) {
          onOpen(event);
        }
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        if (onMessage) {
          onMessage(event);
        }
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;
        
        console.log('WebSocket desconectado');
        setIsConnected(false);
        setIsConnecting(false);
        
        if (onClose) {
          onClose(event);
        }

        // Reconexión automática
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          setReconnectAttempts(reconnectAttemptsRef.current);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        if (!isMountedRef.current) return;
        
        console.error('Error en WebSocket:', event);
        setError('Error de conexión WebSocket');
        setIsConnecting(false);
        
        if (onError) {
          onError(event);
        }
      };

    } catch (err) {
      console.error('Error al crear WebSocket:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, maxReconnectAttempts, autoReconnect]);

  // Función para desconectar
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    setReconnectAttempts(0);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Función para enviar mensaje
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
      return true;
    }
    return false;
  }, []);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setReconnectAttempts(0);
    connect();
  }, [disconnect, connect]);

  // Efecto para conectar al montar
  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
    sendMessage,
    disconnect,
    reconnect
  };
};

export default useWebSocket; 