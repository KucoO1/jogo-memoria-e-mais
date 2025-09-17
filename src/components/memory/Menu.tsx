import { useState } from "react";

const difficulties = {
  very_easy: { label: "Muito Fácil (2x2)", size: 4 },
  easy: { label: "Fácil (4x4)", size: 8 },
  medium: { label: "Médio (6x6)", size: 18 },
  hard: { label: "Difícil (8x8)", size: 32 },
  insane: { label: "Insano (10x10)", size: 50 },
};

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-emerald-600/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 bg-slate-800/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-700/40 w-full max-w-md mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full mb-4">
            <span className="text-4xl">🎮</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 mb-2 drop-shadow-lg">
            Memory Game
          </h1>
          <p className="text-slate-300 text-sm">Configure seu jogo e desafie sua memória!</p>
        </div>

        {/* Configurações */}
        <div className="w-full space-y-6">
          {/* Seletor de Dificuldade */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full"></div>
              <h2 className="text-lg font-semibold text-slate-200">Dificuldade</h2>
            </div>
            
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as keyof typeof difficulties)}
                className="w-full p-4 bg-slate-700/80 border border-slate-600/50 rounded-xl text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer"
              >
                {Object.entries(difficulties).map(([key, { label }]) => (
                  <option key={key} value={key} className="bg-slate-800 text-slate-200">{label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Seletor de Tema */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
              <h2 className="text-lg font-semibold text-slate-200">Tema</h2>
            </div>
            
            <div className="relative">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full p-4 bg-slate-700/80 border border-slate-600/50 rounded-xl text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all cursor-pointer"
              >
                <option value="animals" className="bg-slate-800 text-slate-200">🐶 Animais</option>
                <option value="fruits" className="bg-slate-800 text-slate-200">🍎 Frutas</option>
                <option value="sports" className="bg-slate-800 text-slate-200">⚽ Esportes</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Visualização do Tema */}
          <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600/40">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Visualização do Tema:</h3>
            <div className="flex justify-center gap-3">
              {theme === "animals" && (
                <>
                  <span className="text-2xl">🐶</span>
                  <span className="text-2xl">🐱</span>
                  <span className="text-2xl">🐰</span>
                </>
              )}
              {theme === "fruits" && (
                <>
                  <span className="text-2xl">🍎</span>
                  <span className="text-2xl">🍌</span>
                  <span className="text-2xl">🍇</span>
                </>
              )}
              {theme === "sports" && (
                <>
                  <span className="text-2xl">⚽</span>
                  <span className="text-2xl">🏀</span>
                  <span className="text-2xl">🎾</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Botão de Iniciar */}
        <button
          onClick={() => onStart({ difficulty, theme })}
          className="w-full group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-cyan-600 via-purple-600 to-cyan-600 bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-2xl text-lg font-bold text-white shadow-2xl transition-all duration-500 hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative flex items-center justify-center gap-2">
            <span className="transition-transform duration-300 group-hover:scale-110">🚀</span>
            Iniciar Jogo
          </span>
        </button>

        {/* Informações adicionais */}
        <div className="text-center text-xs text-slate-400 mt-2">
          <p>Encontre os pares correspondentes no menor tempo possível!</p>
        </div>
      </div>
    </div>
  );
}