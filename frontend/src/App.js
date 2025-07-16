import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import './App.css';

// Компоненты
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import MaterialsList from './components/materials/MaterialsList';
import MaterialDetail from './components/materials/MaterialDetail';
import MaterialForm from './components/materials/MaterialForm';
import QuizList from './components/quizzes/QuizList';
import QuizDetail from './components/quizzes/QuizDetail';
import QuizForm from './components/quizzes/QuizForm';
import ChatBot from './components/chat/ChatBot';
import Cell3DModel from './components/models/Cell3DModel';
import Progress from './components/progress/Progress';
import TeacherProgress from './components/progress/TeacherProgress';
import QRCodeGenerator from './components/utils/QRCodeGenerator';

// Контекст для авторизации
import { AuthProvider } from './context/AuthContext';

// Приватный маршрут
const PrivateRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Тема для Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // синий
    },
    secondary: {
      main: '#4caf50', // зеленый
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header />
          <Container maxWidth="lg" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              
              {/* Маршруты для материалов */}
              <Route 
                path="/materials" 
                element={
                  <PrivateRoute>
                    <MaterialsList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/materials/:id" 
                element={
                  <PrivateRoute>
                    <MaterialDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/materials/create" 
                element={
                  <PrivateRoute requiredRole="teacher">
                    <MaterialForm />
                  </PrivateRoute>
                } 
              />
              
              {/* Маршруты для квизов */}
              <Route 
                path="/quizzes" 
                element={
                  <PrivateRoute>
                    <QuizList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/quizzes/:id" 
                element={
                  <PrivateRoute>
                    <QuizDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/quizzes/create" 
                element={
                  <PrivateRoute requiredRole="teacher">
                    <QuizForm />
                  </PrivateRoute>
                } 
              />
              
              {/* Чат-бот с ИИ */}
              <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <ChatBot />
                  </PrivateRoute>
                } 
              />
              
              {/* 3D-модели клеток */}
              <Route 
                path="/models" 
                element={
                  <PrivateRoute>
                    <Cell3DModel />
                  </PrivateRoute>
                } 
              />
              
              {/* Прогресс */}
              <Route 
                path="/progress" 
                element={
                  <PrivateRoute requiredRole="student">
                    <Progress />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/teacher/progress" 
                element={
                  <PrivateRoute requiredRole="teacher">
                    <TeacherProgress />
                  </PrivateRoute>
                } 
              />
              
              {/* QR-коды */}
              <Route 
                path="/qrcode" 
                element={
                  <PrivateRoute>
                    <QRCodeGenerator />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
