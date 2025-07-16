import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, CircularProgress } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import QuizIcon from '@mui/icons-material/Quiz';
import ChatIcon from '@mui/icons-material/Chat';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import BarChartIcon from '@mui/icons-material/BarChart';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { AuthContext } from '../../context/AuthContext';
import { materialsApi, quizzesApi, progressApi } from '../../api/api';

const DashboardCard = ({ title, description, icon, buttonText, link }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={link}>
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    materialsCount: 0,
    quizzesCount: 0,
    completedQuizzes: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [materialsRes, quizzesRes] = await Promise.all([
          materialsApi.getAll(),
          quizzesApi.getAll()
        ]);
        
        let progressData = [];
        
        if (user.role === 'student') {
          const progressRes = await progressApi.getStudentProgress();
          progressData = progressRes.data;
          
          // Вычисление статистики для ученика
          const completedQuizzes = progressData.length;
          const totalScore = progressData.reduce((sum, item) => sum + item.score, 0);
          const averageScore = completedQuizzes > 0 
            ? Math.round((totalScore / completedQuizzes) * 100) / 100 
            : 0;
          
          setStats({
            materialsCount: materialsRes.data.length,
            quizzesCount: quizzesRes.data.length,
            completedQuizzes,
            averageScore
          });
        } else if (user.role === 'teacher') {
          const progressRes = await progressApi.getTeacherProgress();
          progressData = progressRes.data;
          
          // Вычисление статистики для учителя
          const studentCount = new Set(progressData.map(item => item.student_id)).size;
          const completedQuizzes = progressData.length;
          
          setStats({
            materialsCount: materialsRes.data.length,
            quizzesCount: quizzesRes.data.length,
            studentsCount: studentCount,
            completedQuizzes
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const studentDashboard = (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Добро пожаловать, {user.username}!
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Статистика
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Доступно материалов: {stats.materialsCount}</Typography>
                <Typography>Доступно тестов: {stats.quizzesCount}</Typography>
                <Typography>Пройдено тестов: {stats.completedQuizzes}</Typography>
                <Typography>Средний балл: {stats.averageScore}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Быстрые ссылки
              </Typography>
              <Button variant="text" component={Link} to="/materials" sx={{ mr: 1 }}>
                Материалы
              </Button>
              <Button variant="text" component={Link} to="/quizzes" sx={{ mr: 1 }}>
                Тесты
              </Button>
              <Button variant="text" component={Link} to="/progress">
                Прогресс
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Учебные материалы"
            description="Изучайте материалы по биологии с подробным описанием и иллюстрациями."
            icon={<LibraryBooksIcon fontSize="large" color="primary" />}
            buttonText="Перейти к материалам"
            link="/materials"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Тесты и викторины"
            description="Проверьте свои знания с помощью интерактивных тестов по биологии."
            icon={<QuizIcon fontSize="large" color="primary" />}
            buttonText="Перейти к тестам"
            link="/quizzes"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Чат-бот биолог"
            description="Задайте вопросы биологическому ИИ-ассистенту и получите подробные ответы."
            icon={<ChatIcon fontSize="large" color="primary" />}
            buttonText="Открыть чат"
            link="/chat"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="3D-модели клеток"
            description="Интерактивные 3D-модели клеток и биологических структур для наглядного обучения."
            icon={<ViewInArIcon fontSize="large" color="primary" />}
            buttonText="Смотреть модели"
            link="/models"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Мой прогресс"
            description="Просмотр вашего прогресса и результатов по всем пройденным тестам."
            icon={<BarChartIcon fontSize="large" color="primary" />}
            buttonText="Просмотр прогресса"
            link="/progress"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="QR-коды"
            description="Быстрый доступ к материалам через QR-коды для удобного обучения."
            icon={<QrCodeIcon fontSize="large" color="primary" />}
            buttonText="Создать QR-код"
            link="/qrcode"
          />
        </Grid>
      </Grid>
    </>
  );
  
  const teacherDashboard = (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Панель учителя | {user.username}
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Статистика
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Созданных материалов: {stats.materialsCount}</Typography>
                <Typography>Созданных тестов: {stats.quizzesCount}</Typography>
                <Typography>Активных учеников: {stats.studentsCount || 0}</Typography>
                <Typography>Пройдено тестов: {stats.completedQuizzes}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Инструменты
              </Typography>
              <Button variant="contained" component={Link} to="/materials/create" sx={{ mr: 1, mb: 1 }}>
                Новый материал
              </Button>
              <Button variant="contained" component={Link} to="/quizzes/create" sx={{ mr: 1, mb: 1 }}>
                Новый тест
              </Button>
              <Button variant="contained" component={Link} to="/teacher/progress" sx={{ mb: 1 }}>
                Прогресс учеников
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Управление материалами"
            description="Создавайте и редактируйте учебные материалы для учеников."
            icon={<LibraryBooksIcon fontSize="large" color="primary" />}
            buttonText="Управлять материалами"
            link="/materials"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Управление тестами"
            description="Создавайте тесты и викторины для проверки знаний учеников."
            icon={<QuizIcon fontSize="large" color="primary" />}
            buttonText="Управлять тестами"
            link="/quizzes"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Прогресс учеников"
            description="Просматривайте статистику и прогресс учеников по вашим материалам."
            icon={<BarChartIcon fontSize="large" color="primary" />}
            buttonText="Просмотр статистики"
            link="/teacher/progress"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Чат-бот биолог"
            description="ИИ-ассистент для ответов на вопросы по биологии."
            icon={<ChatIcon fontSize="large" color="primary" />}
            buttonText="Открыть чат"
            link="/chat"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="3D-модели клеток"
            description="Интерактивные 3D-модели биологических структур для наглядного обучения."
            icon={<ViewInArIcon fontSize="large" color="primary" />}
            buttonText="Смотреть модели"
            link="/models"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="QR-коды"
            description="Генерация QR-кодов для быстрого доступа к материалам и тестам."
            icon={<QrCodeIcon fontSize="large" color="primary" />}
            buttonText="Создать QR-код"
            link="/qrcode"
          />
        </Grid>
      </Grid>
    </>
  );
  
  return (
    <Container>
      {user?.role === 'teacher' ? teacherDashboard : studentDashboard}
    </Container>
  );
};

export default Dashboard; 