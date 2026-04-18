export type Category =
  | 'General Knowledge'
  | 'Movies & Series'
  | 'Video Games'
  | 'Science & Tech'
  | 'Sports'
  | 'History';

export interface Question {
  category: Category;
  question: string;
  options: string[];
  correctAnswer: number; // 0-3 for A/B/C/D
}

export const CATEGORIES: Category[] = [
  'General Knowledge',
  'Movies & Series',
  'Video Games',
  'Science & Tech',
  'Sports',
  'History',
];

export const QUESTIONS: Question[] = [
  // General Knowledge
  {
    category: 'General Knowledge',
    question: 'What is the capital of Japan?',
    options: ['Seoul', 'Tokyo', 'Beijing', 'Bangkok'],
    correctAnswer: 1,
  },
  {
    category: 'General Knowledge',
    question: 'How many continents are there?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
  },
  {
    category: 'General Knowledge',
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correctAnswer: 3,
  },
  {
    category: 'General Knowledge',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
  },

  // Movies & Series
  {
    category: 'Movies & Series',
    question: 'Who directed "Inception"?',
    options: ['Steven Spielberg', 'Christopher Nolan', 'James Cameron', 'Ridley Scott'],
    correctAnswer: 1,
  },
  {
    category: 'Movies & Series',
    question: 'What year was the first "Star Wars" movie released?',
    options: ['1975', '1977', '1979', '1980'],
    correctAnswer: 1,
  },
  {
    category: 'Movies & Series',
    question: 'In "Breaking Bad", what is Walter White\'s alias?',
    options: ['Scarface', 'The Cook', 'Heisenberg', 'Mr. White'],
    correctAnswer: 2,
  },
  {
    category: 'Movies & Series',
    question: 'Which movie won Best Picture at the 2020 Oscars?',
    options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
    correctAnswer: 2,
  },

  // Video Games
  {
    category: 'Video Games',
    question: 'What year was Minecraft first released?',
    options: ['2009', '2010', '2011', '2012'],
    correctAnswer: 0,
  },
  {
    category: 'Video Games',
    question: 'Who is the main character in "The Legend of Zelda"?',
    options: ['Zelda', 'Link', 'Ganon', 'Epona'],
    correctAnswer: 1,
  },
  {
    category: 'Video Games',
    question: 'What is the best-selling video game of all time?',
    options: ['Tetris', 'Minecraft', 'GTA V', 'Wii Sports'],
    correctAnswer: 1,
  },
  {
    category: 'Video Games',
    question: 'In which game do you play as Master Chief?',
    options: ['Destiny', 'Halo', 'Call of Duty', 'Titanfall'],
    correctAnswer: 1,
  },

  // Science & Tech
  {
    category: 'Science & Tech',
    question: 'What does CPU stand for?',
    options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Process Utility', 'Core Processing Unit'],
    correctAnswer: 0,
  },
  {
    category: 'Science & Tech',
    question: 'What is the speed of light?',
    options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
    correctAnswer: 0,
  },
  {
    category: 'Science & Tech',
    question: 'Who invented the telephone?',
    options: ['Nikola Tesla', 'Thomas Edison', 'Alexander Graham Bell', 'Guglielmo Marconi'],
    correctAnswer: 2,
  },
  {
    category: 'Science & Tech',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
  },

  // Sports
  {
    category: 'Sports',
    question: 'How many players are on a soccer team?',
    options: ['9', '10', '11', '12'],
    correctAnswer: 2,
  },
  {
    category: 'Sports',
    question: 'In which sport is "love" a score?',
    options: ['Golf', 'Tennis', 'Badminton', 'Squash'],
    correctAnswer: 1,
  },
  {
    category: 'Sports',
    question: 'How many rings are on the Olympic flag?',
    options: ['4', '5', '6', '7'],
    correctAnswer: 1,
  },
  {
    category: 'Sports',
    question: 'What is the diameter of a basketball hoop in inches?',
    options: ['16', '18', '20', '22'],
    correctAnswer: 1,
  },

  // History
  {
    category: 'History',
    question: 'In what year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: 2,
  },
  {
    category: 'History',
    question: 'Who was the first President of the United States?',
    options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
    correctAnswer: 1,
  },
  {
    category: 'History',
    question: 'Which ancient wonder is still standing?',
    options: ['Colossus of Rhodes', 'Hanging Gardens', 'Great Pyramid of Giza', 'Lighthouse of Alexandria'],
    correctAnswer: 2,
  },
  {
    category: 'History',
    question: 'What year did the Berlin Wall fall?',
    options: ['1987', '1988', '1989', '1990'],
    correctAnswer: 2,
  },
];
