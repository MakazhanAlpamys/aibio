import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Paper, Box, Button, CircularProgress, 
  Divider, Radio, RadioGroup, FormControlLabel, FormControl, 
  FormLabel, Alert, Breadcrumbs, Card, CardContent, Stepper, 
  Step, StepLabel, StepContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AuthContext } from '../../context/AuthContext';
import { quizzesApi } from '../../api/api';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizzesApi.getById(id);
        setQuiz(response.data);
        
        // Инициализация выбранных ответов
        if (response.data.questions) {
          const initialAnswers = {};
          response.data.questions.forEach((_, index) => {
            initialAnswers[index] = null;
          });
          setSelectedAnswers(initialAnswers);
        }
        
        setError(null);
      } catch (error) {
        console.error('Ошибка при получении теста:', error);
        setError('Тест не найден или у вас нет доступа к нему');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [id]);
  
  const handleAnswerChange = (questionIndex, value) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: parseInt(value)
    });
  };
  
  const handleNext = () => {
    setActiveQuestion((prevActive) => prevActive + 1);
  };
  
  const handleBack = () => {
    setActiveQuestion((prevActive) => prevActive - 1);
  };
  
  const handleSubmit = async () => {
    // Проверяем, что на все вопросы есть ответы
    const unansweredQuestions = Object.values(selectedAnswers).filter(val => val === null);
    
    if (unansweredQuestions.length > 0) {
      alert('Пожалуйста, ответьте на все вопросы перед отправкой.');
      return;
    }
    
    try {
      // Преобразуем ответы в формат API
      const answers = quiz.questions.map((question, index) => ({
        questionId: question.id,
        selectedAnswer: selectedAnswers[index]
      }));
      
      const response = await quizzesApi.submit(id, answers);
      setResults(response.data);
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Ошибка при отправке ответов:', error);
      setError('Произошла ошибка при проверке ответов. Пожалуйста, попробуйте еще раз.');
    }
  };
  
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
            to="/quizzes"
          >
            Вернуться к списку тестов
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Отображаем результаты теста
  if (quizSubmitted && results) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            Главная
          </Link>
          <Link to="/quizzes" style={{ textDecoration: 'none', color: 'inherit' }}>
            Тесты
          </Link>
          <Typography color="textPrimary">Результаты</Typography>
        </Breadcrumbs>
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Тест завершен!
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Ваш результат: {results.score} из {results.total} ({results.percentage}%)
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/quizzes"
            >
              Вернуться к тестам
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/dashboard"
            >
              На главную
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  // Для учителей отображаем просмотр теста с ответами
  if (user?.role === 'teacher') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            Главная
          </Link>
          <Link to="/quizzes" style={{ textDecoration: 'none', color: 'inherit' }}>
            Тесты
          </Link>
          <Typography color="textPrimary">{quiz.title}</Typography>
        </Breadcrumbs>
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              {quiz.title}
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<QrCodeIcon />}
              component={Link}
              to={`/qrcode?type=quiz&id=${quiz.id}`}
            >
              QR-код
            </Button>
          </Box>
          
          <Typography variant="body1" paragraph>
            {quiz.description || 'Описание отсутствует'}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Вопросы ({quiz.questions.length}):
          </Typography>
          
          {quiz.questions.map((question, index) => (
            <Card key={question.id} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {index + 1}. {question.question}
                </Typography>
                
                <FormControl component="fieldset" sx={{ mt: 2 }}>
                  <FormLabel component="legend">Варианты ответов:</FormLabel>
                  <RadioGroup>
                    {question.options.map((option, optionIndex) => (
                      <FormControlLabel 
                        key={optionIndex}
                        value={optionIndex.toString()} 
                        control={<Radio />} 
                        label={
                          <Box component="span" sx={optionIndex === question.correct_answer ? { color: 'success.main', fontWeight: 'bold' } : {}}>
                            {option}
                            {optionIndex === question.correct_answer && ' ✓'}
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          ))}
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/quizzes"
            >
              Назад к тестам
            </Button>
            
            {user.id === quiz.teacher_id && (
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/quizzes/edit/${quiz.id}`}
              >
                Редактировать
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    );
  }
  
  // Для студентов отображаем интерактивный тест
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          Главная
        </Link>
        <Link to="/quizzes" style={{ textDecoration: 'none', color: 'inherit' }}>
          Тесты
        </Link>
        <Typography color="textPrimary">{quiz.title}</Typography>
      </Breadcrumbs>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {quiz.title}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {quiz.description || 'Описание отсутствует'}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Вопрос {activeQuestion + 1} из {quiz.questions.length}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Выберите один правильный ответ
          </Typography>
        </Box>
        
        <Stepper activeStep={activeQuestion} orientation="vertical" sx={{ mb: 3 }}>
          {quiz.questions.map((question, index) => (
            <Step key={question.id}>
              <StepLabel>Вопрос {index + 1}</StepLabel>
              <StepContent>
                <Typography variant="h6" gutterBottom>
                  {question.question}
                </Typography>
                
                <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
                  <RadioGroup
                    value={selectedAnswers[index] !== null ? selectedAnswers[index].toString() : ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                  >
                    {question.options.map((option, optionIndex) => (
                      <FormControlLabel
                        key={optionIndex}
                        value={optionIndex.toString()}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                
                <Box sx={{ mb: 2, mt: 3 }}>
                  <div>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Назад
                    </Button>
                    
                    {index === quiz.questions.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={selectedAnswers[index] === null}
                      >
                        Завершить
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={selectedAnswers[index] === null}
                      >
                        Далее
                      </Button>
                    )}
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default QuizDetail; 