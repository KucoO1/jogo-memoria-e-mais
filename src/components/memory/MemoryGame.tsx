"use client";
import { useState } from "react";
import Menu from "./Menu";
import GameBoard from "./GameBoard";

export default function MemoryGame({ onBack }: { onBack: () => void }) {
  const [gameConfig, setGameConfig] = useState<{
    difficulty: "very_easy" | "easy" | "medium" | "hard" | "insane";
    theme: "animals" | "fruits" | "sports";
  } | null>(null);

  return (
    <div className="w-full h-full flex flex-col items-center">
      {!gameConfig ? (
        <>
          <Menu onStart={setGameConfig} />
          <button
            onClick={onBack}
            className="mt-6 px-4 py-2 bg-red-600 rounded-lg"
          >
            ⬅️ Voltar
          </button>
        </>
      ) : (
        <GameBoard config={gameConfig} onRestart={() => setGameConfig(null)} />
      )}
    </div>
  );
}
