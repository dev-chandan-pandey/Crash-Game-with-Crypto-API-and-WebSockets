// pages/leaderboard.tsx
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [games, setGames] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/history/recent");
      const data = await res.json();
      if (data.success) {
        setGames(data.history);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);
// console.log(games,"games")
  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📜 Game History</h1>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Game ID</th>
            {/* <th className="p-2 border">Crypto</th> */}
            <th className="p-2 border">Crash Point</th>
            <th className="p-2 border">Started</th>
            <th className="p-2 border">Ended</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game._Id} className="border-b">
              <td className="p-2 border text-sm text-blue-600">{game.gameId.slice(-6)}</td>
              {/* <td className="p-2 border">{game.cryptoType}</td> */}
              {/* <td className="p-2 border text-red-600 font-bold">{game.crashPoint}x</td> */}
              
              <td className="p-2 border text-red-600 font-bold">
                <span
                className={`font-semibold ${
                game.crashPoint < 2 ? "text-red-500" : "text-green-600"
              }`}
            >
              {game.crashPoint.toFixed(2)}x
            </span>
            </td>
              <td className="p-2 border text-sm">{new Date(game.startedAt).toLocaleTimeString()}</td>
              <td className="p-2 border text-sm">{new Date(game.endedAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
