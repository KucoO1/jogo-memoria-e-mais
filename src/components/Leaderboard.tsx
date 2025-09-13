interface LeaderboardEntry {
  name: string;
  score: number;
  time: number;
}

export default function Leaderboard({ scores }: { scores: LeaderboardEntry[] }) {
  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">🏆 Ranking</h2>
      {scores.length === 0 ? (
        <p className="text-gray-400">Nenhum recorde ainda.</p>
      ) : (
        <ul className="space-y-2">
          {scores.map((entry, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-3 rounded-lg bg-gray-700/50"
            >
              <span className="font-bold text-cyan-300">
                {index + 1}. {entry.name}
              </span>
              <span className="text-gray-300">
                ⭐ {entry.score} pts | ⏱️ {entry.time}s
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
