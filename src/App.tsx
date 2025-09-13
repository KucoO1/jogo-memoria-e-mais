"use client";
import { useState } from "react";
import Menu from "./components/Menu";
import GameBoard from "./components/GameBoard";

export default function App() {
  const [gameConfig, setGameConfig] = useState<{
    difficulty: "very_easy" | "easy" | "medium" | "hard" | "insane";
    theme: "animals" | "fruits" | "sports";
  } | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      {!gameConfig ? (
        <Menu onStart={setGameConfig} />
      ) : (
        <GameBoard config={gameConfig} onRestart={() => setGameConfig(null)} />
      )}
    </div>
  );
}
