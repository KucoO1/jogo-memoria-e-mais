"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface LeaderboardEntry {
  name: string;
  score: number;
  time: number;
}

interface CardType {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

export default function GameBoard({ config, onRestart }: GameBoardProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const timerRef = useRef<number | null>(null);

  const totalCards = useMemo(() => {
    return config.difficulty === "easy" ? 8 : config.difficulty === "medium" ? 18 : 32;
  }, [config.difficulty]);

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
    setTime(0);
    setIsLocked(false);
    setCelebrate(false);
    setGameComplete(false);

    const saved = localStorage.getItem("memory_leaderboard");
    if (saved) setLeaderboard(JSON.parse(saved));

    // reset timer interval
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = window.setInterval(() => setTime((t) => t + 1), 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [config.theme, config.difficulty, totalCards]);

  // compara viradas
  useEffect(() => {
    if (flippedCards.length < 2) return;

    setIsLocked(true);
    const [a, b] = flippedCards;
    const newCards = [...cards];

    if (newCards[a].value === newCards[b].value) {
      // acerto
      newCards[a].matched = true;
      newCards[b].matched = true;
      setCards(newCards);
      setScore((s) => s + 10);
      setTimeout(() => {
        setIsLocked(false);
        setFlippedCards([]);
      }, 400);
    } else {
      // erro
      setScore((s) => Math.max(0, s - 2));
      setTimeout(() => {
        newCards[a].flipped = false;
        newCards[b].flipped = false;
        setCards(newCards);
        setFlippedCards([]);
        setIsLocked(false);
      }, 800);
    }
  }, [flippedCards, cards]);

  // vitória
  useEffect(() => {
    if (cards.length === 0) return;
    if (cards.every((c) => c.matched)) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setGameComplete(true);
      setCelebrate(true);

      setTimeout(() => {
        const name = prompt("🎉 Parabéns! Digite seu nome para salvar no ranking:") || "Jogador";
        const newEntry: LeaderboardEntry = { name, score, time };
        const updated = [...leaderboard, newEntry]
          .sort((a, b) => b.score - a.score || a.time - b.time)
          .slice(0, 5);
        setLeaderboard(updated);
        localStorage.setItem("memory_leaderboard", JSON.stringify(updated));
      }, 600);
    }
  }, [cards, leaderboard, score, time]);

  const handleFlip = (index: number) => {
    if (isLocked || gameComplete) return;
    const c = cards[index];
    if (!c || c.flipped || c.matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    setFlippedCards((f) => [...f, index]);
  };

  // colunas do grid baseadas na dificuldade
  const getGridColumns = () => {
    switch (config.difficulty) {
      case "easy": return 4;
      case "medium": return 6;
      case "hard": return 8;
      default: return 4;
    }
  };

  const columns = getGridColumns();

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
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                ⚡ Memory Game
              </h1>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wider">
                <span className="px-3 py-1 rounded-full bg-blue-900/40 border border-blue-600/40">
                  Tema: {config.theme}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-900/40 border border-purple-600/40">
                  Dificuldade: {config.difficulty}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
              <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-slate-900/70 border border-slate-600/50 shadow-inner text-center min-w-[80px]">
                <p className="text-xs text-slate-400">⏱ Tempo</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{time}s</p>
              </div>
              <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-slate-900/70 border border-slate-600/50 shadow-inner text-center min-w-[80px]">
                <p className="text-xs text-slate-400">⭐ Pontos</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400">{score}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px #3b82f6" }}
                whileTap={{ scale: 0.95 }}
                onClick={onRestart}
                className="px-4 py-2 sm:px-6 sm:py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 shadow-lg border border-slate-500/40 
                           text-white text-sm sm:text-base"
              >
                🔄 Reiniciar
              </motion.button>
            </div>
          </motion.div>

          {/* Tabuleiro */}
          <motion.div
            className="bg-slate-900/50 p-4 sm:p-6 rounded-2xl backdrop-blur-md border border-slate-700/40 shadow-xl"
          >
            <motion.div
  layout
  className="
    w-full mx-auto 
    grid gap-2 md:gap-3 lg:gap-4 
    grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
  "
>
  {cards.map((card, idx) => (
    <motion.div
      key={card.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: idx * 0.04 }}
      className="aspect-square"
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
                className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-emerald-700/60 via-teal-700/60 to-blue-700/60 rounded-xl text-center border border-emerald-500/40 shadow-lg"
              >
                <h3 className="font-bold text-xl sm:text-2xl mb-3 text-emerald-300 drop-shadow-md">
                  🎉 Vitória!
                </h3>
                <p className="text-base sm:text-lg text-slate-200">
                  Você completou em <span className="text-blue-400 font-semibold">{time}s</span> com{" "}
                  <span className="text-emerald-400 font-semibold">{score} pontos</span>!
                </p>
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
              🏆 Ranking
            </h2>

            <Leaderboard scores={leaderboard} />

            <div className="mt-6 text-sm text-slate-300">
              <p className="mb-2 font-semibold text-white">📋 Regras:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>+10 pontos por acerto</li>
                <li>-2 pontos por erro</li>
                <li>Menor tempo → Ranking mais alto</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
      
      {celebrate && <Confetti recycle={false} numberOfPieces={2000} onConfettiComplete={() => setCelebrate(false)} />}
    </div>
  );
}