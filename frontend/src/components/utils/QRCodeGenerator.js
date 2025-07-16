import React, { useState, useContext } from 'react';
import { Container, Typography, Paper, TextField, Button, Grid, Box, FormControl, InputLabel, MenuItem, Select, Card, CardContent } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { AuthContext } from '../../context/AuthContext';
import { qrCodeApi } from '../../api/api';

const QRCodeGenerator = () => {
  const { user } = useContext(AuthContext);
  const [qrData, setQrData] = useState('');
  const [qrType, setQrType] = useState('text');
  const [resourceId, setResourceId] = useState('');
  const [generatedQR, setGeneratedQR] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  
  // Загрузка материалов и квизов для выбора
  const loadResources = async () => {
    try {
      const [materialsRes, quizzesRes] = await Promise.all([
        fetch('/api/materials', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/quizzes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      
      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        setMaterials(materialsData);
      }
      
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        setQuizzes(quizzesData);
      }
    } catch (error) {
      console.error('Ошибка загрузки ресурсов:', error);
    }
  };
  
  React.useEffect(() => {
    loadResources();
  }, []);
  
  const handleGenerateQR = async () => {
    try {
      let requestData;
      
      if (qrType === 'text') {
        // Генерация QR-кода для текста
        requestData = { text: qrData };
      } else {
        // Генерация QR-кода для ресурса (материала или квиза)
        requestData = {
          type: qrType,
          id: resourceId
        };
      }
      
      const response = await qrCodeApi.generate(requestData);
      setGeneratedQR(response.data.qrCode);
    } catch (error) {
      console.error('Ошибка при генерации QR-кода:', error);
    }
  };
  
  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'aibio-qrcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Генератор QR-кодов
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph align="center">
        Создавайте QR-коды для быстрого доступа к материалам и тестам
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="qr-type-label">Тип QR-кода</InputLabel>
              <Select
                labelId="qr-type-label"
                value={qrType}
                label="Тип QR-кода"
                onChange={(e) => setQrType(e.target.value)}
              >
                <MenuItem value="text">Произвольный текст</MenuItem>
                <MenuItem value="material">Материал</MenuItem>
                <MenuItem value="quiz">Тест</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {qrType === 'text' ? (
            <Grid item xs={12}>
              <TextField
                label="Текст для QR-кода"
                fullWidth
                multiline
                rows={2}
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                variant="outlined"
              />
            </Grid>
          ) : qrType === 'material' ? (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="material-select-label">Выберите материал</InputLabel>
                <Select
                  labelId="material-select-label"
                  value={resourceId}
                  label="Выберите материал"
                  onChange={(e) => setResourceId(e.target.value)}
                >
                  {materials.map(material => (
                    <MenuItem key={material.id} value={material.id}>
                      {material.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="quiz-select-label">Выберите тест</InputLabel>
                <Select
                  labelId="quiz-select-label"
                  value={resourceId}
                  label="Выберите тест"
                  onChange={(e) => setResourceId(e.target.value)}
                >
                  {quizzes.map(quiz => (
                    <MenuItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerateQR}
              disabled={(qrType === 'text' && !qrData) || 
                       ((qrType === 'material' || qrType === 'quiz') && !resourceId)}
            >
              Сгенерировать QR-код
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {generatedQR && (
        <Card elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ваш QR-код готов
            </Typography>
            
            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              {/* Чтобы QR-код мог быть скачан, добавляем ему id */}
              <QRCodeCanvas
                id="qr-code-canvas"
                value={generatedQR}
                size={200}
                level="H"
                includeMargin
              />
            </Box>
            
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleDownload}
            >
              Скачать QR-код
            </Button>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Отсканируйте QR-код с помощью мобильного устройства для быстрого доступа к содержимому.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default QRCodeGenerator; 