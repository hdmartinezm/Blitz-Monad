import { motion } from 'motion/react';

interface EliminationProps {
  correctAnswer: number;
  playerAnswer: number;
  isEliminated: boolean;
  survivorsCount: number;
  onContinue: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function Elimination({
  correctAnswer,
  playerAnswer,
  isEliminated,
  survivorsCount,
  onContinue,
}: EliminationProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Correct Answer Reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-green-400 text-sm font-mono mb-6 tracking-widest flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-green-400" />
          RESPUESTA CORRECTA
          <div className="h-px w-8 bg-green-400" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: 3, duration: 0.5 }}
          className="inline-block bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 border-4 border-green-400 shadow-2xl shadow-green-500/50"
        >
          <div className="text-8xl font-bold text-white">
            {OPTION_LABELS[correctAnswer]}
          </div>
        </motion.div>
      </motion.div>

      {/* Player Result */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md"
      >
        {isEliminated ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: 3, duration: 0.5 }}
            className="bg-gradient-to-br from-red-950 to-rose-950 border-4 border-red-600 rounded-2xl p-10 text-center shadow-2xl shadow-red-600/50 relative overflow-hidden"
          >
            {/* Background effect */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-gradient-to-br from-red-600 to-transparent"
            />

            <div className="relative z-10">
              <div className="text-8xl mb-4">💀</div>
              <div className="text-4xl font-bold text-red-400 mb-3">
                ELIMINADO
              </div>
              <div className="text-zinc-400 font-mono text-sm">
                {playerAnswer === -1 ? 'SIN RESPUESTA' : `SELECCIONASTE: ${OPTION_LABELS[playerAnswer]}`}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-green-950 to-emerald-950 border-4 border-green-600 rounded-2xl p-10 text-center shadow-2xl shadow-green-600/50 relative overflow-hidden"
          >
            {/* Background effect */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-gradient-to-br from-green-600 to-transparent"
            />

            <div className="relative z-10">
              <div className="text-8xl mb-4">✓</div>
              <div className="text-4xl font-bold text-green-400 mb-3">
                ¡SOBREVIVISTE!
              </div>
              <div className="text-zinc-400 font-mono text-sm">
                SELECCIONASTE: {OPTION_LABELS[playerAnswer]}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Survivors Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 text-center"
      >
        <div className="text-zinc-400 text-sm font-mono mb-2 tracking-widest">
          JUGADORES RESTANTES
        </div>
        <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          {survivorsCount}
        </div>
      </motion.div>

      {!isEliminated && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onContinue}
          className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold py-4 px-8 rounded-xl transition-colors border-2 border-purple-400 shadow-lg shadow-purple-500/30"
        >
          SIGUIENTE RONDA
        </motion.button>
      )}
    </div>
  );
}
