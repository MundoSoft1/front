import { useState, useCallback } from 'react';
import apiService, { HttpError } from '../services/apiService';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Función para hacer peticiones GET
  const get = useCallback(async (url, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.get(url, config);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof HttpError ? err.message : 'Error inesperado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para hacer peticiones POST
  const post = useCallback(async (url, data = {}, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.post(url, data, config);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof HttpError ? err.message : 'Error inesperado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para hacer peticiones PUT
  const put = useCallback(async (url, data = {}, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.put(url, data, config);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof HttpError ? err.message : 'Error inesperado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para hacer peticiones DELETE
  const del = useCallback(async (url, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.delete(url, config);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof HttpError ? err.message : 'Error inesperado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para limpiar el estado
  const clearState = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  // Función para limpiar solo el error
  const clearError = useCallback(() => {
    setError(null);
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
  };
};

export default useApi; 