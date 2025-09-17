import { useState } from "react";

const difficulties = {
  very_easy: { label: "Muito Fácil (2x2)", size: 4 },
  easy: { label: "Fácil (4x4)", size: 8 },
  medium: { label: "Médio (6x6)", size: 18 },
  hard: { label: "Difícil (8x8)", size: 32 },
  insane: { label: "Insano (10x10)", size: 50 },
};

// ✅ Definindo o tipo correto para as props
type MenuProps = {
  onStart: (config: { 
    difficulty: keyof typeof difficulties; 
    theme: "animals" | "fruits" | "sports";
  }) => void;
};

export default function Menu({ onStart }: MenuProps) {
  const [difficulty, setDifficulty] = useState<keyof typeof difficulties>("easy");
  const [theme, setTheme] = useState<"animals" | "fruits" | "sports">("animals");

  return (
    <div className="p-8 rounded-xl bg-gray-800 shadow-xl text-center space-y-6">
      <h1 className="text-3xl font-bold text-cyan-400">🎮 Memory Game</h1>

      <div>
        <h2 className="text-lg mb-2">Dificuldade</h2>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as keyof typeof difficulties)}
          className="p-2 rounded bg-gray-700"
        >
          {Object.entries(difficulties).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-lg mb-2">Tema</h2>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className="p-2 rounded bg-gray-700"
        >
          <option value="animals">🐶 Animais</option>
          <option value="fruits">🍎 Frutas</option>
          <option value="sports">⚽ Esportes</option>
        </select>
      </div>

      <button
        onClick={() => onStart({ difficulty, theme })}
        className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition"
      >
        Iniciar Jogo
      </button>
    </div>
  );
}
