import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://54.173.247.52';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Limpiar token expirado
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      
      // Redirigir a login
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Clase para manejo de errores HTTP
class HttpError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

// Función para crear mensajes de error user-friendly
const createErrorMessage = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return 'Los datos enviados son incorrectos. Por favor, verifica la información.';
      case 401:
        return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 422:
        return data?.message || 'Los datos enviados no son válidos.';
      case 429:
        return 'Has realizado demasiadas peticiones. Por favor, espera un momento.';
      case 500:
        return 'Error interno del servidor. Por favor, intenta más tarde.';
      case 502:
        return 'El servidor no está disponible temporalmente.';
      case 503:
        return 'El servicio está temporalmente no disponible.';
      case 504:
        return 'El servidor tardó demasiado en responder.';
      default:
        return data?.message || 'Ha ocurrido un error inesperado.';
    }
  } else if (error.request) {
    // Error de red (sin respuesta del servidor)
    if (error.code === 'ECONNABORTED') {
      return 'La petición tardó demasiado en completarse. Verifica tu conexión.';
    }
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  } else {
    // Error en la configuración de la petición
    return 'Error en la configuración de la petición.';
  }
};

// Función para determinar si un error es temporal y se puede reintentar
const isRetryableError = (error) => {
  if (error.response) {
    const { status } = error.response;
    // Errores 5xx y algunos 4xx son retryables
    return status >= 500 || status === 429 || status === 408;
  }
  // Errores de red son retryables
  return error.request && error.code !== 'ECONNABORTED';
};

// Función para hacer peticiones con retry logic
const makeRequestWithRetry = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Si no es el último intento y el error es retryable
      if (attempt < maxRetries && isRetryableError(error)) {
        // Esperar antes del siguiente intento (backoff exponencial)
        const waitTime = delay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Si no es retryable o es el último intento, lanzar el error
      break;
    }
  }
  
  throw lastError;
};

// Función para loggear errores
const logError = (error, context = '') => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    data: error.response?.data,
    stack: error.stack,
  };
  
  // Loggear en consola para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', errorInfo);
  }
  
  // Aquí podrías enviar el error a un servicio de logging
  // como Sentry, LogRocket, etc.
  
  return errorInfo;
};

// Métodos de la API
const apiService = {
  // GET request
  async get(url, config = {}) {
    try {
      const response = await makeRequestWithRetry(() => 
        apiClient.get(url, config)
      );
      return response.data;
    } catch (error) {
      const userMessage = createErrorMessage(error);
      logError(error, `GET ${url}`);
      throw new HttpError(
        error.response?.status || 0,
        userMessage,
        error.response?.data
      );
    }
  },

  // POST request
  async post(url, data = {}, config = {}) {
    try {
      const response = await makeRequestWithRetry(() => 
        apiClient.post(url, data, config)
      );
      return response.data;
    } catch (error) {
      const userMessage = createErrorMessage(error);
      logError(error, `POST ${url}`);
      throw new HttpError(
        error.response?.status || 0,
        userMessage,
        error.response?.data
      );
    }
  },

  // PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await makeRequestWithRetry(() => 
        apiClient.put(url, data, config)
      );
      return response.data;
    } catch (error) {
      const userMessage = createErrorMessage(error);
      logError(error, `PUT ${url}`);
      throw new HttpError(
        error.response?.status || 0,
        userMessage,
        error.response?.data
      );
    }
  },

  // DELETE request
  async delete(url, config = {}) {
    try {
      const response = await makeRequestWithRetry(() => 
        apiClient.delete(url, config)
      );
      return response.data;
    } catch (error) {
      const userMessage = createErrorMessage(error);
      logError(error, `DELETE ${url}`);
      throw new HttpError(
        error.response?.status || 0,
        userMessage,
        error.response?.data
      );
    }
  },

  // Método para login específico
  async login(credentials) {
    try {
      const response = await apiClient.post('/login', credentials);
      return response.data;
    } catch (error) {
      const userMessage = createErrorMessage(error);
      logError(error, 'LOGIN');
      throw new HttpError(
        error.response?.status || 0,
        userMessage,
        error.response?.data
      );
    }
  },

  // Método para obtener imágenes
  async getImages() {
    return this.get('/images');
  },

  // Método para eliminar imagen
  async deleteImage(imageId) {
    return this.delete(`/images/${imageId}`);
  },
};

export default apiService;
export { HttpError, createErrorMessage, isRetryableError }; 