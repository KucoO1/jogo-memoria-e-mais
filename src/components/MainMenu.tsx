"use client";

interface MainMenuProps {
  onSelectGame: (game: string) => void;
}

export default function MainMenu({ onSelectGame }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-emerald-600/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/20 rounded-full blur-2xl animate-pulse delay-1500"></div>
        <div className="absolute top-1/4 right-1/3 w-60 h-60 bg-orange-600/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-red-600/20 rounded-full blur-2xl animate-pulse delay-750"></div>
        <div className="absolute top-3/4 left-1/4 w-52 h-52 bg-green-600/20 rounded-full blur-2xl animate-pulse delay-1250"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 bg-slate-800/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-700/40 w-full max-w-md mx-auto">
        {/* Cabeçalho com efeito de destaque */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
            <span className="text-3xl">🎮</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 mb-2 drop-shadow-lg">
            Game Hub
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">Escolha seu jogo e desafie sua mente!</p>
        </div>

        {/* Botões de jogos */}
        <div className="w-full space-y-5">
          <button
            onClick={() => onSelectGame("memory")}
            className="w-full group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🃏</span>
              <span>Memory Game</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>

          <button
            onClick={() => onSelectGame("path")}
            className="w-full group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🧩</span>
              <span>Path Memory</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>

          <button
            onClick={() => onSelectGame("sequence")}
            className="w-full group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🔢</span>
              <span>Sequence Rush</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>

          <button
            onClick={() => onSelectGame("reaction")}
            className="w-full group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">⚡</span>
              <span>Reaction Rush</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>

          <button
            onClick={() => onSelectGame("math")}
            className="w-full group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🧮</span>
              <span>Math Challenge</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>

          <button
            onClick={() => onSelectGame("snake")}
            className="w-full group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🐍</span>
              <span>Snake Moderno</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-400 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </div>

        {/* Rodapé */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">Desafie sua memória, concentração, agilidade mental, reflexos, raciocínio lógico e coordenação!</p>
        </div>

        {/* Informações dos jogos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="text-center p-2 bg-slate-700/40 rounded">
            <span className="block font-semibold">🃏 Memória</span>
            <span>Encontre os pares</span>
          </div>
          <div className="text-center p-2 bg-slate-700/40 rounded">
            <span className="block font-semibold">🧩 Caminho</span>
            <span>Repita sequências</span>
          </div>
          <div className="text-center p-2 bg-slate-700/40 rounded">
            <span className="block font-semibold">🔢 Números</span>
            <span>Memorize números</span>
          </div>
          <div className="text-center p-2 bg-slate-700/40 rounded">
            <span className="block font-semibold">⚡ Reação</span>
            <span>Teste seus reflexos</span>
          </div>
          <div className="text-center p-2 bg-slate-700/40 rounded">
            <span className="block font-semibold">🧮 Matemática</span>
            <span>Desafie a mente</span>
          </div>
          <div className="text-center p-2 bg-slate-700/40 rounded">
            <span className="block font-semibold">🐍 Snake</span>
            <span>Coordenação motora</span>
          </div>
        </div>
      </div>
    </div>
  );
}