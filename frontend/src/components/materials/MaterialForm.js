import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container, Typography, Paper, TextField, Button, Box, CircularProgress, Breadcrumbs } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthContext } from '../../context/AuthContext';
import { materialsApi } from '../../api/api';

const MaterialForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Проверяем роль пользователя
    if (user?.role !== 'teacher') {
      navigate('/materials');
      return;
    }
    
    // Если режим редактирования, загружаем данные материала
    if (isEditMode) {
      const fetchMaterial = async () => {
        try {
          const response = await materialsApi.getById(id);
          const material = response.data;
          
          // Проверяем, является ли пользователь автором материала
          if (material.teacher_id !== user.id) {
            setError('У вас нет прав на редактирование этого материала');
            return;
          }
          
          setFormData({
            title: material.title,
            content: material.content
          });
          setError(null);
        } catch (error) {
          console.error('Ошибка при загрузке материала:', error);
          setError('Материал не найден или у вас нет доступа к нему');
        } finally {
          setLoading(false);
        }
      };
      
      fetchMaterial();
    }
  }, [id, isEditMode, navigate, user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Заполните все поля формы');
      return;
    }
    
    setSaving(true);
    
    try {
      if (isEditMode) {
        await materialsApi.update(id, formData);
      } else {
        await materialsApi.create(formData);
      }
      
      navigate('/materials');
    } catch (error) {
      console.error('Ошибка при сохранении материала:', error);
      setError('Ошибка при сохранении материала. Пожалуйста, попробуйте еще раз.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          Главная
        </Link>
        <Link to="/materials" style={{ textDecoration: 'none', color: 'inherit' }}>
          Материалы
        </Link>
        <Typography color="textPrimary">
          {isEditMode ? 'Редактирование материала' : 'Создание материала'}
        </Typography>
      </Breadcrumbs>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Редактирование материала' : 'Создание нового материала'}
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Название материала"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            variant="outlined"
          />
          
          <TextField
            label="Содержание"
            name="content"
            value={formData.content}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={12}
            margin="normal"
            variant="outlined"
            placeholder="Введите содержание учебного материала..."
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/materials"
            >
              Отмена
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default MaterialForm; 