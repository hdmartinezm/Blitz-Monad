import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { Trophy, Coins, Heart } from 'lucide-react';

interface WinnerProps {
  prizePool: number;
  donationAmount: number;
  donationPercentage: number;
  onClaim: () => void;
  onPlayAgain: () => void;
}

export function Winner({ prizePool, donationAmount, donationPercentage, onClaim, onPlayAgain }: WinnerProps) {
  useEffect(() => {
    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#dc2626', '#fbbf24', '#ffffff'],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#dc2626', '#fbbf24', '#ffffff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Trophy with Glow */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1 }}
        className="relative"
      >
        {/* Glow Effect */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 blur-3xl bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600"
        />

        <Trophy className="w-40 h-40 text-yellow-500 relative z-10 drop-shadow-2xl" />
      </motion.div>

      {/* Winner Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <motion.h1
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent mb-4"
        >
          VICTORIA
        </motion.h1>
        <div className="flex items-center justify-center gap-3 text-yellow-500 font-mono text-lg tracking-widest">
          <div className="h-px w-12 bg-yellow-500" />
          ÚLTIMO SOBREVIVIENTE
          <div className="h-px w-12 bg-yellow-500" />
        </div>
      </motion.div>

      {/* Prize Pool */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 border-2 border-yellow-600 rounded-2xl p-8 shadow-2xl space-y-4"
      >
        <div className="flex items-center gap-4">
          <Coins className="w-12 h-12 text-yellow-500" />
          <div>
            <div className="text-yellow-500 text-sm font-mono mb-1 tracking-widest">
              TU PREMIO
            </div>
            <div className="text-5xl font-bold text-white">
              {prizePool.toFixed(3)} ETH
            </div>
          </div>
        </div>

        <div className="h-px bg-yellow-600/30" />

        <div className="flex items-center gap-3 text-pink-400">
          <Heart className="w-6 h-6 fill-pink-400" />
          <div>
            <div className="text-pink-400 text-xs font-mono mb-1">DONACIÓN A ONG</div>
            <div className="text-2xl font-bold">
              {donationAmount.toFixed(3)} ETH ({donationPercentage}%)
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClaim}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-black font-bold py-4 px-8 rounded-xl transition-colors border-2 border-yellow-500 shadow-lg shadow-yellow-500/30"
        >
          RECLAMAR PREMIO
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgain}
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-8 rounded-xl transition-colors border-2 border-zinc-600"
        >
          JUGAR DE NUEVO
        </motion.button>
      </div>
    </div>
  );
}
