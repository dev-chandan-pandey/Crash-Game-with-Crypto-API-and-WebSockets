// "use client";
// import React, { useEffect, useState } from "react";
// import socket from "@/lib/socket";
// import axios from "axios";

// export default function HomePage() {
//   const [countdown, setCountdown] = useState(null);
//   const [multiplier, setMultiplier] = useState(1.0);
//   const [betAmount, setBetAmount] = useState(10);
//   const [cashOutMultiplier, setCashOutMultiplier] = useState(2.0);
//   const [gameId, setGameId] = useState(null);
//   const [betId, setBetId] = useState(null);
//   const [status, setStatus] = useState(null);

//   useEffect(() => {
//     socket.on("countdown", (data) => {
//       setCountdown(data.seconds);
//       setMultiplier(1.0);
//       setStatus(null);
//     });

//     socket.on("game_start", (data) => {
//       setGameId(data.gameId);
//     });

//     socket.on("multiplier", (data) => {
//       setMultiplier(data.multiplier);
//     });

//     socket.on("crash", (data) => {
//       setStatus(`Game crashed at ${data.multiplier}x`);
//     });

//     socket.on("AUTO_CASHOUT", (data) => {
//       setStatus(`Auto cashed out at ${data.multiplier}x | Payout: $${data.payout.toFixed(2)}`);
//     });

//     socket.on("BET_RESULT", (data) => {
//       setStatus(`Result: ${data.status} | Payout: $${data.payout.toFixed(2)}`);
//     });

//     return () => {
//       socket.off("countdown");
//       socket.off("multiplier");
//       socket.off("crash");
//       socket.off("game_start");
//       socket.off("AUTO_CASHOUT");
//       socket.off("BET_RESULT");
//     };
//   }, []);

//   const handlePlaceBet = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/api/bet/place", {
//         gameId,
//         amountUSD: betAmount,
//         cashOutMultiplier,
//       });
//       setBetId(res.data.bet._id);
//       setStatus("Bet placed!");
//     } catch (err) {
//       setStatus("Failed to place bet.");
//     }
//   };

//   const handleManualCashOut = async () => {
//     try {
//       await axios.post("http://localhost:5000/api/bet/cashout", {
//         betId,
//         gameId,
//       });
//       setStatus("Manually cashed out!");
//     } catch (err) {
//       setStatus("Failed to cash out.");
//     }
//   };

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
//       <h1 className="text-4xl font-bold mb-6">💥 Crypto Crash Game</h1>

//       {countdown !== null ? (
//         <p className="text-2xl mb-2">⏳ Game starting in: {countdown}s</p>
//       ) : (
//         <p className="text-2xl mb-2">🔥 Multiplier: {multiplier.toFixed(2)}x</p>
//       )}

//       <div className="mt-6 space-y-2">
//         <label>
//           Bet Amount ($):
//           <input
//             type="number"
//             value={betAmount}
//             onChange={(e) => setBetAmount(Number(e.target.value))}
//             className="ml-2 text-black px-2"
//           />
//         </label>
//         <br />
//         <label>
//           Cash Out At (x):
//           <input
//             type="number"
//             value={cashOutMultiplier}
//             step="0.1"
//             onChange={(e) => setCashOutMultiplier(Number(e.target.value))}
//             className="ml-2 text-black px-2"
//           />
//         </label>
//       </div>

//       <div className="mt-4 space-x-4">
//         <button
//           onClick={handlePlaceBet}
//           className="px-4 py-2 bg-green-600 rounded"
//         >
//           Place Bet
//         </button>

//         <button
//           onClick={handleManualCashOut}
//           className="px-4 py-2 bg-yellow-500 rounded"
//           disabled={!betId}
//         >
//           Manual Cashout
//         </button>
//       </div>

//       {status && <p className="mt-6 text-lg">{status}</p>}
//     </main>
//   );
// }
// 'use client';
// import { useEffect, useState, useRef } from 'react';

// export default function DashboardPage() {
//   const [socket, setSocket] = useState(null);
//   const [countdown, setCountdown] = useState(null);
//   const [multiplier, setMultiplier] = useState(1.0);
//   const [status, setStatus] = useState('waiting'); // waiting | running | crashed
//   const [gameId, setGameId] = useState(null);
//   const [betAmount, setBetAmount] = useState('');
//   const [autoCashout, setAutoCashout] = useState('');
//   const [betId, setBetId] = useState(null);
//   const [message, setMessage] = useState('');
//   const multiplierRef = useRef(1.0);

//   useEffect(() => {
//     const ws = new WebSocket('ws://localhost:5000'); // adjust if different
//     setSocket(ws);

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);

//       if (data.type === 'countdown') {
//         setCountdown(data.seconds);
//         setStatus('waiting');
//       } else if (data.type === 'game_start') {
//         setStatus('running');
//         setGameId(data.gameId);
//         setCountdown(null);
//         setMultiplier(1.0);
//       } else if (data.type === 'multiplier') {
//         setMultiplier(data.multiplier);
//         multiplierRef.current = data.multiplier;
//       } else if (data.type === 'crash') {
//         setStatus('crashed');
//         setMessage(`💥 Crashed at ${data.multiplier}x`);
//         setBetId(null);
//       } else if (data.type === 'BET_RESULT' || data.type === 'AUTO_CASHOUT') {
//         setMessage(`${data.type === 'AUTO_CASHOUT' ? '✅ Auto' : '✅ Manual'} cashout at ${data.multiplier || data.cashOutMultiplier}x! Payout: $${data.payout.toFixed(2)}`);
//         setBetId(null);
//       }
//     };

//     return () => ws.close();
//   }, []);

//   const handlePlaceBet = () => {
//     if (!betAmount || isNaN(betAmount)) {
//       setMessage('❌ Enter valid bet amount');
//       return;
//     }

//     const betData = {
//       type: 'place_bet',
//       gameId,
//       amount: parseFloat(betAmount),
//       cashOutMultiplier: autoCashout ? parseFloat(autoCashout) : undefined,
//     };

//     socket.send(JSON.stringify(betData));
//     setMessage('🎯 Bet placed');
//     setBetId('temp'); // temporary until server assigns real ID
//   };

//   const handleManualCashout = () => {
//     if (!betId) {
//       setMessage('❌ No active bet to cash out');
//       return;
//     }

//     socket.send(JSON.stringify({
//       type: 'manual_cashout',
//       gameId,
//       multiplier: multiplierRef.current,
//     }));

//     setMessage('⏳ Requesting cashout...');
//   };

//   return (
//     <main className="p-6 max-w-xl mx-auto text-center">
//       <h1 className="text-2xl font-bold mb-4">Crypto Crash Dashboard</h1>

//       <div className="mb-6">
//         {status === 'waiting' && <p className="text-yellow-600 text-lg">⏳ Game starting in: {countdown}s</p>}
//         {status === 'running' && <p className="text-green-600 text-2xl font-bold">🚀 {multiplier.toFixed(2)}x</p>}
//         {status === 'crashed' && <p className="text-red-600 text-lg">💥 Crashed</p>}
//       </div>

//       <div className="mb-4">
//         <input
//           type="number"
//           placeholder="Bet amount ($)"
//           value={betAmount}
//           onChange={(e) => setBetAmount(e.target.value)}
//           className="border p-2 rounded mr-2"
//         />
//         <input
//           type="number"
//           placeholder="Auto cashout (optional)"
//           value={autoCashout}
//           onChange={(e) => setAutoCashout(e.target.value)}
//           className="border p-2 rounded"
//         />
//       </div>

//       <div className="space-x-4 mb-4">
//         <button
//           onClick={handlePlaceBet}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Place Bet
//         </button>
//         <button
//           onClick={handleManualCashout}
//           className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//         >
//           Cash Out
//         </button>
//       </div>

//       {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
//     </main>
//   );
// }
// 'use client'
// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios'
// import Dashboard from './dashboard';
// import Leaderboard from './leaderboard';
// const socket = io('http://localhost:5000');
// export default function CrashGame() {
//    const [users, setUsers] = useState([]); // State to store users
//   const [selectedUser, setSelectedUser] = useState('');
//   const [amount, setAmount] = useState(100)
//   const [cryptoType, setCryptoType] = useState('BTC')
//   const [gameId, setGameId] = useState(null)
//   const [multiplier, setMultiplier] = useState(1.0);
//   const [isGameRunning, setIsGameRunning] = useState(false);
// const [activeBet, setActiveBet] = useState(null);
// const [cashoutMessage, setCashoutMessage] = useState('');
// useEffect(() => {
//     // Fetch users when the component mounts
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/api/users'); // Assuming an API endpoint for users
//         setUsers(res.data);
//         if (res.data.length > 0) {
//           setSelectedUser(res.data[0].username); // Set the first user as default
//         }
//       } catch (err) {
//         console.error('Error fetching users:', err.response?.data || err.message);
//       }
//     };
//     fetchUsers();
//   if (!socket) return;

//   socket.on("connect", () => console.log("✅ Connected to WebSocket"));

//   socket.on("game_start", (data) => {
//     console.log("🎮 Game Started:", data);
//     setIsGameRunning(true);
//     setMultiplier(1.0);
//   });

//   socket.on("multiplier", (data) => {
//     // console.log("📡 Multiplier Update:", data);
//     setMultiplier(data.multiplier?.toFixed(2));
//   });

//   socket.on("crash", (data) => {
//     console.log(data,"for crash")
//     console.log("💥 Game Crashed at:", data.crashPoint);
//     setIsGameRunning(false);
//   });
// socket.on("cashout_failed", (data) => {
//   console.log("❌ Cashout Failed:", data);
//   setCashoutMessage(data.message || "Cashout failed. Game might have crashed.");
// });
// socket.on("cashout_success", (data) => {
//   console.log("✅ Cashout Successful:", data);

//   const payout = data.payout?.toFixed(2) ?? "N/A";
//   setCashoutMessage(`You cashed out at ${data.cashOutMultiplier}x and earned $${payout}`);
//   setActiveBet(null);
// });

//   return () => {
//     socket.off("game_start");
//     socket.off("multiplier");
//     socket.off("crash");
//     socket.off("cashout_failed");
//     socket.off("cashout_success");
//   };
// }, []);
//   const handleStartGame = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/game/start', {
//         cryptoType,
//       })
//       console.log('Game started:', res.data)
//       setGameId(res.data.game._id)
//     } catch (err) {
//       console.error('Error starting game:', err.response?.data || err.message)
//     }
//   }

//   const handlePlaceBet = async () => {
//     if (!gameId) {
//       alert('Start the game first!')
//       return
//     }
//     if (!selectedUser) { // New check
//       alert('Please select a user!');
//       return;
//       }
//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/bet/place',
//         {
//          username: selectedUser,  // Optional if JWT is used
//           gameId,
//           amountUSD: amount,
//         },
//         {
//           headers: {
//             Authorization: 'Bearer YOUR_JWT_TOKEN_HERE', // replace if auth is required
//           },
//         }
//       )

//       console.log('Bet Placed:', res.data)
      
//     setActiveBet(res.data.bet); // Store the active bet
//     setCashoutMessage('');
//       alert('Bet placed successfully!')
//     } catch (err) {
//       console.error('Error placing bet:', err.response?.data || err.message)
//     }
//   }
// const handleCashOut = () => {
//   if (socket && activeBet) {
//     console.log("🚀 Sending cashout for user:", activeBet.user);
//     socket.emit("cashout", {
//       userId: activeBet.user,
//       gameId: activeBet.game,
//     });
//   }
// };



//   return (
//     <div>
//       <h1>Crypto Crash Game</h1>
//       <button onClick={handleStartGame}>Start Game</button>
//       <div style={{ marginTop: '1rem' }}>
//     <label htmlFor="user-select">Select User: </label>
//     <select
//       id="user-select"
//       value={selectedUser}
//       onChange={(e) => setSelectedUser(e.target.value)}
//       style={{ padding: '0.5rem', borderRadius: '4px' }}
//     >
//       <option value="">--Please choose a user--</option>
//       {users.map((user) => (
//         <option key={user._id} value={user.username}>
//           {user.username}
//         </option>
//       ))}
//     </select>
// </div>
//       <input
//         type="number"
//         value={amount}
//         onChange={(e) => setAmount(Number(e.target.value))}
//         placeholder="Enter amount in USD"
//       />
//       <button onClick={handlePlaceBet}>Place Bet</button>
//      <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
//       <h1>🎮 Crypto Crash Dashboard</h1>

//       <div style={{ marginTop: '2rem', fontSize: '2rem' }}>
//         {isGameRunning ? (
//           <span>🔥 Multiplier: <strong>{multiplier}x</strong></span>
//         ) : (
//           <span>🕒 Waiting for next game...</span>
//         )}
//       </div>
//       {isGameRunning && activeBet && (
//   <button onClick={handleCashOut}>💸 Cash Out</button>
// )}

// {cashoutMessage && <p>{cashoutMessage}</p>}

//     </div>
//     <Dashboard/>
//     <Leaderboard/>
//     </div>
//   )
// }
// 'use client';

// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';
// import Dashboard from './dashboard';
// import Leaderboard from './leaderboard';

// const socket = io('http://localhost:5000');

// export default function CrashGame() {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState('chandan');
//   const [amount, setAmount] = useState(100);
//   const [cryptoType, setCryptoType] = useState('BTC');
//   const [gameId, setGameId] = useState(null);
//   const [multiplier, setMultiplier] = useState(1.0);
//   const [isGameRunning, setIsGameRunning] = useState(false);
//   const [activeBet, setActiveBet] = useState(null);
//   const [cashoutMessage, setCashoutMessage] = useState('');
//   const [status, setStatus] = useState('waiting' | 'running' | 'crashed');
//   const [countdown, setCountdown] = useState(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/api/users');
//         setUsers(res.data);
//         if (res.data.length > 0) {
//           setSelectedUser(res.data[0].username);
//         }
//       } catch (err) {
//         console.error('Error fetching users:', err.response?.data || err.message);
//       }
//     };

//     fetchUsers();

//     if (!socket) return;

//     socket.on('connect', () => console.log('✅ Connected to WebSocket'));

//     socket.on('countdown', (data) => {
//       setCountdown(data.seconds);
//       setStatus('waiting');
//     });

//     socket.on('game_start', (data) => {
//       console.log('🎮 Game Started:', data);
//       setIsGameRunning(true);
//       setMultiplier(1.0);
//       setStatus('running');
//     });

//     socket.on('multiplier', (data) => {
//       setMultiplier(parseFloat(data.multiplier?.toFixed(2)));
//     });

//     socket.on('crash', (data) => {
//       console.log('💥 Game Crashed at:', data.crashPoint);
//       setIsGameRunning(false);
//       setStatus('crashed');
//       setCountdown(null);
//     });

//     socket.on('cashout_success', (data) => {
//       const payout = data.payout?.toFixed(2) ?? 'N/A';
//       setCashoutMessage(`✅ Cashed out at ${data.cashOutMultiplier}x for $${payout}`);
//       setActiveBet(null);
//     });

//     socket.on('cashout_failed', (data) => {
//       setCashoutMessage(data.message || '❌ Cashout failed. Game might have crashed.');
//     });

//     return () => {
//       socket.off('connect');
//       socket.off('game_start');
//       socket.off('countdown');
//       socket.off('multiplier');
//       socket.off('crash');
//       socket.off('cashout_success');
//       socket.off('cashout_failed');
//     };
//   }, []);

//   const handleStartGame = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/game/start', { cryptoType });
//       setGameId(res.data.game._id);
//     } catch (err) {
//       console.error('Error starting game:', err.response?.data || err.message);
//     }
//   };

//   const handlePlaceBet = async () => {
//     if (!gameId) return alert('Start the game first!');
//     if (!selectedUser) return alert('Please select a user!');

//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/bet/place',
//         {
//           username: selectedUser,
//           gameId,
//           amountUSD: amount,
//         }
//       );

//       setActiveBet(res.data.bet);
//       setCashoutMessage('');
//       alert('✅ Bet placed successfully!');
//     } catch (err) {
//       console.error('Error placing bet:', err.response?.data || err.message);
//     }
//   };

//   const handleCashOut = () => {
//     if (socket && activeBet) {
//       console.log("🚀 Sending cashout for user:", activeBet.user);
//       socket.emit('cashout', {
//         userId: activeBet.user,
//         gameId: activeBet.game,
//       });
//     }
//   };

//   return (
//     <div className="p-4 max-w-2xl mx-auto font-sans">
//       <h1 className="text-3xl font-bold mb-4 text-center">🚀 Crypto Crash Game</h1>
//   <button 
//   className="bg-blue-600 text-white px-4 py-2 rounded"
//   onClick={handleStartGame}>
//     Start Game</button>
//       <div className="mb-4">
//         <label>Select User: </label>
//         <select
//           value={selectedUser}
//           onChange={(e) => setSelectedUser(e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="">-- Choose a user --</option>
//           {users.map((user) => (
//             <option key={user._id} value={user.username}>
//               {user.username}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex items-center gap-2 mb-4">
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(Number(e.target.value))}
//           className="border p-2 rounded w-full"
//           placeholder="Bet Amount (USD)"
//         />
//         <button
//           onClick={handlePlaceBet}
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Place Bet
//         </button>
//       </div>

//       <div className="text-center mb-6">
//         {status === 'waiting' && countdown !== null && (
//           <p className="text-yellow-500 text-lg">⏳ Game starts in {countdown}s</p>
//         )}
//         {status === 'running' && (
//           <p className="text-green-600 text-3xl font-bold">{multiplier.toFixed(2)}x</p>
//         )}
//         {status === 'crashed' && (
//           <p className="text-red-500 text-2xl font-semibold">💥 Crashed!</p>
//         )}
//       </div>

//       {isGameRunning && activeBet && (
//         <button
//           onClick={handleCashOut}
//           className="bg-red-500 text-white px-6 py-2 rounded block mx-auto"
//         >
//           💸 Cash Out
//         </button>
//       )}

//       {cashoutMessage && (
//         <div className="mt-4 text-center text-sm text-gray-700">{cashoutMessage}</div>
//       )}

//       <div className="mt-6">
//         <Dashboard />
//         <Leaderboard />
//       </div>
//     </div>
//   );
// }
'use client';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Leaderboard from './leaderboard';
const socket = io('http://localhost:5000');
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
        const res = await axios.get('http://localhost:5000/api/users');
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
      const res = await axios.post('http://localhost:5000/api/game/start', { cryptoType });
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
        'http://localhost:5000/api/bet/place',
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
