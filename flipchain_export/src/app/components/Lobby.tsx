import { motion } from 'motion/react';
import { Coins, Users, Skull, Heart, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { calculateDonationPercentage } from '../data/ngos';

interface LobbyProps {
  playerCount: number;
  confirmedCount: number;
  prizePool: number;
  donationAmount: number;
  donationPercentage: number;
  buyIn: number;
  difficultyName: string;
  onJoin: () => void;
  onStart: () => void;
  hasJoined: boolean;
  isConfirmed: boolean;
  isHost?: boolean;
}

export function Lobby({
  playerCount,
  confirmedCount,
  prizePool,
  donationAmount,
  donationPercentage,
  buyIn,
  difficultyName,
  onJoin,
  onStart,
  hasJoined,
  isConfirmed,
  isHost = false,
}: LobbyProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Solo auto-countdown con 2+ jugadores
    if (confirmedCount >= 2 && !countdown) {
      setCountdown(5); // Cambiado de 60 a 5 segundos
    }
  }, [confirmedCount]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // NO auto-start, solo mostrar mensaje
      setCountdown(null);
      // onStart(); // REMOVIDO - no auto-start
    }
  }, [countdown]);
  return (
    <div className="flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Skull className="w-12 h-12 text-red-600" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-violet-500 bg-clip-text text-transparent tracking-tight">
            FLIPCHAIN
          </h1>
          <Skull className="w-12 h-12 text-red-600" />
        </div>
        <p className="text-red-500 font-mono text-sm tracking-widest mb-2">
          DEADLY TRIVIA POT
        </p>
        <div className="inline-block bg-gradient-to-r from-purple-600 to-violet-700 px-4 py-1 rounded-full border border-purple-400">
          <span className="text-white font-bold text-sm">{difficultyName}</span>
        </div>
      </motion.div>

      {/* Game Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-900/20 border-2 border-purple-900 rounded-2xl p-8 shadow-2xl shadow-purple-900/30"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-zinc-500 text-xs font-mono mb-1">BUY-IN</div>
            <div className="text-2xl font-bold text-white">{buyIn} MON</div>
          </div>
          <div>
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-zinc-500 text-xs font-mono mb-1">JUGADORES</div>
            <div className="text-2xl font-bold text-white">{confirmedCount}/{playerCount}</div>
          </div>
          <div className="col-span-2">
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Coins className="w-8 h-8 text-green-500 mx-auto mb-2" />
              </motion.div>
              <div className="text-zinc-500 text-xs font-mono mb-2">PRIZE POOL TOTAL</div>
              <div className="text-3xl font-bold text-green-500 mb-3">{prizePool.toFixed(3)} MON</div>

              <div className="h-px bg-zinc-700 mb-3" />

              <div className="flex items-center justify-center gap-2 text-pink-500 mb-1">
                <Heart className="w-4 h-4 fill-pink-500" />
                <div className="text-xs font-mono">DONACIÓN ONG</div>
              </div>
              <div className="text-xl font-bold text-pink-400">
                {donationAmount.toFixed(3)} ETH ({donationPercentage}%)
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rules */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-6"
      >
        <h3 className="text-red-500 font-mono text-sm mb-4 tracking-widest">REGLAS DE JUEGO</h3>
        <ul className="space-y-2 text-zinc-400 text-sm">
          <li>• Mínimo 2 jugadores para iniciar</li>
          <li>• Responde correctamente la pregunta de cada ronda antes de que se acabe el tiempo</li>
          <li>• Respuesta incorrecta o timeout = ELIMINACIÓN</li>
          <li>• El último superviviente gana todo el prize pool</li>
        </ul>
      </motion.div>

      {/* Countdown Timer */}
      {countdown !== null && countdown > 0 && confirmedCount >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-gradient-to-r from-orange-900/30 to-red-900/30 border-2 border-orange-600 rounded-xl p-6"
        >
          <div className="flex items-center justify-center gap-4">
            <Clock className="w-8 h-8 text-orange-500" />
            <div className="text-center">
              <div className="text-orange-500 text-xs font-mono mb-1">LISTO PARA INICIAR EN</div>
              <motion.div
                animate={countdown <= 3 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: countdown <= 3 ? Infinity : 0, duration: 1 }}
                className={`text-4xl font-bold ${countdown <= 3 ? 'text-red-500' : 'text-white'}`}
              >
                {countdown}s
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ready to start message */}
      {countdown === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-600 rounded-xl p-6"
        >
          <div className="text-center">
            <div className="text-green-500 text-lg font-mono mb-2">✅ LISTO PARA INICIAR</div>
            <div className="text-zinc-400 text-sm">El host puede iniciar el juego ahora</div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="w-full flex flex-col gap-4">
        {!hasJoined ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onJoin}
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-6 rounded-xl transition-all border-2 border-red-500 shadow-lg shadow-red-500/30 text-xl"
          >
            UNIRSE AL JUEGO ({buyIn} MON)
          </motion.button>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-green-500 font-mono tracking-widest text-lg"
            >
              ✓ EN EL LOBBY
            </motion.div>
            {/* Host puede iniciar con 1+ jugador, o después del countdown */}
            {isHost && (countdown === null || countdown === 0) && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStart}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold py-6 rounded-xl transition-all border-2 border-purple-400 shadow-lg shadow-purple-500/30 text-xl"
              >
                🚀 INICIAR JUEGO ({confirmedCount} jugador{confirmedCount !== 1 ? 'es' : ''})
              </motion.button>
            )}
            {!isHost && confirmedCount < 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-zinc-500 font-mono text-sm"
              >
                ⏳ Esperando más jugadores (mínimo 2)...
              </motion.div>
            )}
            {!isHost && confirmedCount >= 2 && countdown === null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-yellow-500 font-mono text-sm"
              >
                ⏳ El juego iniciará automáticamente en breve...
              </motion.div>
            )}
          </>
        )}
      </div>

      {hasJoined && confirmedCount < 2 && isHost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-500 font-mono text-sm text-center"
        >
          Puedes iniciar ahora o esperar más jugadores (auto-start con 2+)
        </motion.div>
      )}
    </div>
  );
}
