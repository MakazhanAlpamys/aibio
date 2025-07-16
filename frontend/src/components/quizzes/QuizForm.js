import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Container, Typography, Paper, TextField, Button, Box, IconButton, 
  CircularProgress, Breadcrumbs, Grid, Card, CardContent, CardActions,
  FormControl, RadioGroup, Radio, FormControlLabel, FormLabel, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../../context/AuthContext';
import { quizzesApi } from '../../api/api';

const QuizForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: []
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Шаблон нового вопроса
  const emptyQuestion = {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  };
  
  useEffect(() => {
    // Проверяем роль пользователя
    if (user?.role !== 'teacher') {
      navigate('/quizzes');
      return;
    }
    
    // Если режим редактирования, загружаем данные теста
    if (isEditMode) {
      const fetchQuiz = async () => {
        try {
          const response = await quizzesApi.getById(id);
          const quiz = response.data;
          
          // Проверяем, является ли пользователь автором теста
          if (quiz.teacher_id !== user.id) {
            setError('У вас нет прав на редактирование этого теста');
            return;
          }
          
          // Преобразуем формат данных
          const formattedQuestions = quiz.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correct_answer
          }));
          
          setFormData({
            title: quiz.title,
            description: quiz.description || '',
            questions: formattedQuestions
          });
          
          setError(null);
        } catch (error) {
          console.error('Ошибка при загрузке теста:', error);
          setError('Тест не найден или у вас нет доступа к нему');
        } finally {
          setLoading(false);
        }
      };
      
      fetchQuiz();
    } else {
      // Если создание нового теста, добавляем один пустой вопрос
      setFormData({
        title: '',
        description: '',
        questions: [{ ...emptyQuestion }]
      });
    }
  }, [id, isEditMode, navigate, user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };
  
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };
  
  const handleCorrectAnswerChange = (questionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].correctAnswer = parseInt(value);
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };
  
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...emptyQuestion }]
    });
  };
  
  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };
  
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Введите название теста');
      return false;
    }
    
    if (formData.questions.length === 0) {
      setError('Добавьте хотя бы один вопрос');
      return false;
    }
    
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      
      if (!q.question.trim()) {
        setError(`Вопрос ${i + 1}: введите текст вопроса`);
        return false;
      }
      
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Вопрос ${i + 1}: введите текст для варианта ${j + 1}`);
          return false;
        }
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      if (isEditMode) {
        await quizzesApi.update(id, formData);
      } else {
        await quizzesApi.create(formData);
      }
      
      navigate('/quizzes');
    } catch (error) {
      console.error('Ошибка при сохранении теста:', error);
      setError('Ошибка при сохранении теста. Пожалуйста, попробуйте еще раз.');
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
        <Link to="/quizzes" style={{ textDecoration: 'none', color: 'inherit' }}>
          Тесты
        </Link>
        <Typography color="textPrimary">
          {isEditMode ? 'Редактирование теста' : 'Создание теста'}
        </Typography>
      </Breadcrumbs>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Редактирование теста' : 'Создание нового теста'}
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Название теста"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                label="Описание"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                variant="outlined"
                placeholder="Необязательное описание теста..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Вопросы ({formData.questions.length})
                </Typography>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddCircleIcon />}
                  onClick={addQuestion}
                >
                  Добавить вопрос
                </Button>
              </Box>
              
              {formData.questions.length === 0 ? (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  Добавьте вопросы к тесту
                </Typography>
              ) : (
                formData.questions.map((question, qIndex) => (
                  <Card key={qIndex} sx={{ mb: 4 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Вопрос {qIndex + 1}
                        </Typography>
                        
                        {formData.questions.length > 1 && (
                          <IconButton
                            color="error"
                            onClick={() => removeQuestion(qIndex)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      
                      <TextField
                        label="Текст вопроса"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                      />
                      
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Варианты ответов:
                      </Typography>
                      
                      {question.options.map((option, oIndex) => (
                        <Box key={oIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Radio
                            checked={question.correctAnswer === oIndex}
                            onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                          />
                          <TextField
                            label={`Вариант ${oIndex + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            fullWidth
                            required
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      ))}
                      
                      <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <FormLabel component="legend">Правильный ответ:</FormLabel>
                        <RadioGroup
                          row
                          value={question.correctAnswer.toString()}
                          onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                        >
                          {question.options.map((_, index) => (
                            <FormControlLabel
                              key={index}
                              value={index.toString()}
                              control={<Radio />}
                              label={`Вариант ${index + 1}`}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </CardContent>
                  </Card>
                ))
              )}
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/quizzes"
            >
              Отмена
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={saving || formData.questions.length === 0}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default QuizForm; 