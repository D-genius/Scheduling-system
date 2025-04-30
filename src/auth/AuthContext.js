import React, { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await api.post('/o/token/', {
        grant_type: 'password',
        username: email,
        password,
        client_id: process.env.REACT_APP_CLIENT_ID,
        client_secret: process.env.REACT_APP_CLIENT_SECRET,
      });
      // const userResponse = await api.get(response.data.user_type === 'doctor' ? '/doctors/' : '/patients/');
      const userResponse = await api.get(response.data.user_type === 'doctor' ? '/appointments/' : '/doctors/', {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      });

      localStorage.setItem('access_token', response.data.access_token);
      setUser(userResponse.data);
      setError(null);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);