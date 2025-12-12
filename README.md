# AiBio - Biology Educational Platform

AiBio is an interactive educational platform that helps students learn biology using modern technologies, including artificial intelligence, 3D models, and interactive tests.

## Features

- 🧠 **AI Assistant**: Chatbot powered by Gemini API for answering biology questions
- 📚 **Learning Materials**: System for creating and managing educational content
- 🧪 **Interactive Tests**: Quizzes and tests to assess knowledge
- 🔬 **3D Cell Models**: Interactive models of biological structures
- 📱 **QR Codes**: Quick access to materials via QR codes
- 📊 **Progress Analytics**: Track student performance and progress

## Requirements

- Node.js 14+
- PostgreSQL 12+
- Gemini API key from Google

## Installation and Setup

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file based on env.example:
   ```
   cp env.example .env
   ```

4. Edit the .env file and add your database connection settings and Gemini API key.

5. Start the server:
   ```
   npm start
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend:
   ```
   npm start
   ```

## Project Structure

### Backend

- `index.js` - Main server file
- `env.example` - Template for environment variables configuration

### Frontend

- `/src/components` - React components
  - `/auth` - Authentication components
  - `/chat` - Chatbot with Gemini API
  - `/dashboard` - Management dashboard
  - `/models` - 3D cell models
  - `/materials` - Learning materials
  - `/quizzes` - Quiz and test system

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Authenticate a user

### Materials
- `GET /api/materials` - Get all materials
- `GET /api/materials/:id` - Get a specific material
- `POST /api/materials` - Create a new material (teachers only)

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get a specific quiz with questions
- `POST /api/quizzes` - Create a new quiz (teachers only)
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Progress
- `GET /api/progress` - Get student progress
- `GET /api/teacher/progress` - Get all students' progress (teachers only)

### Chatbot and QR Codes
- `POST /api/chat` - Send a message to the chatbot
- `POST /api/qrcode` - Generate a QR code

## Security Notes

For production deployment, it is recommended to:
1. Configure HTTPS
2. Use stronger passwords for database and JWT
3. Configure rate limiting for API endpoints
4. Add additional security checks
