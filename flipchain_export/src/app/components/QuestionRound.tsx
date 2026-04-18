import { motion } from 'motion/react';
import { Question } from '../data/questions';
import { useState, useEffect } from 'react';

interface QuestionRoundProps {
  question: Question;
  timeLimit: number;
  onAnswer: (answer: number) => void;
  onTimeout?: () => void;
  isAnswerLocked: boolean;
}

export function QuestionRound({ question, timeLimit, onAnswer, onTimeout, isAnswerLocked }: QuestionRoundProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Guard: si no hay pregunta, no renderizar
  if (!question) return (
    <div className="text-center py-20 text-zinc-400 font-mono animate-pulse">
      ⏳ Cargando pregunta...
    </div>
  );

  useEffect(() => {
    setTimeLeft(timeLimit);
    setSelectedAnswer(null);
  }, [question, timeLimit]);

  useEffect(() => {
    // Timer siempre corre, independiente de si respondiste
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question]); // Solo se reinicia cuando cambia la pregunta

  const handleSelect = (index: number) => {
    if (isAnswerLocked) return;
    setSelectedAnswer(index);
  };

  const handleConfirm = () => {
    if (selectedAnswer === null || isAnswerLocked) return;
    onAnswer(selectedAnswer);
  };

  const progress = (timeLeft / timeLimit) * 100;
  const isLowTime = timeLeft <= 5;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      {/* Timer */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-purple-400 font-mono text-sm tracking-widest">TIEMPO RESTANTE</span>
          <motion.span
            animate={isLowTime ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: isLowTime ? Infinity : 0, duration: 1 }}
            className={`text-4xl font-bold ${isLowTime ? 'text-red-500' : 'text-white'}`}
          >
            {timeLeft}s
          </motion.span>
        </div>
        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border-2 border-zinc-700">
          <motion.div
            className={`h-full ${isLowTime ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-purple-600 to-violet-700'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-900/20 border-2 border-purple-900 rounded-2xl p-8 shadow-2xl overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-red-600/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-block bg-gradient-to-r from-red-500 to-purple-500 px-3 py-1 rounded-full mb-4">
            <div className="text-white text-xs font-mono tracking-widest font-bold">
              {question.category.toUpperCase()}
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {question.question}
          </h2>
        </div>
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const label = String.fromCharCode(65 + index); // A, B, C, D

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(index)}
              disabled={isAnswerLocked}
              whileHover={!isAnswerLocked ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isAnswerLocked ? { scale: 0.98 } : {}}
              className={`
                relative p-6 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'bg-gradient-to-br from-purple-900/40 to-red-900/40 border-purple-500 shadow-xl shadow-purple-500/30'
                  : 'bg-zinc-900/80 border-zinc-700 hover:border-purple-600 hover:bg-zinc-800/80'
                }
                ${isAnswerLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                disabled:cursor-not-allowed backdrop-blur-sm
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all
                    ${isSelected ? 'bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400'}
                  `}
                >
                  {label}
                </div>
                <span className="text-left text-white font-medium flex-1">
                  {option}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm Button */}
      {!isAnswerLocked && selectedAnswer !== null && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleConfirm}
          className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-4 rounded-xl transition-colors border-2 border-red-500 shadow-lg shadow-red-500/30"
        >
          CONFIRMAR RESPUESTA
        </motion.button>
      )}

      {isAnswerLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-green-500 font-mono text-lg tracking-widest"
        >
          ✓ RESPUESTA ENVIADA — Esperando fin de ronda...
        </motion.div>
      )}
    </div>
  );
}
