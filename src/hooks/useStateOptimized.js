import { useState, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejo optimizado de estados
 * Proporciona funciones de actualización inmutable y utilidades para evitar re-renders innecesarios
 */
const useStateOptimized = (initialState) => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Actualización inmutable de objetos
  const updateObject = useCallback((updates) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  // Actualización inmutable de arrays
  const updateArray = useCallback((updater) => {
    setState(prevState => {
      const newArray = Array.isArray(prevState) ? updater(prevState) : prevState;
      return newArray;
    });
  }, []);

  // Agregar elemento a array
  const addToArray = useCallback((item) => {
    setState(prevState => {
      if (!Array.isArray(prevState)) return prevState;
      return [...prevState, item];
    });
  }, []);

  // Remover elemento de array por índice
  const removeFromArrayByIndex = useCallback((index) => {
    setState(prevState => {
      if (!Array.isArray(prevState)) return prevState;
      return prevState.filter((_, i) => i !== index);
    });
  }, []);

  // Remover elemento de array por condición
  const removeFromArrayByCondition = useCallback((condition) => {
    setState(prevState => {
      if (!Array.isArray(prevState)) return prevState;
      return prevState.filter(condition);
    });
  }, []);

  // Actualizar elemento en array por índice
  const updateArrayItemByIndex = useCallback((index, updater) => {
    setState(prevState => {
      if (!Array.isArray(prevState)) return prevState;
      return prevState.map((item, i) => i === index ? updater(item) : item);
    });
  }, []);

  // Actualizar elemento en array por condición
  const updateArrayItemByCondition = useCallback((condition, updater) => {
    setState(prevState => {
      if (!Array.isArray(prevState)) return prevState;
      return prevState.map(item => condition(item) ? updater(item) : item);
    });
  }, []);

  // Resetear estado
  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  // Obtener estado actual sin causar re-render
  const getCurrentState = useCallback(() => {
    return stateRef.current;
  }, []);

  return {
    state,
    setState,
    updateObject,
    updateArray,
    addToArray,
    removeFromArrayByIndex,
    removeFromArrayByCondition,
    updateArrayItemByIndex,
    updateArrayItemByCondition,
    reset,
    getCurrentState
  };
};

export default useStateOptimized; 