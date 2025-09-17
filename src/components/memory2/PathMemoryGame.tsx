"use client";
import { useState } from "react";
import PathBoard from "./PathBoard";

type Difficulty = "easy" | "medium" | "hard" | "insane";

export default function PathMemoryGame({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  return (
    <div className="flex flex-col items-center">
      {!difficulty ? (
        <>
          <h1 className="text-2xl font-bold text-cyan-400 mb-6">
            🧩 Path Memory
          </h1>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setDifficulty("easy")}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              Fácil (3x3)
            </button>
            <button
              onClick={() => setDifficulty("medium")}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
            >
              Médio (4x4)
            </button>
            <button
              onClick={() => setDifficulty("hard")}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Difícil (5x5)
            </button>
            <button
              onClick={() => setDifficulty("insane")}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Insano (6x6)
            </button>
          </div>

          <button
            onClick={onBack}
            className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg"
          >
            ⬅️ Voltar
          </button>
        </>
      ) : (
        <PathBoard
          difficulty={difficulty}
          onBack={() => setDifficulty(null)} // volta só pro menu de dificuldade
        />
      )}
    </div>
  );
}
