"use client";
import { useState, useEffect } from "react";

interface SequenceRushProps {
  onBack: () => void;
}

interface ScoreData {
  name: string;
  score: number;
  level: number;
  sequenceLength: number;
  date: string;
}

export default function SequenceRush({ onBack }: SequenceRushProps) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isDisplaying, setIsDisplaying] = useState(true);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState<ScoreData[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [showHighScores, setShowHighScores] = useState(false);

  // Configurações de nível
  const levelConfig = {
    sequenceLength: Math.min(3 + Math.floor(level / 2), 10),
    displayTime: Math.max(1000 - (level * 50), 400),
    numbersRange: Math.min(9 + Math.floor(level / 3), 50)
  };

  // Carrega recordes e nome do jogador
  useEffect(() => {
    const savedName = localStorage.getItem("sequenceRushPlayerName");
    const savedHighScores = localStorage.getItem("sequenceRushHighScores");
    
    if (savedName) setPlayerName(savedName);
    if (savedHighScores) setHighScores(JSON.parse(savedHighScores));

    startNewLevel();
  }, []);

  // Salva recordes
  const saveHighScores = (newScore: ScoreData) => {
    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score || b.level - a.level)
      .slice(0, 5); // Top 5 recordes

    setHighScores(updatedScores);
    localStorage.setItem("sequenceRushHighScores", JSON.stringify(updatedScores));
  };

  // Gera sequência aleatória
  const generateSequence = () => {
    const newSequence: number[] = [];
    for (let i = 0; i < levelConfig.sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * levelConfig.numbersRange) + 1);
    }
    return newSequence;
  };

  const startNewLevel = () => {
    setGameOver(false);
    setMessage("");
    setPlayerSequence([]);
    const newSequence = generateSequence();
    setSequence(newSequence);
    setIsDisplaying(true);

    setTimeout(() => {
      setIsDisplaying(false);
      setMessage("Sua vez! Repita a sequência!");
    }, levelConfig.displayTime * levelConfig.sequenceLength);
  };

  const handleNumberClick = (number: number) => {
    if (isDisplaying || gameOver) return;

    const newPlayerSequence = [...playerSequence, number];
    setPlayerSequence(newPlayerSequence);

    if (number !== sequence[newPlayerSequence.length - 1]) {
      endGame();
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      levelComplete();
    }
  };

  const levelComplete = () => {
    const pointsEarned = level * 10;
    setScore(score + pointsEarned);
    setLevel(level + 1);
    setMessage(`🎉 Nível completo! +${pointsEarned} pontos`);
    
    setTimeout(() => {
      startNewLevel();
    }, 1500);
  };

  const endGame = () => {
    setGameOver(true);
    setMessage("❌ Errou! Fim de jogo.");
    
    // Verifica se é um novo recorde
    const currentBest = highScores[0];
    if (!currentBest || score > currentBest.score || 
        (score === currentBest.score && level > currentBest.level)) {
      
      let name = playerName;
      if (!name) {
        name = prompt("Novo recorde! Digite seu nome:") || "Jogador";
        setPlayerName(name);
        localStorage.setItem("sequenceRushPlayerName", name);
      }
      
      const newScore: ScoreData = {
        name,
        score,
        level,
        sequenceLength: sequence.length,
        date: new Date().toLocaleDateString('pt-BR')
      };

      saveHighScores(newScore);
    }
  };

  const restartGame = () => {
    setLevel(1);
    setScore(0);
    setShowHighScores(false);
    startNewLevel();
  };

  const bestScore = highScores[0] || { score: 0, level: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-800/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700/40">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center"
          >
            <span className="mr-2">←</span> Voltar
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            🔢 Sequence Rush
          </h1>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
            <div className="text-xs text-slate-400">Nível</div>
            <div className="text-xl font-bold text-cyan-400">{level}</div>
          </div>
          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
            <div className="text-xs text-slate-400">Pontos</div>
            <div className="text-xl font-bold text-yellow-400">{score}</div>
          </div>
          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
            <div className="text-xs text-slate-400">Recorde</div>
            <div className="text-xl font-bold text-green-400">{bestScore.score}</div>
          </div>
        </div>

        {/* Área de Jogo */}
        <div className="mb-6">
          {isDisplaying ? (
            <div className="text-center py-8">
              <div className="text-lg text-cyan-300 mb-4">Memorize a sequência...</div>
              <div className="flex justify-center items-center space-x-3 text-2xl font-mono">
                {sequence.map((num, index) => (
                  <span key={index} className="bg-cyan-600 px-3 py-2 rounded animate-bounce">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-lg text-green-300 mb-4">{message}</div>
              <div className="flex justify-center items-center space-x-3 text-2xl font-mono">
                {playerSequence.map((num, index) => (
                  <span key={index} className="bg-green-600 px-3 py-2 rounded">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Teclado Numérico */}
        {!isDisplaying && !gameOver && (
          <div className="grid grid-cols-5 gap-2 mb-6">
            {Array.from({ length: levelConfig.numbersRange }, (_, i) => i + 1)
              .slice(0, 20)
              .map((number) => (
                <button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-bold"
                >
                  {number}
                </button>
              ))}
          </div>
        )}

        {/* Mensagens de Status */}
        {message && (
          <div className={`p-3 rounded-lg text-center mb-4 ${
            message.includes("❌") ? "bg-red-900/50" : "bg-green-900/50"
          }`}>
            {message}
            {gameOver && highScores.length > 0 && score >= bestScore.score && (
              <div className="text-sm mt-2">🏆 Novo recorde alcançado!</div>
            )}
          </div>
        )}

        {/* Botões de Controle */}
        <div className="flex gap-3 justify-center mb-4">
          {gameOver ? (
            <>
              <button
                onClick={restartGame}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors flex-1"
              >
                🎮 Jogar Novamente
              </button>
              <button
                onClick={() => setShowHighScores(!showHighScores)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors flex-1"
              >
                {showHighScores ? "⬆️" : "🏆"} Recordes
              </button>
            </>
          ) : (
            <button
              onClick={restartGame}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors flex-1"
            >
              🔄 Reiniciar
            </button>
          )}
        </div>

        {/* Tabela de Recordes */}
        {showHighScores && highScores.length > 0 && (
          <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
            <h3 className="text-sm font-semibold mb-3 text-center text-yellow-300">🏆 Top Recordes</h3>
            <div className="space-y-2">
              {highScores.map((scoreData, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-2 rounded ${
                    index === 0 ? "bg-yellow-900/30 border border-yellow-600/40" : "bg-slate-600/40"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-xs font-bold mr-2">#{index + 1}</span>
                    <span className="text-sm font-medium">{scoreData.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-yellow-300">{scoreData.score} pts</div>
                    <div className="text-xs text-slate-400">Nvl {scoreData.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="p-3 bg-slate-700/50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">📝 Como Jogar:</h3>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Memorize a sequência de números mostrada</li>
            <li>• Repita a sequência na mesma ordem</li>
            <li>• Cada nível aumenta a dificuldade</li>
            <li>• Errou = Fim de jogo!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}