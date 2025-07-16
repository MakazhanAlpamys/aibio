import React, { useState } from 'react';
import { Container, Typography, Grid, Paper, Box, Tabs, Tab, Button } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';

// Компонент клеточной структуры
const CellStructure = ({ model, color = '#4caf50' }) => {
  // Более реалистичные модели клеточных структур

  if (model === 'nucleus') {
    return (
      <>
        {/* Ядерная мембрана */}
        <mesh>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshStandardMaterial 
            color="#8d6e63" 
            roughness={0.3} 
            transparent={true} 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Хроматин внутри ядра */}
        <mesh>
          <torusKnotGeometry args={[0.8, 0.2, 128, 32, 2, 3]} />
          <meshStandardMaterial color="#5d4037" roughness={0.5} />
        </mesh>
        
        {/* Ядрышко */}
        <mesh position={[0.3, 0.3, 0.3]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#3e2723" roughness={0.2} />
        </mesh>
        
        {/* Поры в ядерной мембране */}
        {Array(12).fill().map((_, i) => {
          const phi = Math.acos(-1 + (2 * i) / 12);
          const theta = Math.sqrt(12 * Math.PI) * phi;
          const x = 1.5 * Math.cos(theta) * Math.sin(phi);
          const y = 1.5 * Math.sin(theta) * Math.sin(phi);
          const z = 1.5 * Math.cos(phi);
          
          return (
            <mesh key={i} position={[x, y, z]} rotation={[0, phi, theta]}>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
              <meshStandardMaterial color="#4e342e" />
            </mesh>
          );
        })}
      </>
    );
  }
  
  if (model === 'mitochondria') {
    return (
      <>
        {/* Внешняя мембрана митохондрии */}
        <mesh>
          <capsuleGeometry args={[1, 2.5, 32, 32]} />
          <meshStandardMaterial 
            color="#ff7043" 
            roughness={0.3} 
            transparent={true} 
            opacity={0.8}
          />
        </mesh>
        
        {/* Внутренняя мембрана и кристы */}
        <mesh scale={[0.9, 0.9, 0.9]}>
          <capsuleGeometry args={[0.9, 2.3, 32, 32]} />
          <meshStandardMaterial 
            color="#ff5722" 
            roughness={0.4}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        
        {/* Кристы (складки внутренней мембраны) */}
        {Array(7).fill().map((_, i) => {
          const pos = -1.2 + i * 0.4;
          return (
            <mesh key={i} position={[0, pos, 0]} rotation={[Math.PI/2, 0, 0]}>
              <torusGeometry args={[0.7, 0.08, 16, 32]} />
              <meshStandardMaterial color="#bf360c" />
            </mesh>
          );
        })}
        
        {/* Матрикс */}
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ffccbc" />
        </mesh>
        {Array(20).fill().map((_, i) => {
          const x = (Math.random() - 0.5) * 1.5;
          const y = (Math.random() - 0.5) * 2;
          const z = (Math.random() - 0.5) * 0.7;
          const scale = 0.05 + Math.random() * 0.05;
          return (
            <mesh key={i} position={[x, y, z]} scale={[scale, scale, scale]}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color="#ffccbc" />
            </mesh>
          );
        })}
      </>
    );
  }
  
  if (model === 'chloroplast') {
    return (
      <>
        {/* Внешняя оболочка хлоропласта */}
        <mesh>
          <capsuleGeometry args={[1.2, 2.2, 32, 32]} />
          <meshStandardMaterial 
            color="#2e7d32" 
            roughness={0.3} 
            transparent={true} 
            opacity={0.8}
          />
        </mesh>
        
        {/* Внутренняя строма */}
        <mesh scale={[0.95, 0.95, 0.95]}>
          <capsuleGeometry args={[1.1, 2.1, 32, 32]} />
          <meshStandardMaterial color="#4caf50" roughness={0.5} />
        </mesh>
        
        {/* Тилакоиды - стопки */}
        {Array(3).fill().map((_, i) => {
          const pos = -0.8 + i * 0.8;
          return (
            <group key={i} position={[0, pos, 0]}>
              {/* Грана (стопка тилакоидов) */}
              {Array(5).fill().map((_, j) => {
                const posZ = -0.2 + j * 0.1;
                return (
                  <mesh key={j} position={[0, 0, posZ]}>
                    <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
                    <meshStandardMaterial color="#1b5e20" />
                  </mesh>
                );
              })}
              
              {/* Соединяющие тилакоиды */}
              <mesh rotation={[Math.PI/2, 0, 0]} position={[0.4, 0, 0]}>
                <torusGeometry args={[0.3, 0.03, 16, 32, Math.PI]} />
                <meshStandardMaterial color="#1b5e20" />
              </mesh>
              
              <mesh rotation={[Math.PI/2, 0, Math.PI]} position={[-0.4, 0, 0]}>
                <torusGeometry args={[0.3, 0.03, 16, 32, Math.PI]} />
                <meshStandardMaterial color="#1b5e20" />
              </mesh>
            </group>
          );
        })}
        
        {/* Крахмальные зерна */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#81c784" />
        </mesh>
        
        <mesh position={[0, -0.8, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#81c784" />
        </mesh>
      </>
    );
  }
  
  if (model === 'cell') {
    return (
      <>
        {/* Клеточная мембрана */}
        <mesh>
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshStandardMaterial 
            color="#bbdefb" 
            opacity={0.6} 
            transparent 
            roughness={0.2} 
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Цитоплазма */}
        <mesh>
          <sphereGeometry args={[2.4, 32, 32]} />
          <meshStandardMaterial 
            color="#e3f2fd" 
            opacity={0.3} 
            transparent 
            roughness={0.1}
          />
        </mesh>
        
        {/* Ядро */}
        <group position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]}>
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial 
              color="#8d6e63" 
              roughness={0.3} 
              transparent={true} 
              opacity={0.8}
            />
          </mesh>
          
          <mesh position={[0.3, 0.3, 0.3]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#3e2723" />
          </mesh>
        </group>
        
        {/* Митохондрии */}
        <group position={[1.2, 0.5, 0]} scale={[0.3, 0.3, 0.3]} rotation={[0, 0, Math.PI/4]}>
          <mesh>
            <capsuleGeometry args={[1, 2.5, 16, 16]} />
            <meshStandardMaterial color="#ff7043" roughness={0.3} />
          </mesh>
          
          {Array(5).fill().map((_, i) => {
            const pos = -1 + i * 0.5;
            return (
              <mesh key={i} position={[0, pos, 0]} rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[0.7, 0.08, 8, 16]} />
                <meshStandardMaterial color="#bf360c" />
              </mesh>
            );
          })}
        </group>
        
        <group position={[-0.8, -1, 0.5]} scale={[0.25, 0.25, 0.25]} rotation={[0, 0, -Math.PI/6]}>
          <mesh>
            <capsuleGeometry args={[1, 2.5, 16, 16]} />
            <meshStandardMaterial color="#ff7043" roughness={0.3} />
          </mesh>
          
          {Array(5).fill().map((_, i) => {
            const pos = -1 + i * 0.5;
            return (
              <mesh key={i} position={[0, pos, 0]} rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[0.7, 0.08, 8, 16]} />
                <meshStandardMaterial color="#bf360c" />
              </mesh>
            );
          })}
        </group>
        
        {/* Эндоплазматический ретикулум */}
        <group position={[-0.5, 1, 0]} rotation={[0, 0, Math.PI/4]}>
          <mesh>
            <torusGeometry args={[0.7, 0.1, 16, 32, Math.PI * 1.5]} />
            <meshStandardMaterial color="#ffcc80" />
          </mesh>
          
          {Array(12).fill().map((_, i) => {
            const angle = (i / 12) * Math.PI * 1.5;
            const x = 0.7 * Math.cos(angle);
            const y = 0.7 * Math.sin(angle);
            return (
              <mesh key={i} position={[x, y, 0]} scale={[0.08, 0.08, 0.08]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial color="#ffab40" />
              </mesh>
            );
          })}
        </group>
        
        {/* Аппарат Гольджи */}
        <group position={[0, -1.2, 0.5]} rotation={[Math.PI/6, 0, 0]}>
          {Array(5).fill().map((_, i) => {
            const pos = -0.1 + i * 0.08;
            const scale = 0.9 - i * 0.1;
            return (
              <mesh key={i} position={[0, 0, pos]} scale={[scale, scale, 1]}>
                <cylinderGeometry args={[0.4, 0.4, 0.03, 32]} />
                <meshStandardMaterial color={`hsl(40, ${60 + i * 8}%, ${70 - i * 5}%)`} />
              </mesh>
            );
          })}
          
          {/* Везикулы */}
          {Array(5).fill().map((_, i) => {
            const angle = (i / 5) * Math.PI;
            const x = 0.5 * Math.cos(angle);
            const y = 0.5 * Math.sin(angle);
            const scale = 0.05 + Math.random() * 0.03;
            return (
              <mesh key={i} position={[x, y, 0.2]} scale={[scale, scale, scale]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial color="#ffe0b2" />
              </mesh>
            );
          })}
        </group>
        
        {/* Лизосомы */}
        {Array(8).fill().map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 1.2 + Math.random() * 0.5;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          const z = (Math.random() - 0.5) * 1.5;
          const scale = 0.1 + Math.random() * 0.08;
          return (
            <mesh key={i} position={[x, y, z]} scale={[scale, scale, scale]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial color="#f44336" roughness={0.3} />
            </mesh>
          );
        })}
      </>
    );
  }
  
  // По умолчанию простая клетка
  return (
    <mesh>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
};

const Cell3DModel = () => {
  const [currentModel, setCurrentModel] = useState('cell');
  const [autoRotate, setAutoRotate] = useState(true);
  
  const cellModels = [
    { id: 'cell', name: 'Клетка' },
    { id: 'nucleus', name: 'Ядро' },
    { id: 'mitochondria', name: 'Митохондрия' },
    { id: 'chloroplast', name: 'Хлоропласт' }
  ];

  const handleModelChange = (event, newValue) => {
    setCurrentModel(newValue);
  };
  
  const handleRotateToggle = () => {
    setAutoRotate(!autoRotate);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        3D-модели клеточных структур
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph align="center">
        Интерактивные трехмерные модели для изучения биологии клетки
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Tabs
              value={currentModel}
              onChange={handleModelChange}
              variant="fullWidth"
              aria-label="cell model tabs"
            >
              {cellModels.map(model => (
                <Tab key={model.id} label={model.name} value={model.id} />
              ))}
            </Tabs>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ height: '60vh', position: 'relative' }}>
            <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
              <color attach="background" args={['#f5f5f5']} />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              
              <Stage environment="city" intensity={0.6}>
                <CellStructure model={currentModel} />
              </Stage>
              
              <OrbitControls autoRotate={autoRotate} autoRotateSpeed={1.5} enableDamping dampingFactor={0.1} />
            </Canvas>
            
            <Button
              variant="contained"
              color="primary"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              onClick={handleRotateToggle}
            >
              {autoRotate ? 'Остановить вращение' : 'Включить вращение'}
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {cellModels.find(model => model.id === currentModel)?.name}
            </Typography>
            
            {currentModel === 'cell' && (
              <>
                <Typography paragraph>
                  Клетка - основная структурно-функциональная единица всех живых организмов. 
                  В этой модели показаны основные компоненты эукариотической клетки, включая 
                  клеточную мембрану, ядро, митохондрии, эндоплазматический ретикулум, аппарат Гольджи и лизосомы.
                </Typography>
                <Typography paragraph>
                  Клеточная мембрана (плазмалемма) отделяет содержимое клетки от внешней среды, 
                  обеспечивая избирательную проницаемость для различных веществ. Внутри клетки 
                  находится цитоплазма - внутренняя среда, в которой располагаются органоиды.
                </Typography>
              </>
            )}
            
            {currentModel === 'nucleus' && (
              <>
                <Typography paragraph>
                  Ядро - важнейшая часть эукариотической клетки, содержащая генетический материал в виде хроматина. 
                  Оно окружено ядерной оболочкой с порами и содержит ядрышко - место синтеза рибосомных РНК.
                </Typography>
                <Typography paragraph>
                  Ядерная оболочка состоит из двух мембран с перинуклеарным пространством между ними. 
                  Ядерные поры обеспечивают транспорт молекул между ядром и цитоплазмой. Хроматин представляет 
                  собой комплекс ДНК и белков, который при делении клетки конденсируется в хромосомы.
                </Typography>
              </>
            )}
            
            {currentModel === 'mitochondria' && (
              <>
                <Typography paragraph>
                  Митохондрия - органоид, ответственный за клеточное дыхание и производство энергии в форме АТФ. 
                  Имеет двойную мембрану: гладкую наружную и внутреннюю с многочисленными складками - кристами.
                </Typography>
                <Typography paragraph>
                  Кристы значительно увеличивают площадь внутренней мембраны, где расположены ферменты 
                  дыхательной цепи и АТФ-синтаза. В матриксе митохондрий находятся собственная ДНК, рибосомы 
                  и ферменты цикла Кребса. Митохондрии способны делиться независимо от клетки.
                </Typography>
              </>
            )}
            
            {currentModel === 'chloroplast' && (
              <>
                <Typography paragraph>
                  Хлоропласт - органоид растительных клеток, в котором происходит фотосинтез. 
                  Имеет сложную внутреннюю структуру с тилакоидами, организованными в граны, 
                  и содержит пигмент хлорофилл, поглощающий солнечную энергию.
                </Typography>
                <Typography paragraph>
                  Внутри хлоропласта находится строма - внутренняя среда, где происходят реакции 
                  темновой фазы фотосинтеза (цикл Кальвина). В тилакоидах происходит световая фаза 
                  фотосинтеза с образованием АТФ и НАДФН. Хлоропласты также содержат собственную ДНК 
                  и могут накапливать крахмальные зерна.
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cell3DModel; 