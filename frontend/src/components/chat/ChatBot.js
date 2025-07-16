import React, { useState, useRef, useEffect } from 'react';
import { Container, Typography, Paper, TextField, Button, Box, Avatar, CircularProgress, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { chatApi } from '../../api/api';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Автоматическая прокрутка вниз при новых сообщениях
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Добавление приветственного сообщения при первой загрузке
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        text: 'Привет! Я ваш биологический ассистент. Задайте мне вопрос по биологии, и я постараюсь на него ответить.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  const handleSend = async () => {
    if (newMessage.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      const response = await chatApi.sendMessage(newMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response || 'Извините, я не могу ответить на этот вопрос прямо сейчас.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Биологический ассистент
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph align="center">
        Задайте вопрос по биологии, и я постараюсь на него ответить
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{
          height: '60vh',
          overflow: 'auto',
          p: 2,
          mb: 2,
          bgcolor: '#f5f5f5'
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              mb: 2,
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                mr: message.sender === 'user' ? 0 : 1,
                ml: message.sender === 'user' ? 1 : 0
              }}
            >
              {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
            </Avatar>
            
            <Paper 
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '80%',
                bgcolor: message.sender === 'user' ? '#e3f2fd' : 'white',
                borderRadius: 2
              }}
            >
              <Typography variant="body1">
                {message.text}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1, color: 'text.secondary' }}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', my: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
              <SmartToyIcon />
            </Avatar>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography>Думаю...</Typography>
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Paper>
      
      <Box sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          label="Введите ваш вопрос"
          variant="outlined"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          disabled={loading}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSend} 
          disabled={loading || newMessage.trim() === ''} 
          sx={{ ml: 1, px: 3 }}
        >
          <SendIcon />
        </Button>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="body2" color="textSecondary" align="center">
        Биологический ассистент основан на Gemini API и предоставляет информацию исключительно в образовательных целях.
        Точность ответов не гарантируется, всегда проверяйте информацию у авторитетных источников.
      </Typography>
    </Container>
  );
};

export default ChatBot; 