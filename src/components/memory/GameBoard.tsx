"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import Leaderboard from "./Leaderboard";
import Confetti from "react-confetti";

interface GameBoardProps {
  config: {
    difficulty: "very_easy" | "easy" | "medium" | "hard" | "insane";
    theme: "animals" | "fruits" | "sports";
  };
  onRestart: () => void;
}

const THEMES: Record<string, string[]> = {
  animals: ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🦁", "🐸", "🐵", "🐧"],
  fruits: ["🍎", "🍌", "🍇", "🍉", "🍊", "🥝", "🍓", "🍍", "🥭", "🍒"],
  sports: ["⚽", "🏀", "🎾", "🏈", "🏐", "🥏", "🥎", "⛷️", "🏓", "🤿"],
};

interface CardType {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

interface HighScore {
  name: string;
  score: number;
  time: number;
  moves: number;
  difficulty: string;
  theme: string;
  date: string;
}

export default function GameBoard({ config, onRestart }: GameBoardProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<HighScore[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [playerName, setPlayerName] = useState<string>("");

  const timerRef = useRef<number | null>(null);

  const totalCards = useMemo(() => {
    switch (config.difficulty) {
      case "very_easy": return 4;
      case "easy": return 8;
      case "medium": return 12;
      case "hard": return 16;
      case "insane": return 20;
      default: return 8;
    }
  }, [config.difficulty]);

  // Carrega nome do jogador e leaderboard
  useEffect(() => {
    const savedName = localStorage.getItem("memoryPlayerName");
    const savedLeaderboard = localStorage.getItem("memoryLeaderboard");
    
    if (savedName) setPlayerName(savedName);
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
  }, []);

  // Salva melhor pontuação
  const saveHighScore = (newScore: HighScore) => {
    const currentBest = leaderboard.find(entry => 
      entry.difficulty === config.difficulty && entry.theme === config.theme
    );

    if (!currentBest || newScore.score > currentBest.score || 
        (newScore.score === currentBest.score && newScore.time < currentBest.time)) {
      
      const updatedLeaderboard = [
        ...leaderboard.filter(entry => 
          !(entry.difficulty === config.difficulty && entry.theme === config.theme)
        ),
        newScore
      ];
      
      setLeaderboard(updatedLeaderboard);
      localStorage.setItem("memoryLeaderboard", JSON.stringify(updatedLeaderboard));
    }
  };

  // INIT: cria e embaralha deck
  useEffect(() => {
    const pairs = totalCards / 2;
    const emojis = THEMES[config.theme].slice(0, pairs);
    const deck: CardType[] = [...emojis, ...emojis]
      .map((value, index) => ({ value, id: index, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setTime(0);
    setIsLocked(false);
    setCelebrate(false);
    setGameComplete(false);
    setScoreSaved(false);

    // reset timer interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [config.theme, config.difficulty, totalCards]);

  // compara viradas
  useEffect(() => {
    if (flippedCards.length < 2) return;

    setIsLocked(true);
    setMoves((m) => m + 1);

    const [a, b] = flippedCards;
    setTimeout(() => {
      setCards((prevCards) => {
        const newCards = [...prevCards];

        if (newCards[a].value === newCards[b].value) {
          // acerto - +10 pontos
          newCards[a].matched = true;
          newCards[b].matched = true;
          setScore((s) => s + 10);
        } else {
          // erro - -2 pontos
          newCards[a].flipped = false;
          newCards[b].flipped = false;
          setScore((s) => Math.max(0, s - 2));
        }

        return newCards;
      });

      setFlippedCards([]);
      setIsLocked(false);
    }, 600);
  }, [flippedCards]);

  // vitória
  useEffect(() => {
    if (cards.length === 0 || scoreSaved) return;
    
    if (cards.every((c) => c.matched)) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setGameComplete(true);
      setCelebrate(true);

      // Salva a pontuação
      setTimeout(() => {
        let name = playerName;
        
        // Se não tem nome salvo, pede o nome
        if (!name) {
          name = prompt("🎉 Parabéns! Digite seu nome:") || "Jogador";
          setPlayerName(name);
          localStorage.setItem("memoryPlayerName", name);
        }

        const newScore: HighScore = {
          name,
          score,
          time,
          moves,
          difficulty: config.difficulty,
          theme: config.theme,
          date: new Date().toLocaleDateString('pt-BR')
        };

        saveHighScore(newScore);
        setScoreSaved(true);
      }, 600);
    }
  }, [cards, scoreSaved, score, time, moves, playerName, config.difficulty, config.theme]);

  const handleFlip = (index: number) => {
    if (isLocked || gameComplete) return;
    const c = cards[index];
    if (!c || c.flipped || c.matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    setFlippedCards((f) => [...f, index]);
  };

  // Sistema responsivo de grid baseado na dificuldade
  const getGridResponsiveClass = () => {
    switch (config.difficulty) {
      case "very_easy": return "grid-cols-2 sm:grid-cols-2";
      case "easy": return "grid-cols-3 sm:grid-cols-4";
      case "medium": return "grid-cols-3 sm:grid-cols-4";
      case "hard": return "grid-cols-4 sm:grid-cols-4";
      case "insane": return "grid-cols-4 sm:grid-cols-5";
      default: return "grid-cols-3 sm:grid-cols-4";
    }
  };

  const gridResponsiveClass = getGridResponsiveClass();

  // Filtra leaderboard para mostrar apenas a melhor pontuação de cada dificuldade/tema
  const bestScores = leaderboard.sort((a, b) => b.score - a.score || a.time - b.time);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-4 sm:p-6 relative overflow-hidden">
      {/* Fundo com gradientes animados */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-700/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-3xl animate-pulse delay-300"></div>
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-emerald-600/30 rounded-full blur-2xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 relative z-10">
        {/* Painel esquerdo - Jogo */}
        <div className="flex-1">
          {/* Cabeçalho */}
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-center mb-6 p-4 sm:p-6 rounded-2xl 
                       bg-slate-800/60 backdrop-blur-md border border-slate-700/40 shadow-[0_0_25px_rgba(59,130,246,0.2)]"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                ⚡ Memory Game
              </h1>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wider">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-900/40 border border-blue-600/40">
                  {config.theme}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-purple-900/40 border border-purple-600/40">
                  {config.difficulty}
                </span>
                {playerName && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-900/40 border border-green-600/40">
                    👤 {playerName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
              <div className="px-2 py-1 sm:px-3 sm:py-2 rounded-xl bg-slate-900/70 border border-slate-600/50 shadow-inner text-center min-w-[70px]">
                <p className="text-xs text-slate-400">⏱️</p>
                <p className="text-lg sm:text-xl font-bold text-blue-400">{time}s</p>
              </div>
              <div className="px-2 py-1 sm:px-3 sm:py-2 rounded-xl bg-slate-900/70 border border-slate-600/50 shadow-inner text-center min-w-[70px]">
                <p className="text-xs text-slate-400">⭐</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-400">{score}</p>
              </div>
              <div className="px-2 py-1 sm:px-3 sm:py-2 rounded-xl bg-slate-900/70 border border-slate-600/50 shadow-inner text-center min-w-[70px]">
                <p className="text-xs text-slate-400">🎯</p>
                <p className="text-lg sm:text-xl font-bold text-purple-400">{moves}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px #3b82f6" }}
                whileTap={{ scale: 0.95 }}
                onClick={onRestart}
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 shadow-lg border border-slate-500/40 
                           text-white text-xs sm:text-sm"
              >
                🔄
              </motion.button>
            </div>
          </motion.div>

          {/* Tabuleiro */}
          <motion.div
            className="bg-slate-900/50 p-3 sm:p-4 rounded-2xl backdrop-blur-md border border-slate-700/40 shadow-xl"
          >
            <motion.div
              layout
              className={`w-full mx-auto grid gap-2 sm:gap-3 ${gridResponsiveClass}`}
            >
              {cards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  className="aspect-square flex justify-center items-center"
                >
                  <Card
                    value={card.value}
                    flipped={card.flipped || card.matched}
                    onClick={() => handleFlip(idx)}
                    disabled={isLocked || gameComplete}
                  />
                </motion.div>
              ))}
            </motion.div>

            {gameComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-700/60 via-teal-700/60 to-blue-700/60 rounded-xl text-center border border-emerald-500/40 shadow-lg"
              >
                <h3 className="font-bold text-lg sm:text-xl mb-2 text-emerald-300 drop-shadow-md">
                  🎉 Vitória!
                </h3>
                <p className="text-sm sm:text-base text-slate-200">
                  {time}s • {score}pts • {moves} jogadas
                </p>
                {scoreSaved && (
                  <p className="text-xs text-emerald-200 mt-2">
                    Pontuação salva para {config.difficulty} - {config.theme}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Painel direito - Ranking */}
        <div className="w-full lg:w-80 xl:w-96">
          <motion.div
            className="bg-slate-800/70 p-4 sm:p-6 rounded-2xl backdrop-blur-lg border border-slate-700/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-slate-600/40 pb-2 text-blue-300">
              🏆 Melhores Pontuações
            </h2>

            {bestScores.length > 0 ? (
              <div className="space-y-3">
                {bestScores.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      entry.difficulty === config.difficulty && entry.theme === config.theme
                        ? "bg-emerald-900/30 border border-emerald-600/40"
                        : "bg-slate-700/50 border border-slate-600/40"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-cyan-300">{entry.name}</span>
                      <span className="text-yellow-300 font-bold">⭐ {entry.score}</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>⏱️ {entry.time}s</span>
                        <span>🎯 {entry.moves}</span>
                      </div>
                      <div className="mt-1 text-slate-400">
                        {entry.difficulty} • {entry.theme} • {entry.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Nenhuma pontuação ainda</p>
            )}

            <div className="mt-4 text-xs sm:text-sm text-slate-300">
              <p className="mb-2 font-semibold text-white">📋 Regras:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>+10 pontos por acerto</li>
                <li>-2 pontos por erro</li>
                <li>Maior pontuação → Melhor ranking</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
      
      {celebrate && <Confetti recycle={false} numberOfPieces={2000} onConfettiComplete={() => setCelebrate(false)} />}
    </div>
  );
}