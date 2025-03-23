// Word Flow Game data - An advanced brain training game for dyslexic users
export const wordFlowLevels = [
  {
    level: 1,
    difficulty: "beginner",
    description: "Start with basic word associations and simple decision-making tasks.",
    challenges: [
      {
        id: 1,
        type: "word_association",
        question: "Which word is most related to 'OCEAN'?",
        options: ["WATER", "MOUNTAIN", "DESERT", "FOREST"],
        answer: "WATER",
        timeLimit: 10, // seconds
        points: 10,
        explanation: "'OCEAN' and 'WATER' are directly related as an ocean is a large body of water."
      },
      {
        id: 2,
        type: "word_chain",
        question: "Complete the word chain: BOOK → PAGE → ?",
        options: ["PAPER", "COVER", "AUTHOR", "LIBRARY"],
        answer: "PAPER",
        timeLimit: 10,
        points: 10,
        explanation: "A book contains pages, and pages are made of paper, forming a logical chain."
      },
      {
        id: 3,
        type: "word_category",
        question: "Which word does NOT belong in this category: APPLE, BANANA, CARROT, ORANGE?",
        options: ["APPLE", "BANANA", "CARROT", "ORANGE"],
        answer: "CARROT",
        timeLimit: 10,
        points: 10,
        explanation: "Apple, Banana, and Orange are fruits, while Carrot is a vegetable."
      },
      {
        id: 4,
        type: "word_definition",
        question: "Which word means 'a place where books are kept'?",
        options: ["LIBRARY", "KITCHEN", "GARDEN", "BEDROOM"],
        answer: "LIBRARY",
        timeLimit: 10,
        points: 10,
        explanation: "A library is a place where collections of books are stored for reading and borrowing."
      },
      {
        id: 5,
        type: "word_association",
        question: "Which word is most related to 'FIRE'?",
        options: ["WATER", "HEAT", "TREE", "BOOK"],
        answer: "HEAT",
        timeLimit: 10,
        points: 10,
        explanation: "'FIRE' and 'HEAT' are directly related as fire produces heat."
      }
    ]
  },
  {
    level: 2,
    difficulty: "intermediate",
    description: "Challenge yourself with more complex word relationships and faster decision-making.",
    challenges: [
      {
        id: 6,
        type: "word_analogy",
        question: "BIRD is to SKY as FISH is to ?",
        options: ["WATER", "BOAT", "SCALE", "SWIM"],
        answer: "WATER",
        timeLimit: 8,
        points: 15,
        explanation: "Birds fly in the sky, while fish swim in water - both are the natural environments for these animals."
      },
      {
        id: 7,
        type: "word_chain",
        question: "Complete the word chain: CLOUD → RAIN → UMBRELLA → ?",
        options: ["WET", "DRY", "PROTECTION", "WEATHER"],
        answer: "PROTECTION",
        timeLimit: 8,
        points: 15,
        explanation: "Clouds produce rain, rain makes us use umbrellas, and umbrellas provide protection."
      },
      {
        id: 8,
        type: "word_category",
        question: "Which word does NOT belong: HAPPY, JOYFUL, TIRED, DELIGHTED?",
        options: ["HAPPY", "JOYFUL", "TIRED", "DELIGHTED"],
        answer: "TIRED",
        timeLimit: 8,
        points: 15,
        explanation: "Happy, Joyful, and Delighted are all positive emotions, while Tired is a state of physical fatigue."
      },
      {
        id: 9,
        type: "rapid_recognition",
        question: "Quickly identify the word that means 'to move quickly':",
        options: ["RUN", "WALK", "CRAWL", "STAND"],
        answer: "RUN",
        timeLimit: 5, // shorter time for rapid recognition
        points: 20,
        explanation: "'Run' means to move at a speed faster than walking."
      },
      {
        id: 10,
        type: "word_analogy",
        question: "TEACHER is to STUDENT as DOCTOR is to ?",
        options: ["NURSE", "HOSPITAL", "PATIENT", "MEDICINE"],
        answer: "PATIENT",
        timeLimit: 8,
        points: 15,
        explanation: "A teacher instructs students, while a doctor treats patients - both are professional relationships."
      }
    ]
  },
  {
    level: 3,
    difficulty: "advanced",
    description: "Master complex cognitive challenges with advanced word relationships and rapid processing.",
    challenges: [
      {
        id: 11,
        type: "word_sequence",
        question: "What comes next: BEGINNING, MIDDLE, ?",
        options: ["START", "END", "FINAL", "LAST"],
        answer: "END",
        timeLimit: 7,
        points: 20,
        explanation: "The sequence follows the logical order of positions: beginning, middle, end."
      },
      {
        id: 12,
        type: "word_analogy",
        question: "LIGHT is to DARK as NOISE is to ?",
        options: ["LOUD", "SOUND", "SILENCE", "EAR"],
        answer: "SILENCE",
        timeLimit: 7,
        points: 20,
        explanation: "Light and dark are opposites, just as noise and silence are opposites."
      },
      {
        id: 13,
        type: "rapid_recognition",
        question: "Quickly identify the word that does NOT relate to time:",
        options: ["MINUTE", "SECOND", "DISTANCE", "HOUR"],
        answer: "DISTANCE",
        timeLimit: 4,
        points: 25,
        explanation: "Minute, Second, and Hour are units of time, while Distance is a measurement of space."
      },
      {
        id: 14,
        type: "word_definition_advanced",
        question: "Which word means 'the study of the mind and behavior'?",
        options: ["PSYCHOLOGY", "BIOLOGY", "CHEMISTRY", "PHYSICS"],
        answer: "PSYCHOLOGY",
        timeLimit: 7,
        points: 20,
        explanation: "Psychology is the scientific study of the mind and behavior."
      },
      {
        id: 15,
        type: "cognitive_flexibility",
        question: "If RED means STOP and GREEN means GO, what does YELLOW mean?",
        options: ["CAUTION", "SPEED UP", "TURN", "PARK"],
        answer: "CAUTION",
        timeLimit: 7,
        points: 20,
        explanation: "In traffic signals, yellow means caution or prepare to stop, coming between green (go) and red (stop)."
      }
    ]
  },
  {
    level: 4,
    difficulty: "expert",
    description: "Push your cognitive limits with expert-level challenges requiring rapid processing and mental flexibility.",
    challenges: [
      {
        id: 16,
        type: "dual_processing",
        question: "Find the word that is both a type of animal AND a verb:",
        options: ["DUCK", "ELEPHANT", "TIGER", "GIRAFFE"],
        answer: "DUCK",
        timeLimit: 6,
        points: 30,
        explanation: "'Duck' is both an animal and a verb meaning to lower one's head quickly."
      },
      {
        id: 17,
        type: "cognitive_switching",
        question: "If 'up' means 'down' and 'left' means 'right', what does 'north' mean?",
        options: ["EAST", "WEST", "SOUTH", "NORTH"],
        answer: "SOUTH",
        timeLimit: 6,
        points: 30,
        explanation: "Following the pattern of opposites, if up means down and left means right, then north would mean south."
      },
      {
        id: 18,
        type: "rapid_processing",
        question: "Quickly identify the word with the MOST syllables:",
        options: ["INCREDIBLE", "FANTASTIC", "AMAZING", "WONDERFUL"],
        answer: "INCREDIBLE",
        timeLimit: 5,
        points: 25,
        explanation: "'Incredible' has 4 syllables (in-cred-i-ble), more than the others."
      },
      {
        id: 19,
        type: "abstract_reasoning",
        question: "Which concept does NOT fit with the others?",
        options: ["JUSTICE", "LIBERTY", "FREEDOM", "INDEPENDENCE"],
        answer: "JUSTICE",
        timeLimit: 6,
        points: 30,
        explanation: "Liberty, Freedom, and Independence all relate to being free from constraints, while Justice relates to fairness and moral rightness."
      },
      {
        id: 20,
        type: "executive_function",
        question: "If you rearrange the letters 'BRAIN', what word can you make?",
        options: ["TRAIN", "RAIN", "BRAN", "NAIL"],
        answer: "BRAIN",
        timeLimit: 6,
        points: 30,
        explanation: "The letters in 'BRAIN' can be rearranged to form 'TRAIN'."
      }
    ]
  }
];

// Game achievements to motivate players
export const achievements = [
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Complete 5 challenges in under 3 seconds each",
    icon: "flash",
    reward: 100
  },
  {
    id: "perfect_level",
    title: "Perfect Level",
    description: "Complete an entire level with 100% accuracy",
    icon: "star",
    reward: 200
  },
  {
    id: "word_master",
    title: "Word Master",
    description: "Reach level 4 and complete at least 3 expert challenges",
    icon: "trophy",
    reward: 300
  },
  {
    id: "rapid_thinker",
    title: "Rapid Thinker",
    description: "Successfully complete 10 rapid recognition challenges",
    icon: "zap",
    reward: 150
  },
  {
    id: "cognitive_champion",
    title: "Cognitive Champion",
    description: "Earn all other achievements and complete all levels",
    icon: "award",
    reward: 500
  }
];

// Game tips to help players improve
export const gameTips = [
  "Focus on the first and last letters of words to help with quick recognition.",
  "Try to create mental images that connect related words to strengthen associations.",
  "Practice deep breathing before starting a level to improve focus and reduce anxiety.",
  "If you're struggling with a particular challenge type, try breaking it down into smaller steps.",
  "Remember that consistent practice leads to improvement - even a few minutes daily can help.",
  "When facing word analogies, try to verbalize the relationship between the first pair of words.",
  "For rapid recognition tasks, trust your first instinct rather than overthinking.",
  "Use the achievements system as motivation, but don't get discouraged if you don't earn them all at once.",
  "The game adapts to your skill level - embrace the challenge as it gets harder.",
  "Take short breaks between levels to prevent mental fatigue and maintain peak performance."
];