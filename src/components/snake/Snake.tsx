"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface SnakeGameProps {
  onBack: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface PowerUp {
  position: Position;
  type: 'speed' | 'slow' | 'score' | 'shrink' | 'grow';
  duration: number;
}

interface Obstacle {
  position: Position;
}

type Theme = 'neon' | 'retro' | 'minimal';
type GameMode = 'classic' | 'time' | 'survival' | 'multiplayer';

export default function SnakeGame({ onBack }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  const [isPaused, setIsPaused] = useState(false);
  const [theme, setTheme] = useState<Theme>('neon');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [timeLeft, setTimeLeft] = useState(60);
  const [activePowerUps, setActivePowerUps] = useState<{type: string, timeLeft: number}[]>([]);
  
  // Multiplayer state
  const [snake2, setSnake2] = useState<Position[]>([{ x: 15, y: 10 }]);
  const [direction2, setDirection2] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('LEFT');
  const [score2, setScore2] = useState(0);

  const gridSize = 20;
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Cores baseadas no tema
  const themeColors = {
    neon: {
      snake: '#00ff00',
      snakeHead: '#00ff88',
      snake2: '#ff00ff',
      snakeHead2: '#ff88ff',
      food: '#ff0000',
      background: '#000000',
      grid: '#222222',
      text: '#ffffff',
      powerUps: {
        speed: '#00ffff',
        slow: '#ffff00',
        score: '#ff9900',
        shrink: '#ff00ff',
        grow: '#00ff00'
      }
    },
    retro: {
      snake: '#00ff00',
      snakeHead: '#00cc00',
      snake2: '#0000ff',
      snakeHead2: '#0000cc',
      food: '#ff0000',
      background: '#0000aa',
      grid: '#0055ff',
      text: '#ffffff',
      powerUps: {
        speed: '#ffff00',
        slow: '#ff8800',
        score: '#ff00ff',
        shrink: '#00ffff',
        grow: '#00ff00'
      }
    },
    minimal: {
      snake: '#333333',
      snakeHead: '#000000',
      snake2: '#666666',
      snakeHead2: '#444444',
      food: '#ff6b6b',
      background: '#ffffff',
      grid: '#f0f0f0',
      text: '#333333',
      powerUps: {
        speed: '#4ecdc4',
        slow: '#45b7d1',
        score: '#f9c80e',
        shrink: '#f86624',
        grow: '#79c753'
      }
    }
  };

  const colors = themeColors[theme];

  // Gerar comida aleatória
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    
    // Verificar se a comida não está em cima da cobra ou obstáculos
    const isOnSnake = snake.some(segment => 
      segment.x === newFood.x && segment.y === newFood.y
    );
    const isOnObstacle = obstacles.some(obstacle =>
      obstacle.position.x === newFood.x && obstacle.position.y === newFood.y
    );
    
    if (isOnSnake || isOnObstacle) {
      return generateFood();
    }
    
    return newFood;
  }, [snake, obstacles, gridSize]);

  // Gerar power-up
  const generatePowerUp = useCallback(() => {
    if (Math.random() < 0.2) { // 20% de chance a cada comida
      const types: PowerUp['type'][] = ['speed', 'slow', 'score', 'shrink', 'grow'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const newPowerUp = {
        position: {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        },
        type,
        duration: type === 'score' ? 0 : 5000 // Duração em ms
      };
      
      // Verificar se não está em cima de nada
      const isOccupied = [
        ...snake,
        ...snake2,
        food,
        ...obstacles.map(o => o.position),
        ...powerUps.map(p => p.position)
      ].some(pos => pos.x === newPowerUp.position.x && pos.y === newPowerUp.position.y);
      
      if (!isOccupied) {
        setPowerUps(prev => [...prev, newPowerUp]);
        
        // Remover após 10 segundos se não for coletado
        setTimeout(() => {
          setPowerUps(prev => prev.filter(p => p.position !== newPowerUp.position));
        }, 10000);
      }
    }
  }, [snake, snake2, food, obstacles, powerUps, gridSize]);

  // Gerar obstáculos
  const generateObstacles = useCallback(() => {
    if (gameMode === 'survival') {
      const newObstacles: Obstacle[] = [];
      const obstacleCount = Math.floor(score / 5) + 3;
      
      for (let i = 0; i < obstacleCount; i++) {
        const obstacle = {
          position: {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
          }
        };
        
        // Verificar se não está em cima de nada importante
        const isOccupied = [
          ...snake,
          ...snake2,
          food,
          ...powerUps.map(p => p.position)
        ].some(pos => pos.x === obstacle.position.x && pos.y === obstacle.position.y);
        
        if (!isOccupied) {
          newObstacles.push(obstacle);
        }
      }
      
      setObstacles(newObstacles);
    }
  }, [snake, snake2, food, powerUps, gameMode, score, gridSize]);

  // Movimento da cobra
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      switch (direction) {
        case 'UP': head.y = (head.y - 1 + gridSize) % gridSize; break;
        case 'DOWN': head.y = (head.y + 1) % gridSize; break;
        case 'LEFT': head.x = (head.x - 1 + gridSize) % gridSize; break;
        case 'RIGHT': head.x = (head.x + 1) % gridSize; break;
      }

      // Verificar colisão com o próprio corpo
      if (prevSnake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      // Verificar colisão com obstáculos
      if (obstacles.some(obstacle => 
        obstacle.position.x === head.x && obstacle.position.y === head.y
      )) {
        setGameOver(true);
        return prevSnake;
      }

      // Verificar colisão com a outra cobra (multiplayer)
      if (gameMode === 'multiplayer' && snake2.some(segment => 
        segment.x === head.x && segment.y === head.y
      )) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake.slice(0, -1)];
      
      // Verificar se comeu a comida
      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood());
        setScore(prev => prev + 10);
        newSnake.push({ ...prevSnake[prevSnake.length - 1] });
        generatePowerUp();
        generateObstacles();
      }

      // Verificar se pegou power-up
      const collectedPowerUp = powerUps.findIndex(p => 
        p.position.x === head.x && p.position.y === head.y
      );
      
      if (collectedPowerUp !== -1) {
        const powerUp = powerUps[collectedPowerUp];
        handlePowerUp(powerUp);
        setPowerUps(prev => prev.filter((_, i) => i !== collectedPowerUp));
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, obstacles, gameMode, snake2, generateFood, generatePowerUp, generateObstacles, powerUps, gridSize]);

  // Movimento da cobra 2 (multiplayer)
  const moveSnake2 = useCallback(() => {
    if (gameOver || isPaused || gameMode !== 'multiplayer') return;

    setSnake2(prevSnake => {
      const head = { ...prevSnake[0] };
      
      switch (direction2) {
        case 'UP': head.y = (head.y - 1 + gridSize) % gridSize; break;
        case 'DOWN': head.y = (head.y + 1) % gridSize; break;
        case 'LEFT': head.x = (head.x - 1 + gridSize) % gridSize; break;
        case 'RIGHT': head.x = (head.x + 1) % gridSize; break;
      }

      // Verificar colisões (similar à cobra 1)
      if (prevSnake.slice(1).some(segment => segment.x === head.x && segment.y === head.y) ||
          obstacles.some(obstacle => obstacle.position.x === head.x && obstacle.position.y === head.y) ||
          snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake.slice(0, -1)];
      
      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood());
        setScore2(prev => prev + 10);
        newSnake.push({ ...prevSnake[prevSnake.length - 1] });
        generatePowerUp();
      }

      const collectedPowerUp = powerUps.findIndex(p => 
        p.position.x === head.x && p.position.y === head.y
      );
      
      if (collectedPowerUp !== -1) {
        const powerUp = powerUps[collectedPowerUp];
        handlePowerUp(powerUp, true);
        setPowerUps(prev => prev.filter((_, i) => i !== collectedPowerUp));
      }

      return newSnake;
    });
  }, [direction2, food, gameOver, isPaused, obstacles, gameMode, snake, generateFood, generatePowerUp, powerUps, gridSize]);

  // Manipular power-ups
  const handlePowerUp = (powerUp: PowerUp, isPlayer2 = false) => {
    switch (powerUp.type) {
      case 'speed':
        setSpeed(prev => Math.max(50, prev - 30));
        setTimeout(() => setSpeed(150), powerUp.duration);
        break;
      case 'slow':
        setSpeed(300);
        setTimeout(() => setSpeed(150), powerUp.duration);
        break;
      case 'score':
        if (isPlayer2) {
          setScore2(prev => prev + 50);
        } else {
          setScore(prev => prev + 50);
        }
        break;
      case 'shrink':
        if (isPlayer2) {
          setSnake2(prev => prev.slice(0, Math.max(3, prev.length - 3)));
        } else {
          setSnake(prev => prev.slice(0, Math.max(3, prev.length - 3)));
        }
        break;
      case 'grow':
        if (isPlayer2) {
          setSnake2(prev => [...prev, ...Array(3).fill({...prev[prev.length - 1]})]);
        } else {
          setSnake(prev => [...prev, ...Array(3).fill({...prev[prev.length - 1]})]);
        }
        break;
    }

    setActivePowerUps(prev => [...prev, { type: powerUp.type, timeLeft: powerUp.duration }]);
  };

  // Controles do teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isPaused && e.key === ' ') {
        setIsPaused(false);
        return;
      }

      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
        case 'w': if (direction2 !== 'DOWN') setDirection2('UP'); break;
        case 's': if (direction2 !== 'UP') setDirection2('DOWN'); break;
        case 'a': if (direction2 !== 'RIGHT') setDirection2('LEFT'); break;
        case 'd': if (direction2 !== 'LEFT') setDirection2('RIGHT'); break;
        case ' ': setIsPaused(prev => !prev); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, direction2, isPaused]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      moveSnake();
      if (gameMode === 'multiplayer') {
        moveSnake2();
      }
    }, speed);

    return () => clearInterval(gameLoop);
  }, [moveSnake, moveSnake2, gameOver, isPaused, speed, gameMode]);

  // Timer para modo time attack
  useEffect(() => {
    if (gameMode === 'time' && !gameOver && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameMode, gameOver, isPaused]);

  // Atualizar power-ups ativos
  useEffect(() => {
    const powerUpTimer = setInterval(() => {
      setActivePowerUps(prev => 
        prev.map(p => ({ ...p, timeLeft: p.timeLeft - 1000 }))
          .filter(p => p.timeLeft > 0)
      );
    }, 1000);

    return () => clearInterval(powerUpTimer);
  }, []);

  // Reiniciar jogo
  const restartGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setSnake2([{ x: 15, y: 10 }]);
    setFood(generateFood());
    setPowerUps([]);
    setObstacles([]);
    setDirection('RIGHT');
    setDirection2('LEFT');
    setGameOver(false);
    setScore(0);
    setScore2(0);
    setSpeed(150);
    setIsPaused(false);
    setTimeLeft(60);
    setActivePowerUps([]);
    generateObstacles();
  };

  // Iniciar jogo com modo específico
  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setScore2(0);
    setTimeLeft(mode === 'time' ? 60 : 0);
    
    if (mode === 'survival') {
      generateObstacles();
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="bg-slate-800/90 p-8 rounded-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-2">Score: {score}</p>
          {gameMode === 'multiplayer' && <p className="text-xl mb-4">Player 2: {score2}</p>}
          <div className="flex gap-4 justify-center">
            <button onClick={restartGame} className="px-6 py-3 bg-green-600 rounded-lg">
              Play Again
            </button>
            <button onClick={onBack} className="px-6 py-3 bg-blue-600 rounded-lg">
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900/90 text-white p-4">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
          <button onClick={() => setIsPaused(false)} className="px-6 py-3 bg-green-600 rounded-lg">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-2xl mb-4">
        <button onClick={onBack} className="px-4 py-2 bg-slate-700 rounded-lg">
          ← Back
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">Snake Moderno 🐍</h1>
          <div className="flex gap-4 text-sm">
            <span>Score: {score}</span>
            {gameMode === 'multiplayer' && <span>P2: {score2}</span>}
            {gameMode === 'time' && <span>Time: {timeLeft}s</span>}
          </div>
        </div>

        <div className="flex gap-2">
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="bg-slate-700 rounded px-2 py-1"
          >
            <option value="neon">Neon</option>
            <option value="retro">Retro</option>
            <option value="minimal">Minimal</option>
          </select>
          <button onClick={() => setIsPaused(true)} className="px-4 py-2 bg-slate-700 rounded-lg">
            ⏸️
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative border-2 border-slate-600 rounded-lg overflow-hidden"
        style={{
          backgroundColor: colors.background,
          backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px),
                           linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          width: '400px',
          height: '400px'
        }}
      >
        {/* Food */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${food.x * 20}px`,
            top: `${food.y * 20}px`,
            width: '20px',
            height: '20px',
            backgroundColor: colors.food
          }}
        />

        {/* Snake 1 */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute rounded"
            style={{
              left: `${segment.x * 20}px`,
              top: `${segment.y * 20}px`,
              width: '20px',
              height: '20px',
              backgroundColor: index === 0 ? colors.snakeHead : colors.snake,
              zIndex: 2
            }}
          />
        ))}

        {/* Snake 2 (Multiplayer) */}
        {gameMode === 'multiplayer' && snake2.map((segment, index) => (
          <div
            key={index}
            className="absolute rounded"
            style={{
              left: `${segment.x * 20}px`,
              top: `${segment.y * 20}px`,
              width: '20px',
              height: '20px',
              backgroundColor: index === 0 ? colors.snakeHead2 : colors.snake2,
              zIndex: 2
            }}
          />
        ))}

        {/* Obstacles */}
        {obstacles.map((obstacle, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${obstacle.position.x * 20}px`,
              top: `${obstacle.position.y * 20}px`,
              width: '20px',
              height: '20px',
              backgroundColor: '#666666',
              zIndex: 1
            }}
          />
        ))}

        {/* Power-ups */}
        {powerUps.map((powerUp, index) => (
          <div
            key={index}
            className="absolute rounded-full animate-bounce"
            style={{
              left: `${powerUp.position.x * 20}px`,
              top: `${powerUp.position.y * 20}px`,
              width: '15px',
              height: '15px',
              backgroundColor: colors.powerUps[powerUp.type],
              zIndex: 3
            }}
          />
        ))}
      </div>

      {/* Controls Info */}
      <div className="mt-4 text-center text-sm">
        <p>Controls: Player 1 - Arrows | Player 2 - WASD | Pause - Space</p>
        <div className="flex gap-2 justify-center mt-2">
          {activePowerUps.map((powerUp, index) => (
            <span key={index} className="px-2 py-1 bg-slate-700 rounded">
              {powerUp.type} ({Math.ceil(powerUp.timeLeft / 1000)}s)
            </span>
          ))}
        </div>
      </div>

      {/* Game Mode Selection */}
      {!gameMode && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-slate-800 p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-6">Select Game Mode</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => startGame('classic')} className="px-6 py-3 bg-green-600 rounded-lg">
                Classic
              </button>
              <button onClick={() => startGame('time')} className="px-6 py-3 bg-blue-600 rounded-lg">
                Time Attack
              </button>
              <button onClick={() => startGame('survival')} className="px-6 py-3 bg-red-600 rounded-lg">
                Survival
              </button>
              <button onClick={() => startGame('multiplayer')} className="px-6 py-3 bg-purple-600 rounded-lg">
                2 Players
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}