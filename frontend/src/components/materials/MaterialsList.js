import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, CircularProgress, IconButton, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AuthContext } from '../../context/AuthContext';
import { materialsApi } from '../../api/api';

const MaterialsList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await materialsApi.getAll();
        setMaterials(response.data);
      } catch (error) {
        console.error('Ошибка при получении материалов:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        await materialsApi.delete(id);
        setMaterials(materials.filter(material => material.id !== id));
      } catch (error) {
        console.error('Ошибка при удалении материала:', error);
      }
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Учебные материалы
        </Typography>
        
        {user?.role === 'teacher' && (
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/materials/create" 
            startIcon={<AddIcon />}
          >
            Создать материал
          </Button>
        )}
      </Box>
      
      {materials.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Материалы не найдены
          </Typography>
          {user?.role === 'teacher' && (
            <Button 
              variant="outlined" 
              color="primary" 
              component={Link} 
              to="/materials/create" 
              sx={{ mt: 2 }}
              startIcon={<AddIcon />}
            >
              Создать первый материал
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {materials.map((material) => (
            <Grid item xs={12} md={6} key={material.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {material.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Автор: {material.teacher_name}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {material.content.length > 150
                      ? `${material.content.substring(0, 150)}...`
                      : material.content}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button 
                    size="small" 
                    color="primary" 
                    component={Link} 
                    to={`/materials/${material.id}`}
                  >
                    Читать
                  </Button>
                  
                  {user?.role === 'teacher' && user.id === material.teacher_id && (
                    <Box>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        component={Link} 
                        to={`/materials/edit/${material.id}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(material.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MaterialsList; 