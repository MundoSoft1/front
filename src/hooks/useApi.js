import { useState, useCallback, useRef } from 'react';
import apiService, { HttpError } from '../services/apiService';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Refs para evitar re-renders innecesarios
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Función para hacer peticiones GET optimizada
  const get = useCallback(async (url, config = {}) => {
    if (!isMountedRef.current) return null;

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.get(url, {
        ...config,
        signal: abortControllerRef.current.signal
      });
      
      if (isMountedRef.current) {
        setData(result);
      }
      
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        // Petición cancelada, no actualizar estado
        return null;
      }
      
      if (isMountedRef.current) {
        const errorMessage = err instanceof HttpError ? err.message : 'Error inesperado';
        setError(errorMessage);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Función para hacer peticiones POST optimizada
  const post = useCallback(async (url, data = {}, config = {}) => {
    if (!isMountedRef.current) return null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.post(url, data, {
        ...config,
        signal: abortControllerRef.current.signal
      });
      
      if (isMountedRef.current) {
        setData(result);
      }
      
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      
      if (isMountedRef.current) {
        const errorMessage = err instanceof HttpError ? err.message : 'Error inesperado';
        setError(errorMessage);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Función para hacer peticiones PUT optimizada
  const put = useCallback(async (url, data = {}, config = {}) => {
    if (!isMountedRef.current) return null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.put(url, data, {
        ...config,
        signal: abortControllerRef.current.signal
      });
      
      if (isMountedRef.current) {
        setData(result);
      }
      
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      
      if (isMountedRef.current) {
        const errorMessage = err instanceof HttpError ? err.message : 'Error inesperado';
        setError(errorMessage);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Función para hacer peticiones DELETE optimizada
  const del = useCallback(async (url, config = {}) => {
    if (!isMountedRef.current) return null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.delete(url, {
        ...config,
        signal: abortControllerRef.current.signal
      });
      
      if (isMountedRef.current) {
        setData(result);
      }
      
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      
      if (isMountedRef.current) {
        const errorMessage = err instanceof HttpError ? err.message : 'Error inesperado';
        setError(errorMessage);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Función para limpiar el estado optimizada
  const clearState = useCallback(() => {
    if (isMountedRef.current) {
      setLoading(false);
      setError(null);
      setData(null);
    }
  }, []);

  // Función para limpiar solo el error optimizada
  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setError(null);
    }
  }, []);

  // Función para cancelar petición actual
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup al desmontar
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    delete: del,
    clearState,
    clearError,
    cancelRequest,
    cleanup
  };
};

export default useApi; 