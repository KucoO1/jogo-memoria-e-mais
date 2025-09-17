"use client";

interface MainMenuProps {
  onSelectGame: (game: string) => void;
}

export default function MainMenu({ onSelectGame }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center gap-6 bg-gray-800 p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-extrabold text-cyan-400 mb-4">
        🎮 Escolha seu Jogo
      </h1>

      <button
        onClick={() => onSelectGame("memory")}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold shadow-lg"
      >
        🃏 Memory Game
      </button>

      <button
        onClick={() => onSelectGame("path")}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-semibold shadow-lg"
      >
        🧩 Path Memory Game
      </button>
    </div>
  );
}
