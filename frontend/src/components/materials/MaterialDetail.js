import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button, CircularProgress, Divider, Breadcrumbs } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { AuthContext } from '../../context/AuthContext';
import { materialsApi } from '../../api/api';

const MaterialDetail = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await materialsApi.getById(id);
        setMaterial(response.data);
        setError(null);
      } catch (error) {
        console.error('Ошибка при получении материала:', error);
        setError('Материал не найден или у вас нет доступа к нему');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterial();
  }, [id]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/materials"
          >
            Вернуться к списку материалов
          </Button>
        </Paper>
      </Container>
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
        <Typography color="textPrimary">{material.title}</Typography>
      </Breadcrumbs>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {material.title}
          </Typography>
          
          <Box>
            {user?.role === 'teacher' && user.id === material.teacher_id && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                component={Link}
                to={`/materials/edit/${material.id}`}
                sx={{ mr: 1 }}
              >
                Редактировать
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<QrCodeIcon />}
              component={Link}
              to={`/qrcode?type=material&id=${material.id}`}
            >
              QR-код
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Автор: {material.teacher_name}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ whiteSpace: 'pre-wrap' }}>
          {material.content.split('\n').map((paragraph, index) => (
            <Typography key={index} paragraph>
              {paragraph}
            </Typography>
          ))}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/materials"
          >
            Назад к материалам
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default MaterialDetail; 