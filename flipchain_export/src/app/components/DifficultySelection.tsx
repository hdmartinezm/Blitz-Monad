import { motion } from 'motion/react';
import { DIFFICULTIES, Difficulty } from '../data/difficulties';
import { Zap, Clock, Coins, ChevronRight } from 'lucide-react';

interface DifficultySelectionProps {
  onSelect: (difficulty: Difficulty) => void;
}

export function DifficultySelection({ onSelect }: DifficultySelectionProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-5xl font-bold text-white mb-4">Elige tu Dificultad</h2>
        <p className="text-zinc-400 text-lg">
          Mayor riesgo, mayor recompensa
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DIFFICULTIES.map((difficulty, index) => (
          <motion.button
            key={difficulty.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(difficulty)}
            className={`
              relative p-8 rounded-2xl border-3 transition-all text-left
              bg-gradient-to-br ${difficulty.gradient}
              border-2 hover:border-4 hover:shadow-2xl
              group overflow-hidden
            `}
            style={{
              borderColor: difficulty.color,
            }}
          >
            {/* Background Glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${difficulty.color}, transparent 70%)`,
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Title */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-bold text-white">{difficulty.name}</h3>
                <Zap className="w-8 h-8 text-white" />
              </div>

              {/* Description */}
              <p className="text-white/80 mb-6">{difficulty.description}</p>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/90">
                  <Coins className="w-5 h-5" />
                  <div>
                    <div className="text-xs text-white/60">Buy-in</div>
                    <div className="font-bold text-lg">{difficulty.buyIn} ETH</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Clock className="w-5 h-5" />
                  <div>
                    <div className="text-xs text-white/60">Tiempo por pregunta</div>
                    <div className="font-bold text-lg">{difficulty.timeLimit}s</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <motion.div
                className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            {/* Difficulty Badge */}
            {difficulty.id === 'insane' && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full px-4 py-1 border-2 border-yellow-400 shadow-lg">
                <span className="text-xs font-bold text-white">EXTREMO</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
