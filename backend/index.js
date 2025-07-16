const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Загрузка переменных среды
dotenv.config();

// Инициализация Express
const app = express();
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aibio',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Инициализация Gemini API
const geminiApi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const geminiModel = geminiApi.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware для проверки авторизации
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = user;
    next();
  });
};

// Инициализация базы данных
async function initDb() {
  try {
    // Создание таблиц, если они не существуют
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('student', 'teacher')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS materials (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        teacher_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        teacher_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS student_progress (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        quiz_id INTEGER REFERENCES quizzes(id),
        score INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('База данных инициализирована');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
  }
}

// API эндпоинты

// Регистрация
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Требуются все поля' });
  }
  
  if (role !== 'student' && role !== 'teacher') {
    return res.status(400).json({ error: 'Роль должна быть "student" или "teacher"' });
  }
  
  try {
    // Проверка, существует ли пользователь
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь уже существует' });
    }
    
    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Создание нового пользователя
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Поиск пользователя
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    
    const user = result.rows[0];
    
    // Проверка пароля
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    
    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// Материалы: создание (только для учителей)
app.post('/api/materials', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Доступно только для учителей' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO materials (title, content, teacher_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, req.user.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при создании материала' });
  }
});

// Получение всех материалов
app.get('/api/materials', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT m.*, u.username as teacher_name FROM materials m JOIN users u ON m.teacher_id = u.id ORDER BY m.created_at DESC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении материалов' });
  }
});

// Получение материала по ID
app.get('/api/materials/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT m.*, u.username as teacher_name FROM materials m JOIN users u ON m.teacher_id = u.id WHERE m.id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Материал не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении материала' });
  }
});

// Квизы: создание (только для учителей)
app.post('/api/quizzes', authenticateToken, async (req, res) => {
  const { title, description, questions } = req.body;
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Доступно только для учителей' });
  }
  
  try {
    // Создание нового квиза
    const quizResult = await pool.query(
      'INSERT INTO quizzes (title, description, teacher_id) VALUES ($1, $2, $3) RETURNING id',
      [title, description, req.user.id]
    );
    
    const quizId = quizResult.rows[0].id;
    
    // Добавление вопросов
    for (const q of questions) {
      await pool.query(
        'INSERT INTO questions (quiz_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)',
        [quizId, q.question, JSON.stringify(q.options), q.correctAnswer]
      );
    }
    
    res.status(201).json({ id: quizId, title, description });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при создании квиза' });
  }
});

// Получение всех квизов
app.get('/api/quizzes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT q.*, u.username as teacher_name FROM quizzes q JOIN users u ON q.teacher_id = u.id ORDER BY q.created_at DESC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении квизов' });
  }
});

// Получение квиза по ID с вопросами
app.get('/api/quizzes/:id', authenticateToken, async (req, res) => {
  try {
    const quizResult = await pool.query(
      'SELECT q.*, u.username as teacher_name FROM quizzes q JOIN users u ON q.teacher_id = u.id WHERE q.id = $1',
      [req.params.id]
    );
    
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Квиз не найден' });
    }
    
    const quiz = quizResult.rows[0];
    
    // Получение вопросов для студентов без правильных ответов
    if (req.user.role === 'student') {
      const questionsResult = await pool.query(
        'SELECT id, question, options FROM questions WHERE quiz_id = $1',
        [req.params.id]
      );
      quiz.questions = questionsResult.rows;
    } else {
      // Полная информация для учителей
      const questionsResult = await pool.query(
        'SELECT * FROM questions WHERE quiz_id = $1',
        [req.params.id]
      );
      quiz.questions = questionsResult.rows;
    }
    
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении квиза' });
  }
});

// Отправка ответов на квиз
app.post('/api/quizzes/:id/submit', authenticateToken, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Доступно только для студентов' });
  }
  
  const { answers } = req.body; // Массив { questionId: 1, selectedAnswer: 2 }
  
  try {
    let score = 0;
    
    // Проверка каждого ответа
    for (const answer of answers) {
      const result = await pool.query(
        'SELECT correct_answer FROM questions WHERE id = $1',
        [answer.questionId]
      );
      
      if (result.rows.length > 0 && result.rows[0].correct_answer === answer.selectedAnswer) {
        score++;
      }
    }
    
    // Сохранение результата
    await pool.query(
      'INSERT INTO student_progress (student_id, quiz_id, score) VALUES ($1, $2, $3)',
      [req.user.id, req.params.id, score]
    );
    
    res.json({
      score,
      total: answers.length,
      percentage: Math.round((score / answers.length) * 100)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при проверке квиза' });
  }
});

// Получение прогресса ученика
app.get('/api/progress', authenticateToken, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Доступно только для студентов' });
  }
  
  try {
    const result = await pool.query(
      `SELECT sp.*, q.title as quiz_title 
       FROM student_progress sp 
       JOIN quizzes q ON sp.quiz_id = q.id 
       WHERE sp.student_id = $1
       ORDER BY sp.completed_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении прогресса' });
  }
});

// Получение прогресса всех учеников (для учителей)
app.get('/api/teacher/progress', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Доступно только для учителей' });
  }
  
  try {
    const result = await pool.query(
      `SELECT sp.*, u.username as student_name, q.title as quiz_title 
       FROM student_progress sp 
       JOIN users u ON sp.student_id = u.id
       JOIN quizzes q ON sp.quiz_id = q.id
       ORDER BY sp.completed_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении прогресса' });
  }
});

// Чат с ИИ Gemini
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Сообщение не может быть пустым' });
  }
  
  try {
    const result = await geminiModel.generateContent(
      `Пользователь: ${message}\n\nОтвет: `
    );
    
    const response = result.response.text();
    res.json({ response });
  } catch (error) {
    console.error('Ошибка Gemini API:', error);
    res.status(500).json({ error: 'Ошибка при получении ответа от ИИ' });
  }
});

// Генерация QR-кода
app.post('/api/qrcode', authenticateToken, async (req, res) => {
  const { text, type, id } = req.body;
  
  if (!text && (!type || !id)) {
    return res.status(400).json({ error: 'Необходимо указать текст или тип и ID ресурса' });
  }
  
  try {
    let qrText = text;
    
    // Если указаны тип и ID, генерируем URL для ресурса
    if (!text && type && id) {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      if (type === 'material') {
        qrText = `${baseUrl}/materials/${id}`;
      } else if (type === 'quiz') {
        qrText = `${baseUrl}/quizzes/${id}`;
      }
    }
    
    const qrCodeDataUrl = await qrcode.toDataURL(qrText);
    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('Ошибка при генерации QR-кода:', error);
    res.status(500).json({ error: 'Ошибка при генерации QR-кода' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;

// Инициализация базы данных и запуск сервера
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Не удалось запустить сервер:', err);
  }); 