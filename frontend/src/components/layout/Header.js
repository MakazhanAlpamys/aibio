import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import QuizIcon from '@mui/icons-material/Quiz';
import ChatIcon from '@mui/icons-material/Chat';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import QrCodeIcon from '@mui/icons-material/QrCode';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Состояние для мобильного меню
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Состояние для меню пользователя
  const [anchorEl, setAnchorEl] = useState(null);
  const openUserMenu = Boolean(anchorEl);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };
  
  // Навигационные пункты
  const navItems = [
    { title: 'Главная', path: '/dashboard', icon: <HomeIcon /> },
    { title: 'Материалы', path: '/materials', icon: <LibraryBooksIcon /> },
    { title: 'Тесты', path: '/quizzes', icon: <QuizIcon /> },
    { title: 'Чат-бот', path: '/chat', icon: <ChatIcon /> },
    { title: '3D-модели', path: '/models', icon: <ViewInArIcon /> },
    { title: 'QR-коды', path: '/qrcode', icon: <QrCodeIcon /> }
  ];
  
  // Добавляем специфичные для роли навигационные пункты
  if (user) {
    if (user.role === 'teacher') {
      navItems.push({ title: 'Прогресс учеников', path: '/teacher/progress', icon: <BarChartIcon /> });
    } else if (user.role === 'student') {
      navItems.push({ title: 'Мой прогресс', path: '/progress', icon: <BarChartIcon /> });
    }
  }
  
  // Мобильное меню
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        AiBio
      </Typography>
      <Divider />
      <List>
        {user ? (
          <>
            {navItems.map((item) => (
              <ListItem button key={item.title} component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary="Выход" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Вход" />
            </ListItem>
            <ListItem button component={Link} to="/register">
              <ListItemText primary="Регистрация" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {user && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            AiBio
          </Typography>
          
          {/* Навигация для десктопа */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {user ? (
              <>
                {navItems.map((item) => (
                  <Button
                    key={item.title}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                  >
                    {item.title}
                  </Button>
                ))}
                <IconButton
                  onClick={handleUserMenuClick}
                  color="inherit"
                  aria-controls={openUserMenu ? 'user-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={openUserMenu ? 'true' : undefined}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  id="user-menu"
                  anchorEl={anchorEl}
                  open={openUserMenu}
                  onClose={handleUserMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'user-button',
                  }}
                >
                  <MenuItem disabled>
                    {user.username} ({user.role === 'teacher' ? 'Учитель' : 'Ученик'})
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Выход</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Вход
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Регистрация
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Мобильное меню */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Лучше для мобильной производительности
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 