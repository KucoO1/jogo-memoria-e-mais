"use client";
import { useState } from "react";
import MainMenu from "./components/MainMenu";
import MemoryGame from "./components/memory/MemoryGame";
import PathMemoryGame from "./components/pathMemory/PathMemoryGame";
import SequenceRush from "./components/sequenceRush/SequenceRush";
import MathChallenge from "./components/mathChallenge/MathChallenge";
import SnakeGame from "./components/snake/Snake";
import ReactionRush from "./components/reflexos/reflexosGame";

export default function App() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      {!selectedGame ? (
        <MainMenu onSelectGame={setSelectedGame} />
      ) : selectedGame === "memory" ? (
        <MemoryGame onBack={() => setSelectedGame(null)} />
      ) : selectedGame === "path" ? (
        <PathMemoryGame onBack={() => setSelectedGame(null)} />
      ) : selectedGame === "sequence" ? (
        <SequenceRush onBack={() => setSelectedGame(null)} />
      ) : selectedGame === "reaction" ? (
        <ReactionRush onBack={() => setSelectedGame(null)} />
      ) : selectedGame === "math" ? (
        <MathChallenge onBack={() => setSelectedGame(null)} />
      ) : selectedGame === "snake" ? (
        <SnakeGame onBack={() => setSelectedGame(null)} />
      ) 
      : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">🚧 Jogo em desenvolvimento...</p>
          <button
            onClick={() => setSelectedGame(null)}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            ⬅️ Voltar
          </button>
        </div>
      )}
    </div>
  );
}