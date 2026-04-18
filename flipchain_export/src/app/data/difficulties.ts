export interface Difficulty {
  id: 'easy' | 'medium' | 'hard' | 'insane';
  name: string;
  buyIn: number;
  timeLimit: number;
  color: string;
  gradient: string;
  description: string;
}

export const DIFFICULTIES: Difficulty[] = [
  {
    id: 'easy',
    name: 'Fácil',
    buyIn: 0.05,
    timeLimit: 20,
    color: '#10B981',
    gradient: 'from-emerald-600 to-green-700',
    description: 'Preguntas básicas, más tiempo',
  },
  {
    id: 'medium',
    name: 'Medio',
    buyIn: 0.1,
    timeLimit: 15,
    color: '#F59E0B',
    gradient: 'from-amber-600 to-orange-700',
    description: 'Preguntas moderadas, tiempo estándar',
  },
  {
    id: 'hard',
    name: 'Difícil',
    buyIn: 0.25,
    timeLimit: 12,
    color: '#EF4444',
    gradient: 'from-red-600 to-rose-700',
    description: 'Preguntas difíciles, menos tiempo',
  },
  {
    id: 'insane',
    name: 'Insano',
    buyIn: 0.5,
    timeLimit: 10,
    color: '#8B5CF6',
    gradient: 'from-purple-600 to-violet-700',
    description: 'Preguntas extremas, tiempo mínimo',
  },
];
