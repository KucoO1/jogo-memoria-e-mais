"use client";
import { useState } from "react";
import MainMenu from "./components/MainMenu";
import MemoryGame from "./components/memory/MemoryGame";
// futuramente: import OutroJogo from "./components/outro/OutroJogo";

export default function App() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      {!selectedGame ? (
        <MainMenu onSelectGame={setSelectedGame} />
      ) : selectedGame === "memory" ? (
        <MemoryGame onBack={() => setSelectedGame(null)} />
      ) : (
        <div>
          <p>🚧 Jogo em desenvolvimento...</p>
          <button
            onClick={() => setSelectedGame(null)}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
}
