import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Проверка наличия токена при загрузке
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userData && userRole) {
      try {
        setUser({
          ...JSON.parse(userData),
          role: userRole
        });
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      });
      
      const { token, id, username: userName, role } = response.data;
      
      // Сохранение данных в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, username: userName }));
      localStorage.setItem('userRole', role);
      
      setUser({ id, username: userName, role });
      setError(null);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при входе');
      return false;
    }
  };

  const register = async (username, password, role) => {
    try {
      await axios.post(`${API_URL}/register`, {
        username,
        password,
        role
      });
      
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при регистрации');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 