import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Paper, Box, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  
  const [passwordError, setPasswordError] = useState('');
  const { register, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Проверка совпадения паролей
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword' && formData.password !== value) {
        setPasswordError('Пароли не совпадают');
      } else if (name === 'password' && formData.confirmPassword && formData.confirmPassword !== value) {
        setPasswordError('Пароли не совпадают');
      } else {
        setPasswordError('');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    
    const success = await register(formData.username, formData.password, formData.role);
    if (success) {
      navigate('/login');
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Регистрация в AiBio
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Имя пользователя"
            name="username"
            fullWidth
            margin="normal"
            variant="outlined"
            required
            value={formData.username}
            onChange={handleChange}
          />
          
          <TextField
            label="Пароль"
            name="password"
            fullWidth
            margin="normal"
            variant="outlined"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          
          <TextField
            label="Подтверждение пароля"
            name="confirmPassword"
            fullWidth
            margin="normal"
            variant="outlined"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!passwordError}
            helperText={passwordError}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Роль</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Роль"
            >
              <MenuItem value="student">Ученик</MenuItem>
              <MenuItem value="teacher">Учитель</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={!!passwordError}
          >
            Зарегистрироваться
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Register; 