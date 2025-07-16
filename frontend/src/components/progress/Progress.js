import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { progressApi } from '../../api/api';

const Progress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Для пагинации
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await progressApi.getStudentProgress();
        setProgress(response.data);
        setError(null);
      } catch (error) {
        console.error('Ошибка при получении прогресса:', error);
        setError('Не удалось загрузить данные о прогрессе');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, []);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Вычисляем общую статистику
  const calculateStats = () => {
    if (!progress.length) return { total: 0, average: 0 };
    
    const totalQuizzes = progress.length;
    const totalScore = progress.reduce((sum, item) => sum + item.score, 0);
    const totalPossibleScore = progress.reduce((sum, item) => sum + item.total_questions || 5, 0); // Предполагаем 5 вопросов, если нет данных
    
    return {
      total: totalQuizzes,
      average: Math.round((totalScore / totalPossibleScore) * 100)
    };
  };
  
  const stats = calculateStats();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Мой прогресс
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 200, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Пройдено тестов
            </Typography>
            <Typography variant="h3">
              {stats.total}
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 200, p: 2, bgcolor: 'secondary.main', color: 'white', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Средний результат
            </Typography>
            <Typography variant="h3">
              {stats.average}%
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {error ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : progress.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', my: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Вы еще не прошли ни одного теста
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Пройдите тесты, чтобы увидеть свой прогресс
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Тест</TableCell>
                  <TableCell align="center">Результат</TableCell>
                  <TableCell align="center">Процент</TableCell>
                  <TableCell align="right">Дата прохождения</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {progress
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => {
                    const percentage = Math.round((item.score / (item.total_questions || 5)) * 100);
                    let chipColor = 'default';
                    
                    if (percentage >= 80) {
                      chipColor = 'success';
                    } else if (percentage >= 60) {
                      chipColor = 'primary';
                    } else if (percentage >= 40) {
                      chipColor = 'warning';
                    } else {
                      chipColor = 'error';
                    }
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell component="th" scope="row">
                          {item.quiz_title}
                        </TableCell>
                        <TableCell align="center">
                          {item.score} / {item.total_questions || 5}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${percentage}%`} 
                            color={chipColor} 
                            size="small"
                            icon={percentage >= 60 ? <DoneIcon /> : undefined}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {new Date(item.completed_at).toLocaleDateString()} {new Date(item.completed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={progress.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        </Paper>
      )}
    </Container>
  );
};

export default Progress; 