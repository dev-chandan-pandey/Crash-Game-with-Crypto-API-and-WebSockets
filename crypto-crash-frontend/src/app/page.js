
'use client';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Leaderboard from './leaderboard';
const socket = io(process.env.NEXT_PUBLIC_BASE_URL);

export default function CrashGame() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState(100);
  const [cryptoType, setCryptoType] = useState('BTC');
  const [gameId, setGameId] = useState(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [activeBet, setActiveBet] = useState(null);
  const [cashoutMessage, setCashoutMessage] = useState('');
  const [status, setStatus] = useState('waiting');
  const [countdown, setCountdown] = useState(null);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`);
        setUsers(res.data);
        if (res.data.length > 0) {
          setSelectedUser(res.data[0].username);
        }
      } catch (err) {
        console.error('Error fetching users:', err.response?.data || err.message);
      }
    };

    fetchUsers();

    socket.on('connect', () => console.log('✅ Connected to WebSocket'));

    socket.on('game_start', (data) => {
      setIsGameRunning(true);
      setMultiplier(1.0);
      setStatus('running');
    });

    socket.on('countdown', (data) => {
      setCountdown(data.seconds);
      setStatus('waiting');
    });

    socket.on('multiplier', (data) => {
      setMultiplier(data.multiplier?.toFixed(2));
      setStatus('running');
    });

    socket.on('crash', (data) => {
      console.log('💥 Game Crashed at:', data.crashPoint);
      setIsGameRunning(false);
      setStatus('crashed');
      setCountdown(null);

      setTimeout(() => {
        setAmount(100);
        setCashoutMultiplier(null);
        setActiveBet(null);
        setCashoutMessage('');
      }, 5000);
    });

    socket.on('cashout_failed', (data) => {
      setCashoutMessage(data.message || 'Cashout failed. Game might have crashed.');
    });

    socket.on('cashout_success', (data) => {
      const payout = data.payout?.toFixed(2) ?? 'N/A';
      setCashoutMessage(`You cashed out at ${data.cashOutMultiplier}x and earned $${payout}`);
      setCashoutMultiplier(data.cashOutMultiplier);
      setActiveBet(null);
    });

    return () => {
      socket.off('connect');
      socket.off('game_start');
      socket.off('countdown');
      socket.off('multiplier');
      socket.off('crash');
      socket.off('cashout_failed');
      socket.off('cashout_success');
    };
  }, []);

  const handleStartGame = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/game/start`, { cryptoType });
      setGameId(res.data.game._id);
    } catch (err) {
      console.error('Error starting game:', err.response?.data || err.message);
    }
  };

  const handlePlaceBet = async () => {
    if (!gameId) return alert('Start the game first!');
    if (!selectedUser) return alert('Please select a user!');

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/bet/place`,
        {
          username: selectedUser,
          gameId,
          amountUSD: amount,
        },
        {
          headers: {
            Authorization: 'Bearer YOUR_JWT_TOKEN_HERE',
          },
        }
      );
      setActiveBet(res.data.bet);
      setCashoutMessage('');
      setStatus('waiting');
    } catch (err) {
      console.error('Error placing bet:', err.response?.data || err.message);
    }
  };

  const handleCashOut = () => {
    if (socket && activeBet) {
      socket.emit('cashout', {
        userId: activeBet.user,
        gameId: activeBet.game,
      });
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">🚀 Crypto Crash Game</h1>
<div className="my-4">
  <label>Choose Crypto: </label>
  <select
    value={cryptoType}
    onChange={(e) => setCryptoType(e.target.value)}
    className="ml-2 px-2 py-1 rounded border"
  >
    <option value="BTC">BTC</option>
    <option value="ETH">ETH</option>
  </select>
</div>

      <button onClick={handleStartGame} className="bg-purple-600 text-white px-4 py-2 rounded">Start Game</button>

      <div className="my-4">
        <label>Select User: </label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="ml-2 px-2 py-1 rounded border"
        >
          <option value="">--Please choose a user--</option>
          {users.map((user) => (
            <option key={user._id} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border px-2 py-1 rounded"
          placeholder="Enter amount in USD"
        />
        <button onClick={handlePlaceBet} className="bg-blue-600 text-white px-4 py-2 rounded">
          Place Bet
        </button>
      </div>

      <div className="text-center text-xl font-bold my-4">
        {status === 'waiting' && countdown !== null && <p>⏳ Game starts in {countdown}s</p>}
        {status === 'running' && <p>🔥 Multiplier: {multiplier}x</p>}
        {status === 'crashed' && <p className="text-red-600">💥 Game Crashed!</p>}
      </div>

      {isGameRunning && activeBet && (
        <div className="text-center">
          <button onClick={handleCashOut} className="bg-red-500 text-white px-4 py-2 rounded">
            💸 Cash Out
          </button>
        </div>
      )}

      {cashoutMessage && <p className="text-center mt-4 text-green-600 font-medium">{cashoutMessage}</p>}

      {/* === Bet Status === */}
      {amount > 0 && (
        <div className="mt-6 p-4 border rounded bg-gray-100 text-center">
          <h2 className="font-semibold mb-2">Your Bet</h2>
          <p>💵 Amount: <strong>${amount.toFixed(2)}</strong></p>

          {status === 'waiting' && <p className="text-yellow-500">⏳ Waiting for game...</p>}

          {status === 'running' && !cashoutMultiplier && (
            <p className="text-blue-500">📈 In Game – live multiplier: {multiplier}x</p>
          )}

          {status === 'running' && cashoutMultiplier && (
            <p className="text-green-600 font-semibold">✅ Cashed Out at {cashoutMultiplier}x</p>
          )}

          {status === 'crashed' && (
            <p className={cashoutMultiplier ? 'text-green-600' : 'text-red-500 font-semibold'}>
              {cashoutMultiplier ? (
                <>✅ You cashed out at {cashoutMultiplier}x</>
              ) : (
                <>💥 Lost! You didn’t cash out in time</>
              )}
            </p>
          )}
        </div>
      )}
      
        <Leaderboard/>
    </div>
  );
}
