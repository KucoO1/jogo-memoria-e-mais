"use client";
import { useState } from "react";
import PathBoard from "./PathBoard";

type Difficulty = "easy" | "medium" | "hard" | "insane" | "ultra_insane";

export default function PathMemoryGame({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-emerald-600/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {!difficulty ? (
          <div className="bg-slate-800/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-700/40 w-full max-w-md">
            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4">
                <span className="text-4xl">🧩</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-emerald-400 mb-2 drop-shadow-lg">
                Path Memory
              </h1>
              <p className="text-slate-300 text-sm">Selecione a dificuldade e teste sua memória!</p>
            </div>

            {/* Botões de Dificuldade */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <button
                onClick={() => setDifficulty("easy")}
                className="group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🌱</span>
                  <span>Fácil (3x3)</span>
                  <span className="text-sm opacity-70">4 passos</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>

              <button
                onClick={() => setDifficulty("medium")}
                className="group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🌿</span>
                  <span>Médio (4x4)</span>
                  <span className="text-sm opacity-70">6 passos</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>

              <button
                onClick={() => setDifficulty("hard")}
                className="group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🌲</span>
                  <span>Difícil (5x5)</span>
                  <span className="text-sm opacity-70">8 passos</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>

              <button
                onClick={() => setDifficulty("insane")}
                className="group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🔥</span>
                  <span>Insano (6x6)</span>
                  <span className="text-sm opacity-70">12 passos</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>

              <button
                onClick={() => setDifficulty("ultra_insane")}
                className="group relative overflow-hidden px-6 py-5 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-110">💀</span>
                  <span>Ultra Insane (7x7)</span>
                  <span className="text-sm opacity-70">16 passos</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
            </div>

            {/* Botão Voltar */}
            <button
              onClick={onBack}
              className="w-full group relative overflow-hidden px-6 py-3 bg-slate-700/80 hover:bg-slate-600/80 rounded-xl text-slate-200 font-medium transition-all duration-300 border border-slate-600/50"
            >
              <div className="relative flex items-center justify-center gap-2">
                <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
                Voltar ao Menu Principal
              </div>
            </button>

            {/* Dica */}
            <div className="mt-6 p-3 bg-slate-700/50 rounded-lg border border-slate-600/40">
              <p className="text-xs text-slate-300 text-center">
                💡 Memorize a sequência de quadrados e reproduza na ordem correta!
              </p>
            </div>
          </div>
        ) : (
          <PathBoard
            difficulty={difficulty}
            onBack={() => setDifficulty(null)}
          />
        )}
      </div>
    </div>
  );
}