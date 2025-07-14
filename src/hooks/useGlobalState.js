import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

/**
 * Hook para manejo de estado global optimizado
 * Utiliza Context API con useReducer para mejor performance
 */

// Tipos de acciones
const ACTIONS = {
  SET_USER: 'SET_USER',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_USER: 'CLEAR_USER',
  SET_IMAGES: 'SET_IMAGES',
  ADD_IMAGE: 'ADD_IMAGE',
  REMOVE_IMAGE: 'REMOVE_IMAGE',
  UPDATE_IMAGE: 'UPDATE_IMAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE'
};

// Estado inicial
const initialState = {
  user: null,
  images: [],
  loading: false,
  error: null,
  lastUpdated: null
};

// Reducer optimizado
const globalReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        lastUpdated: new Date().toISOString()
      };

    case ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        lastUpdated: new Date().toISOString()
      };

    case ACTIONS.CLEAR_USER:
      return {
        ...state,
        user: null,
        lastUpdated: new Date().toISOString()
      };

    case ACTIONS.SET_IMAGES:
      return {
        ...state,
        images: action.payload,
        lastUpdated: new Date().toISOString()
      };

    case ACTIONS.ADD_IMAGE:
      return {
        ...state,
        images: [...state.images, action.payload],
        lastUpdated: new Date().toISOString()
      };

    case ACTIONS.REMOVE_IMAGE:
      return {
        ...state,
        images: state.images.filter(img => img.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };

    case ACTIONS.UPDATE_IMAGE:
      return {
        ...state,
        images: state.images.map(img => 
          img.id === action.payload.id 
            ? { ...img, ...action.payload.updates }
            : img
        ),
        lastUpdated: new Date().toISOString()
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ACTIONS.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Context
const GlobalStateContext = createContext();
const GlobalDispatchContext = createContext();

// Provider component
export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Acciones optimizadas con useCallback
  const actions = useMemo(() => ({
    // Acciones de usuario
    setUser: useCallback((user) => {
      dispatch({ type: ACTIONS.SET_USER, payload: user });
    }, []),

    updateUser: useCallback((updates) => {
      dispatch({ type: ACTIONS.UPDATE_USER, payload: updates });
    }, []),

    clearUser: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_USER });
    }, []),

    // Acciones de imágenes
    setImages: useCallback((images) => {
      dispatch({ type: ACTIONS.SET_IMAGES, payload: images });
    }, []),

    addImage: useCallback((image) => {
      dispatch({ type: ACTIONS.ADD_IMAGE, payload: image });
    }, []),

    removeImage: useCallback((imageId) => {
      dispatch({ type: ACTIONS.REMOVE_IMAGE, payload: imageId });
    }, []),

    updateImage: useCallback((imageId, updates) => {
      dispatch({ 
        type: ACTIONS.UPDATE_IMAGE, 
        payload: { id: imageId, updates } 
      });
    }, []),

    // Acciones de estado
    setLoading: useCallback((loading) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_ERROR });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_STATE });
    }, [])
  }), []);

  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={actions}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
};

// Hook para usar el estado global
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState debe usarse dentro de GlobalStateProvider');
  }
  return context;
};

// Hook para usar las acciones del estado global
export const useGlobalActions = () => {
  const context = useContext(GlobalDispatchContext);
  if (!context) {
    throw new Error('useGlobalActions debe usarse dentro de GlobalStateProvider');
  }
  return context;
};

// Hook combinado para estado y acciones
export const useGlobalStateAndActions = () => {
  const state = useGlobalState();
  const actions = useGlobalActions();
  
  return { ...state, ...actions };
};

// Selectores optimizados
export const useUser = () => {
  const { user } = useGlobalState();
  return user;
};

export const useImages = () => {
  const { images } = useGlobalState();
  return images;
};

export const useLoading = () => {
  const { loading } = useGlobalState();
  return loading;
};

export const useError = () => {
  const { error } = useGlobalState();
  return error;
};

export default useGlobalState; 