"use client";

interface ScoreBoardProps {
  score: number;
  moves: number;
  time: number;
}

export default function ScoreBoard({ score, moves, time }: ScoreBoardProps) {
  return (
    <div className="flex justify-around p-4 bg-gray-100 shadow">
      <p className="font-bold">⭐ Pontos: {score}</p>
      <p className="font-bold">🎯 Jogadas: {moves}</p>
      <p className="font-bold">⏱️ Tempo: {time}s</p>
    </div>
  );
}
