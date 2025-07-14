// Servicio de autenticación para manejo seguro de sesiones

// Claves para localStorage
const TOKEN_KEY = 'token';
const USER_ROLE_KEY = 'userRole';
const LOGOUT_EVENT_KEY = 'logoutEvent';

class AuthService {
  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Obtener rol del usuario
  getUserRole() {
    return localStorage.getItem(USER_ROLE_KEY);
  }

  // Guardar datos de sesión
  setSession(token, userRole) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_ROLE_KEY, userRole);
  }

  // Limpiar sesión completamente
  clearSession() {
    // Limpiar localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    
    // Limpiar sessionStorage por si acaso
    sessionStorage.clear();
    
    // Limpiar cookies relacionadas con la sesión
    this.clearCookies();
    
    // Notificar a otras pestañas sobre el logout
    this.notifyLogoutToOtherTabs();
  }

  // Limpiar cookies de sesión
  clearCookies() {
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Eliminar cookies que puedan estar relacionadas con la sesión
      if (name.includes('session') || name.includes('auth') || name.includes('token')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  }

  // Notificar logout a otras pestañas
  notifyLogoutToOtherTabs() {
    const logoutEvent = {
      type: 'logout',
      timestamp: Date.now()
    };
    
    localStorage.setItem(LOGOUT_EVENT_KEY, JSON.stringify(logoutEvent));
    
    // Remover el evento después de un breve delay para evitar conflictos
    setTimeout(() => {
      localStorage.removeItem(LOGOUT_EVENT_KEY);
    }, 100);
  }

  // Escuchar eventos de logout de otras pestañas
  listenForLogoutEvents(callback) {
    const handleStorageChange = (e) => {
      if (e.key === LOGOUT_EVENT_KEY && e.newValue) {
        try {
          const logoutEvent = JSON.parse(e.newValue);
          if (logoutEvent.type === 'logout') {
            callback();
          }
        } catch (error) {
          console.error('Error parsing logout event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Retornar función para remover el listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  // Verificar si el token ha expirado (opcional)
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar el token JWT (solo la parte del payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error verificando expiración del token:', error);
      return true; // Si hay error, considerar como expirado por seguridad
    }
  }

  // Logout completo
  logout() {
    this.clearSession();
    
    // Redirigir a login
    window.location.href = '/login';
  }

  // Logout sin redirección (para casos donde se maneja la navegación externamente)
  logoutWithoutRedirect() {
    this.clearSession();
  }
}

// Crear instancia singleton
const authService = new AuthService();

export default authService; 