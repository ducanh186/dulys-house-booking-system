import { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

export const AuthContext = createContext(null);

const ELEVATED_ROLES = new Set(['admin', 'owner', 'staff']);

export function isElevatedRole(role) {
  return ELEVATED_ROLES.has(role);
}

export function resolveRedirectTarget(target, fallback = '/') {
  if (!target) return fallback;

  if (typeof target === 'string') {
    return target || fallback;
  }

  const pathname = target.pathname || fallback;
  const search = target.search || '';
  const hash = target.hash || '';

  if (!search && !hash && target.state === undefined) {
    return pathname;
  }

  return {
    pathname,
    search,
    hash,
    state: target.state,
  };
}

export function getPostLoginRedirectTarget(user, target) {
  if (isElevatedRole(user?.role)) {
    return '/admin';
  }

  return resolveRedirectTarget(target, '/');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'staff';

  const refreshUser = useCallback(async () => {
    const res = await authApi.getMe();
    setUser(res.data);
    return res.data;
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadUser() {
      if (!token) {
        if (alive) setLoading(false);
        return;
      }

      if (alive) setLoading(true);

      try {
        await refreshUser();
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadUser();

    return () => {
      alive = false;
    };
  }, [token, refreshUser]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    return refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    return refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
