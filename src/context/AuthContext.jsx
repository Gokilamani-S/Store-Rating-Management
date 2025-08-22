import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        // Decode JWT payload safely
        const payload = JSON.parse(atob(token.split('.')[1]));
        const storedUser = JSON.parse(localStorage.getItem('user'));

        // Check token expiration
        if (payload.exp * 1000 > Date.now() && storedUser) {
          // Ensure role is trimmed
          setUser({ ...storedUser, role: storedUser.role.trim() });
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = (userData, authToken) => {
    const sanitizedUser = { ...userData, role: userData.role.trim() };
    setUser(sanitizedUser);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(sanitizedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
