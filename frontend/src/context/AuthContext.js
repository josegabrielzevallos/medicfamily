import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext();

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;   // 2 horas en ms
const WARNING_BEFORE  = 2 * 60 * 1000;          // aviso 2 minutos antes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);

  const logoutTimerRef  = useRef(null);
  const warningTimerRef = useRef(null);

  const clearTimers = () => {
    clearTimeout(logoutTimerRef.current);
    clearTimeout(warningTimerRef.current);
  };

  const logout = useCallback(() => {
    clearTimers();
    setUser(null);
    setToken(null);
    setSessionWarning(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_type');
  }, []);

  const resetTimer = useCallback(() => {
    if (!localStorage.getItem('access_token')) return;
    setSessionWarning(false);
    clearTimers();

    warningTimerRef.current = setTimeout(() => {
      setSessionWarning(true);
    }, SESSION_TIMEOUT - WARNING_BEFORE);

    logoutTimerRef.current = setTimeout(() => {
      logout();
      window.location.href = '/login';
    }, SESSION_TIMEOUT);
  }, [logout]);

  // Escuchar actividad del usuario para reiniciar el timer
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach(e => window.addEventListener(e, handleActivity));
    return () => events.forEach(e => window.removeEventListener(e, handleActivity));
  }, [resetTimer]);

  // Al montar, restaurar el usuario desde localStorage (sesión persistente)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      resetTimer();
    }
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(username, password);
      const { access, refresh, user: userData } = response.data;

      // Persistir en localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('user_role', userData.role);

      // Actualizar estado
      setToken(access);
      setUser(userData);
      resetTimer();

      return userData;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // googleLogin puede recibir credential (ID token) o access_token según el flujo
  const googleLogin = async ({ credential = null, access_token = null, user_type = 'patient' } = {}) => {
    setIsLoading(true);
    try {
      const payload = { user_type };
      if (credential)    payload.credential    = credential;
      if (access_token)  payload.access_token  = access_token;

      const response = await authAPI.googleLogin(payload);
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('user_role', userData.role);

      setToken(access);
      setUser(userData);
      resetTimer();

      return userData;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { access, refresh, user: newUser } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('user_id', newUser.id);
      localStorage.setItem('user_role', newUser.role);

      setToken(access);
      setUser(newUser);
      resetTimer();

      return newUser;
    } catch (error) {
      console.error('Error al registrar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, sessionWarning, login, googleLogin, register, logout, resetTimer }}>
      {sessionWarning && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: '#ff9800', color: '#fff', padding: '16px 20px',
          borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '340px'
        }}>
          <span style={{ fontSize: '22px' }}>⚠️</span>
          <div>
            <strong>Tu sesión está por expirar</strong>
            <p style={{ margin: '4px 0 8px', fontSize: '13px' }}>
              La sesión se cerrará en 2 minutos por inactividad.
            </p>
            <button
              onClick={resetTimer}
              style={{
                background: '#fff', color: '#ff9800', border: 'none',
                padding: '6px 14px', borderRadius: '6px',
                fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
              }}
            >
              Mantener sesión
            </button>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
