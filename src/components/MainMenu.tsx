"use client";

export default function MainMenu({ onSelectGame }: { onSelectGame: (game: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-cyan-400">🎮 Escolha um jogo</h1>

      <button
        onClick={() => onSelectGame("memory")}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg"
      >
        🧠 Memory Game
      </button>

      <button
        onClick={() => onSelectGame("outro")}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl shadow-lg"
      >
        🚀 Outro Jogo
      </button>
    </div>
  );
}
