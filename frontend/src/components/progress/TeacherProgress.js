import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import { progressApi } from '../../api/api';

const TeacherProgress = () => {
  const [progress, setProgress] = useState([]);
  const [filteredProgress, setFilteredProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Фильтры
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuiz, setFilterQuiz] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  
  // Для пагинации
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await progressApi.getTeacherProgress();
        setProgress(response.data);
        setFilteredProgress(response.data);
        setError(null);
      } catch (error) {
        console.error('Ошибка при получении прогресса:', error);
        setError('Не удалось загрузить данные о прогрессе учеников');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, []);
  
  // Получение уникальных списков учеников и квизов для фильтрации
  const getUniqueStudents = () => {
    const uniqueStudents = [...new Set(progress.map(item => item.student_name))];
    return uniqueStudents.sort();
  };
  
  const getUniqueQuizzes = () => {
    const uniqueQuizzes = [...new Set(progress.map(item => item.quiz_title))];
    return uniqueQuizzes.sort();
  };
  
  // Применение фильтров
  useEffect(() => {
    let filtered = [...progress];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item => item.student_name.toLowerCase().includes(search) || 
                item.quiz_title.toLowerCase().includes(search)
      );
    }
    
    if (filterStudent !== 'all') {
      filtered = filtered.filter(item => item.student_name === filterStudent);
    }
    
    if (filterQuiz !== 'all') {
      filtered = filtered.filter(item => item.quiz_title === filterQuiz);
    }
    
    setFilteredProgress(filtered);
    setPage(0);
  }, [searchTerm, filterStudent, filterQuiz, progress]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Функция для вычисления статистики
  const calculateStats = () => {
    if (!progress.length) return { total: 0, students: 0, quizzes: 0, averageScore: 0 };
    
    const uniqueStudents = new Set(progress.map(item => item.student_id)).size;
    const uniqueQuizzes = new Set(progress.map(item => item.quiz_id)).size;
    const totalAttempts = progress.length;
    
    const totalScore = progress.reduce((sum, item) => sum + item.score, 0);
    const totalPossibleScore = progress.reduce((sum, item) => sum + (item.total_questions || 5), 0);
    const averagePercentage = Math.round((totalScore / totalPossibleScore) * 100);
    
    return {
      total: totalAttempts,
      students: uniqueStudents,
      quizzes: uniqueQuizzes,
      averageScore: averagePercentage
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
        Прогресс учеников
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Учеников
            </Typography>
            <Typography variant="h4">
              {stats.students}
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: 'secondary.main', color: 'white', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Тестов
            </Typography>
            <Typography variant="h4">
              {stats.quizzes}
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: 'success.main', color: 'white', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Прохождений
            </Typography>
            <Typography variant="h4">
              {stats.total}
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Средний балл
            </Typography>
            <Typography variant="h4">
              {stats.averageScore}%
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
          <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary', my: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Нет данных о прогрессе учеников
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Пока ученики не прошли ни одного теста
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Фильтры
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Поиск"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl sx={{ minWidth: 200, flexGrow: 1 }} size="small">
                <InputLabel id="student-filter-label">Ученик</InputLabel>
                <Select
                  labelId="student-filter-label"
                  value={filterStudent}
                  label="Ученик"
                  onChange={(e) => setFilterStudent(e.target.value)}
                >
                  <MenuItem value="all">Все ученики</MenuItem>
                  {getUniqueStudents().map(student => (
                    <MenuItem key={student} value={student}>{student}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 200, flexGrow: 1 }} size="small">
                <InputLabel id="quiz-filter-label">Тест</InputLabel>
                <Select
                  labelId="quiz-filter-label"
                  value={filterQuiz}
                  label="Тест"
                  onChange={(e) => setFilterQuiz(e.target.value)}
                >
                  <MenuItem value="all">Все тесты</MenuItem>
                  {getUniqueQuizzes().map(quiz => (
                    <MenuItem key={quiz} value={quiz}>{quiz}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
          
          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ученик</TableCell>
                    <TableCell>Тест</TableCell>
                    <TableCell align="center">Результат</TableCell>
                    <TableCell align="center">Процент</TableCell>
                    <TableCell align="right">Дата прохождения</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProgress.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography sx={{ py: 2 }}>Нет результатов, соответствующих фильтрам</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProgress
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
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                                {item.student_name}
                              </Box>
                            </TableCell>
                            <TableCell>{item.quiz_title}</TableCell>
                            <TableCell align="center">
                              {item.score} / {item.total_questions || 5}
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={`${percentage}%`} 
                                color={chipColor} 
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {new Date(item.completed_at).toLocaleDateString()} {new Date(item.completed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredProgress.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
            />
          </Paper>
        </>
      )}
    </Container>
  );
};

export default TeacherProgress; 