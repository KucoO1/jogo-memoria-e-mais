"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

interface ReactionRushProps {
  onBack: () => void;
}

interface ScoreData {
  name: string;
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  difficulty: string;
  date: string;
}

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'square' | 'circle' | 'triangle';
  color: string;
  createdAt: number;
  opacity: number;
}

export default function ReactionRush({ onBack }: ReactionRushProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'ultra'>('easy');
  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [highScores, setHighScores] = useState<ScoreData[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  // Refs para evitar stale closures
  const gameActiveRef = useRef(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetTimeoutRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  const targetTimeoutsRef = useRef<Set<number>>(new Set()); // Para rastrear timeouts dos targets

  const difficultyConfig = {
    easy: { spawnRate: 1500, targetLifetime: 3000, targetSize: 80, targetCount: 1, colors: ['#3B82F6', '#10B981', '#F59E0B'] },
    medium: { spawnRate: 1000, targetLifetime: 2000, targetSize: 65, targetCount: 2, colors: ['#2563EB', '#059669', '#EA580C'] },
    hard: { spawnRate: 700, targetLifetime: 1500, targetSize: 50, targetCount: 3, colors: ['#1D4ED8', '#047857', '#C2410C'] },
    ultra: { spawnRate: 400, targetLifetime: 800, targetSize: 40, targetCount: 4, colors: ['#1E40AF', '#065F46', '#9A3412', '#DC2626', '#7E22CE'] }
  };

  // Carrega recordes do localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("reactionRushPlayerName");
    const savedScores = localStorage.getItem("reactionRushHighScores");
    if (savedName) setPlayerName(savedName);
    if (savedScores) {
      try {
        setHighScores(JSON.parse(savedScores));
      } catch (error) {
        console.error("Erro ao carregar recordes:", error);
      }
    }
  }, []);

  // Função para limpar todos os timers
  const clearAllTimers = useCallback(() => {
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
      targetTimeoutRef.current = null;
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    // Limpa todos os timeouts dos targets
    targetTimeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    targetTimeoutsRef.current.clear();
  }, []);

  // Limpa timers quando o componente desmonta
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const generateTarget = useCallback((): Target => {
    const config = difficultyConfig[difficulty];
    const gameArea = gameAreaRef.current;

    const maxX = gameArea ? Math.max(0, gameArea.clientWidth - config.targetSize) : 50;
    const maxY = gameArea ? Math.max(0, gameArea.clientHeight - config.targetSize) : 50;

    return {
      id: Date.now() + Math.random(),
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
      size: config.targetSize,
      type: ['square', 'circle', 'triangle'][Math.floor(Math.random() * 3)] as 'square' | 'circle' | 'triangle',
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      createdAt: Date.now(),
      opacity: 1
    };
  }, [difficulty]);

  // Função recursiva para spawn de targets
  const spawnTargets = useCallback(() => {
    // Verifica se o jogo ainda está ativo usando ref
    if (!gameActiveRef.current) return;

    const config = difficultyConfig[difficulty];
    const newTargets: Target[] = [];
    
    for (let i = 0; i < config.targetCount; i++) {
      newTargets.push(generateTarget());
    }

    setTargets(prev => [...prev, ...newTargets]);

    // Timeout para remover targets após lifetime
    const removeTimeoutId = window.setTimeout(() => {
      // Remove da lista de timeouts ativos
      targetTimeoutsRef.current.delete(removeTimeoutId);
      
      // Só executa se o jogo ainda estiver ativo
      if (!gameActiveRef.current) return;
      
      setTargets(prev => prev.filter(t => !newTargets.some(nt => nt.id === t.id)));
      setMisses(prev => prev + newTargets.length);
    }, config.targetLifetime);

    // Adiciona à lista de timeouts ativos
    targetTimeoutsRef.current.add(removeTimeoutId);

    // Agenda o próximo spawn
    targetTimeoutRef.current = window.setTimeout(spawnTargets, config.spawnRate);
  }, [difficulty, generateTarget]);

  // Inicia o jogo
  const startGame = useCallback(() => {
    // Limpa timers existentes primeiro
    clearAllTimers();
    
    // Reset do estado
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setHits(0);
    setMisses(0);
    setShowNameInput(false);
    setGameOver(false);
    
    // Ativa o jogo
    gameActiveRef.current = true;
    setGameActive(true);

    // Timer do jogo principal
    gameTimerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Encerra o jogo quando o tempo acabar
          endGame();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Inicia o spawn de targets com um pequeno delay
    setTimeout(() => {
      if (gameActiveRef.current) {
        spawnTargets();
      }
    }, 100);
  }, [spawnTargets, clearAllTimers]);

  const handleTargetClick = useCallback((targetId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gameActiveRef.current) return;
    
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + 10);
    setHits(prev => prev + 1);
  }, []);

  const endGame = useCallback(() => {
    // Desativa o jogo
    gameActiveRef.current = false;
    setGameActive(false);
    setGameOver(true);

    // Limpa todos os timers
    clearAllTimers();
    
    // Remove targets restantes
    setTargets([]);

    // Verifica se é um novo recorde (será executado no próximo render)
    // A lógica de recorde foi movida para um useEffect
  }, [clearAllTimers]);

  // Effect para verificar novo recorde quando o jogo termina
  useEffect(() => {
    if (gameOver && !gameActive) {
      const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
      const currentBest = highScores.find(s => s.difficulty === difficulty);
      
      if (!currentBest || score > currentBest.score) {
        if (playerName) {
          saveHighScore(playerName, accuracy);
        } else {
          setShowNameInput(true);
        }
      }
    }
  }, [gameOver, gameActive, hits, misses, score, difficulty, highScores, playerName]);

  const saveHighScore = useCallback((name: string, accuracy: number) => {
    const newScore: ScoreData = { 
      name, 
      score, 
      hits, 
      misses, 
      accuracy, 
      difficulty, 
      date: new Date().toLocaleDateString('pt-BR') 
    };
    
    const updatedScores = [
      ...highScores.filter(s => s.difficulty !== difficulty), 
      newScore
    ].sort((a, b) => b.score - a.score);
    
    setHighScores(updatedScores);
    
    try {
      localStorage.setItem("reactionRushHighScores", JSON.stringify(updatedScores));
      localStorage.setItem("reactionRushPlayerName", name);
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
    
    setPlayerName(name);
    setShowNameInput(false);
  }, [score, hits, misses, difficulty, highScores]);

  const handleAreaClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && gameActiveRef.current) {
      setMisses(prev => prev + 1);
    }
  }, []);

  // Memoização do cálculo de precisão
  const accuracy = useMemo(() => {
    return hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
  }, [hits, misses]);

  const bestScore = useMemo(() => {
    return highScores.find(s => s.difficulty === difficulty) || { score: 0 };
  }, [highScores, difficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-cyan-600/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-700/40">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack} 
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-all duration-300 flex items-center hover:-translate-x-1"
          >
            <span className="mr-2">←</span> Voltar
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            ⚡ Reaction Rush
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Menu de dificuldade */}
        {!gameActive && !gameOver && (
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Selecione a Dificuldade
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {(['easy', 'medium', 'hard', 'ultra'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`p-5 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 ${
                    difficulty === diff 
                      ? 'border-blue-400 bg-blue-600/30 shadow-lg shadow-blue-500/30' 
                      : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700/70 hover:border-slate-500'
                  }`}
                >
                  <div className="text-lg font-semibold mb-2">
                    {diff === 'easy' && '😊 Fácil'}
                    {diff === 'medium' && '😐 Médio'}
                    {diff === 'hard' && '😰 Difícil'}
                    {diff === 'ultra' && '💀 Ultra'}
                  </div>
                  <div className="text-sm opacity-80">
                    {diff === 'easy' && '1 alvo, 3s'}
                    {diff === 'medium' && '2 alvos, 2s'}
                    {diff === 'hard' && '3 alvos, 1.5s'}
                    {diff === 'ultra' && '4 alvos, 0.8s'}
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={startGame} 
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30"
            >
              🚀 Começar Jogo
            </button>

            {bestScore && 'name' in bestScore && bestScore.score > 0 && (
              <div className="mt-8 p-4 bg-slate-700/40 rounded-xl border border-slate-600/40">
                <div className="text-sm text-slate-300">🏆 Recorde em {difficulty}:</div>
                <div className="font-bold text-2xl text-yellow-400">{bestScore.score} pontos</div>
                <div className="text-xs text-slate-400 mt-1">por {bestScore.name}</div>
              </div>
            )}
          </div>
        )}

        {/* Jogo ativo */}
        {gameActive && (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
                <div className="text-xs text-slate-300 mb-1">Tempo</div>
                <div className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-blue-400"}`}>
                  {timeLeft}s
                </div>
              </div>
              <div className="text-center p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
                <div className="text-xs text-slate-300 mb-1">Pontos</div>
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
              </div>
              <div className="text-center p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
                <div className="text-xs text-slate-300 mb-1">Acertos</div>
                <div className="text-2xl font-bold text-green-400">{hits}</div>
              </div>
              <div className="text-center p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
                <div className="text-xs text-slate-300 mb-1">Precisão</div>
                <div className="text-2xl font-bold text-cyan-400">{accuracy}%</div>
              </div>
            </div>

            {/* Área de jogo */}
            <div 
              ref={gameAreaRef} 
              className="relative bg-slate-900/40 border-2 border-slate-600/50 rounded-xl h-80 md:h-[450px] mb-6 overflow-hidden cursor-crosshair"
              onClick={handleAreaClick}
            >
              {targets.map((target) => (
                <div
                  key={target.id}
                  onClick={(e) => handleTargetClick(target.id, e)}
                  className={`absolute cursor-pointer transition-all duration-150 hover:scale-110 ${
                    target.type === 'circle' ? 'rounded-full' :
                    target.type === 'triangle' ? 'triangle-shape' : 'rounded-lg'
                  }`}
                  style={{
                    left: target.x,
                    top: target.y,
                    width: target.size,
                    height: target.size,
                    backgroundColor: target.color,
                    boxShadow: `0 0 20px ${target.color}80`,
                    opacity: target.opacity,
                    clipPath: target.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : ''
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Fim de jogo */}
        {gameOver && (
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              {score > bestScore.score ? '🎉 Novo Recorde!' : '🎯 Fim de Jogo!'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
                <div className="text-xs text-slate-300 mb-1">Pontuação</div>
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
                <div className="text-xs text-slate-300 mb-1">Acertos</div>
                <div className="text-2xl font-bold text-green-400">{hits}</div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
                <div className="text-xs text-slate-300 mb-1">Erros</div>
                <div className="text-2xl font-bold text-red-400">{misses}</div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
                <div className="text-xs text-slate-300 mb-1">Precisão</div>
                <div className="text-2xl font-bold text-cyan-400">{accuracy}%</div>
              </div>
            </div>

            {showNameInput && (
              <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
                <h3 className="text-lg font-semibold mb-3 text-yellow-300">🎉 Novo Recorde!</h3>
                <div className="flex gap-2 justify-center">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveHighScore(playerName || "Jogador", accuracy)}
                    className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400"
                    placeholder="Seu nome"
                    maxLength={15}
                    autoFocus
                  />
                  <button 
                    onClick={() => saveHighScore(playerName || "Jogador", accuracy)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center mb-8">
              <button 
                onClick={startGame} 
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl transition-all duration-300 font-bold hover:scale-105"
              >
                🔄 Jogar Novamente
              </button>
              <button 
                onClick={onBack} 
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-xl transition-colors"
              >
                ↩️ Voltar ao Menu
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .triangle-shape {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
}