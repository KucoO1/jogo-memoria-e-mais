"use client";
import { useEffect, useState } from "react";

interface PathBoardProps {
  difficulty: "easy" | "medium" | "hard" | "insane";
  onBack: () => void;
}

export default function PathBoard({ difficulty, onBack }: PathBoardProps) {
  const [gridSize, setGridSize] = useState<number>(3);
  const [path, setPath] = useState<number[]>([]);
  const [playerPath, setPlayerPath] = useState<number[]>([]);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [displaying, setDisplaying] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [resetKey, setResetKey] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [showCorrectPath, setShowCorrectPath] = useState<boolean>(false);

  // Configurações de dificuldade
  const difficultyConfig = {
    easy: { size: 3, length: 4, color: "from-green-500 to-emerald-600" },
    medium: { size: 4, length: 6, color: "from-yellow-500 to-amber-600" },
    hard: { size: 5, length: 8, color: "from-orange-500 to-red-600" },
    insane: { size: 6, length: 12, color: "from-purple-500 to-pink-600" }
  };

  // Gera caminho único, conectado e sem repetições
  function generatePath(size: number, length: number): number[] {
    const maxAttempts = 200;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const visited = new Set<number>();
      const path: number[] = [];

      let current = Math.floor(Math.random() * size * size);
      visited.add(current);
      path.push(current);

      while (path.length < length) {
        const neighbors: number[] = [];
        const row = Math.floor(current / size);
        const col = current % size;

        if (row > 0) neighbors.push(current - size);
        if (row < size - 1) neighbors.push(current + size);
        if (col > 0) neighbors.push(current - 1);
        if (col < size - 1) neighbors.push(current + 1);

        const validNeighbors = neighbors.filter((n) => !visited.has(n));
        if (validNeighbors.length === 0) break;

        current = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
        visited.add(current);
        path.push(current);
      }

      if (path.length === length) return path;
    }

    // Fallback
    return Array.from({ length }, (_, i) => i % (size * size));
  }

  function resetGame() {
    setResetKey((k) => k + 1);
    setPlayerPath([]);
    setMessage("");
    setVisibleIndices([]);
    setShowCorrectPath(false);
  }

  function nextLevel() {
    setLevel(level + 1);
    setScore(score + level * 10);
    resetGame();
  }

  function handleClick(index: number) {
    // Impede cliques durante exibição, com mensagem ou em quadrados já selecionados
    if (displaying || message || playerPath.includes(index)) return;

    const newPlayerPath = [...playerPath, index];
    setPlayerPath(newPlayerPath);

    const step = newPlayerPath.length - 1;
    if (path[step] !== index) {
      setMessage("❌ Você errou! O caminho correto será mostrado.");
      setScore(Math.max(0, score - 5));
      
      // Mostra o caminho correto por 3 segundos
      setShowCorrectPath(true);
      setTimeout(() => {
        setShowCorrectPath(false);
      }, 3000);
      
      return;
    }

    if (newPlayerPath.length === path.length) {
      setMessage("🎉 Parabéns! Você completou o caminho!");
      setTimeout(() => nextLevel(), 1500);
    }
  }

  // Efeito para inicializar o jogo
  useEffect(() => {
    const config = difficultyConfig[difficulty];
    setGridSize(config.size);

    const newPath = generatePath(config.size, config.length);
    setPath(newPath);
    setPlayerPath([]);
    setMessage("");
    setVisibleIndices([]);
    setDisplaying(true);
    setShowCorrectPath(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const stepDelay = 600;

    newPath.forEach((cell, i) => {
      const t = setTimeout(() => {
        setVisibleIndices((prev) => {
          if (prev.includes(cell)) return prev;
          return [...prev, cell];
        });
      }, i * stepDelay);
      timers.push(t);
    });

    const clearTimer = setTimeout(() => {
      setVisibleIndices([]);
      setDisplaying(false);
    }, newPath.length * stepDelay + 600);
    timers.push(clearTimer);

    return () => timers.forEach((tt) => clearTimeout(tt));
  }, [difficulty, resetKey, level]);

  const config = difficultyConfig[difficulty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-800/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700/40">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center"
          >
            <span className="mr-2">←</span> Voltar
          </button>
          
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${config.color} text-xs font-semibold`}>
            {difficulty.toUpperCase()}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🧠 Path Memory
        </h2>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium">
            Nível: <span className="text-purple-300">{level}</span>
          </div>
          <div className="text-sm font-medium">
            Pontuação: <span className="text-yellow-300">{score}</span>
          </div>
        </div>

        <p className="text-gray-300 text-center text-sm mb-6">
          {showCorrectPath 
            ? "🔍 Este é o caminho correto que você deveria ter seguido!" 
            : "Observe a sequência de quadrados. Quando desaparecer, reproduza o caminho na mesma ordem."
          }
        </p>

        {/* Tabuleiro responsivo */}
        <div className="flex justify-center mb-6">
          <div
            className="grid gap-2 w-full max-w-xs"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, i) => {
              const isVisible = visibleIndices.includes(i);
              const isClicked = playerPath.includes(i);
              const isInPath = path.includes(i);
              const isDisabled = displaying || !!message || playerPath.includes(i);
              
              // Determina se este quadrado faz parte do caminho correto sendo mostrado
              const isCorrectPathStep = showCorrectPath && path.includes(i);
              const pathIndex = showCorrectPath ? path.indexOf(i) : -1;

              return (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  disabled={isDisabled}
                  className={`
                    aspect-square rounded-lg transition-all duration-300 border-2 relative
                    ${showCorrectPath && isCorrectPathStep 
                      ? "bg-blue-500 border-blue-600 animate-pulse" 
                      : isVisible 
                        ? "bg-yellow-400 border-yellow-500 scale-105" 
                        : isClicked 
                          ? isInPath
                            ? "bg-green-500 border-green-600" 
                            : "bg-red-500 border-red-600"
                          : "bg-slate-700 border-slate-600 hover:bg-slate-600"
                    }
                    ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {/* Mostra o número da ordem no caminho correto */}
                  {showCorrectPath && isCorrectPathStep && (
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                      {pathIndex + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mensagem de status */}
        {message && (
          <div className={`p-3 rounded-lg text-center mb-4 font-medium ${
            message.includes("❌") 
              ? "bg-red-900/50 text-red-200" 
              : "bg-green-900/50 text-green-200"
          }`}>
            {message}
            {message.includes("❌") && !showCorrectPath && (
              <div className="text-xs mt-1">Clique em "Reiniciar" para tentar novamente</div>
            )}
          </div>
        )}

        {/* Indicador de estado */}
        <div className="text-center text-sm mb-4">
          {displaying ? (
            <div className="text-yellow-300 flex items-center justify-center">
              <span className="animate-pulse mr-2">●</span> Observando...
            </div>
          ) : showCorrectPath ? (
            <div className="text-blue-300 flex items-center justify-center">
              <span className="animate-pulse mr-2">●</span> Mostrando caminho correto...
            </div>
          ) : message ? (
            <div className="text-slate-400">Clique em "Reiniciar" para tentar novamente</div>
          ) : (
            <div className="text-green-400 flex items-center justify-center">
              <span className="mr-2">●</span> Sua vez!
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex-1"
          >
            Reiniciar
          </button>

          <button
            onClick={() => {
              setLevel(1);
              setScore(0);
              resetGame();
            }}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition-colors flex-1"
          >
            Novo Jogo
          </button>
        </div>

        {/* Progresso */}
        <div className="mt-6 bg-slate-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(playerPath.length / path.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-slate-400 text-center mt-2">
          Progresso: {playerPath.length}/{path.length}
        </div>
      </div>
    </div>
  );
}