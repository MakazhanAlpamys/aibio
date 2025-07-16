import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, CircularProgress, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { AuthContext } from '../../context/AuthContext';
import { quizzesApi } from '../../api/api';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await quizzesApi.getAll();
        setQuizzes(response.data);
      } catch (error) {
        console.error('Ошибка при получении тестов:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тест?')) {
      try {
        await quizzesApi.delete(id);
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      } catch (error) {
        console.error('Ошибка при удалении теста:', error);
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
          Тесты и викторины
        </Typography>
        
        {user?.role === 'teacher' && (
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/quizzes/create" 
            startIcon={<AddIcon />}
          >
            Создать тест
          </Button>
        )}
      </Box>
      
      {quizzes.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Тесты не найдены
          </Typography>
          {user?.role === 'teacher' && (
            <Button 
              variant="outlined" 
              color="primary" 
              component={Link} 
              to="/quizzes/create" 
              sx={{ mt: 2 }}
              startIcon={<AddIcon />}
            >
              Создать первый тест
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {quiz.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Автор: {quiz.teacher_name}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {quiz.description ? (
                      quiz.description.length > 100
                        ? `${quiz.description.substring(0, 100)}...`
                        : quiz.description
                    ) : 'Описание отсутствует'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button 
                    size="small" 
                    color="primary" 
                    component={Link} 
                    to={`/quizzes/${quiz.id}`}
                    startIcon={<PlayArrowIcon />}
                  >
                    {user?.role === 'student' ? 'Пройти тест' : 'Просмотреть'}
                  </Button>
                  
                  {user?.role === 'teacher' && user.id === quiz.teacher_id && (
                    <Box>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        component={Link} 
                        to={`/quizzes/edit/${quiz.id}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(quiz.id)}
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

export default QuizList; 