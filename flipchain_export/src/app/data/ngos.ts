export interface NGO {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const NGOS: NGO[] = [
  {
    id: 'red-cross',
    name: 'Cruz Roja Internacional',
    description: 'Ayuda humanitaria en emergencias y desastres',
    icon: '🏥',
    color: '#DC2626',
  },
  {
    id: 'unicef',
    name: 'UNICEF',
    description: 'Protección de los derechos de la infancia',
    icon: '👶',
    color: '#0EA5E9',
  },
  {
    id: 'wwf',
    name: 'WWF',
    description: 'Conservación de la naturaleza y biodiversidad',
    icon: '🐼',
    color: '#16A34A',
  },
  {
    id: 'doctors-without-borders',
    name: 'Médicos Sin Fronteras',
    description: 'Asistencia médica en zonas de conflicto',
    icon: '⚕️',
    color: '#EF4444',
  },
  {
    id: 'save-the-children',
    name: 'Save the Children',
    description: 'Derechos y bienestar infantil',
    icon: '🎈',
    color: '#F59E0B',
  },
  {
    id: 'greenpeace',
    name: 'Greenpeace',
    description: 'Protección del medio ambiente',
    icon: '🌍',
    color: '#10B981',
  },
  {
    id: 'amnesty',
    name: 'Amnistía Internacional',
    description: 'Derechos humanos y justicia',
    icon: '🕊️',
    color: '#FBBF24',
  },
  {
    id: 'oxfam',
    name: 'Oxfam',
    description: 'Lucha contra la pobreza y desigualdad',
    icon: '🤝',
    color: '#059669',
  },
];

export const calculateDonationPercentage = (playerCount: number): number => {
  // 3 jugadores = 10%, 25 jugadores = 25%
  // Fórmula lineal: 10 + ((playerCount - 3) / (25 - 3)) * (25 - 10)
  if (playerCount <= 3) return 10;
  if (playerCount >= 25) return 25;

  return Math.round(10 + ((playerCount - 3) / (25 - 3)) * 15);
};
