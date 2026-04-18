import { motion } from 'motion/react';
import { Category } from '../data/questions';
import { Sparkles } from 'lucide-react';

interface DiceRollProps {
  category: Category;
}

export function DiceRoll({ category }: DiceRollProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-12">
      {/* Animated Dice */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative"
      >
        {/* Glow Effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl blur-2xl"
        />

        {/* Dice Container */}
        <div className="relative w-40 h-40 bg-gradient-to-br from-red-600 via-purple-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-red-400">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-8xl"
          >
            🎲
          </motion.div>
        </div>

        {/* Sparkles */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute -top-6 -right-6"
        >
          <Sparkles className="w-12 h-12 text-yellow-400 fill-yellow-400" />
        </motion.div>
      </motion.div>

      {/* Category Display */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-purple-400 text-sm font-mono mb-4 tracking-widest flex items-center justify-center gap-2"
        >
          <div className="h-px w-12 bg-purple-400" />
          CATEGORÍA SELECCIONADA
          <div className="h-px w-12 bg-purple-400" />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-red-400 via-purple-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
            {category.toUpperCase()}
          </div>

          {/* Underline */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1, duration: 0.5 }}
            className="h-1 bg-gradient-to-r from-red-500 via-purple-500 to-violet-500 mx-auto mt-4 rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
