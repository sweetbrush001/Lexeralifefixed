// Pattern Match Game data
export const patternLevels = [
  {
    level: 1,
    difficulty: "easy",
    patterns: [
      {
        id: 1,
        type: "sequence",
        question: "What comes next in the sequence?",
        sequence: ["A", "B", "C", "D", "?"],
        options: ["E", "F", "A", "D"],
        answer: "E",
        explanation: "The sequence follows alphabetical order: A, B, C, D, E"
      },
      {
        id: 2,
        type: "sequence",
        question: "What comes next in the sequence?",
        sequence: ["1", "2", "3", "4", "?"],
        options: ["6", "5", "0", "4"],
        answer: "5",
        explanation: "The sequence follows numerical order: 1, 2, 3, 4, 5"
      },
      {
        id: 3,
        type: "visual",
        question: "Which shape completes the pattern?",
        pattern: "circle, square, triangle, circle, square, ?",
        options: ["circle", "square", "triangle", "star"],
        answer: "triangle",
        explanation: "The pattern repeats: circle, square, triangle, circle, square, triangle"
      },
      {
        id: 4,
        type: "word",
        question: "Which word completes the pattern?",
        pattern: "cat, dog, fish, ?",
        options: ["bird", "car", "house", "tree"],
        answer: "bird",
        explanation: "The pattern is animals: cat, dog, fish, bird"
      },
      {
        id: 5,
        type: "sequence",
        question: "What comes next in the sequence?",
        sequence: ["2", "4", "6", "8", "?"],
        options: ["9", "10", "12", "14"],
        answer: "10",
        explanation: "The sequence follows even numbers: 2, 4, 6, 8, 10"
      }
    ]
  },
  {
    level: 2,
    difficulty: "medium",
    patterns: [
      {
        id: 6,
        type: "sequence",
        question: "What comes next in the sequence?",
        sequence: ["1", "3", "5", "7", "?"],
        options: ["8", "9", "10", "11"],
        answer: "9",
        explanation: "The sequence follows odd numbers: 1, 3, 5, 7, 9"
      },
      {
        id: 7,
        type: "sequence",
        question: "What comes next in the sequence?",
        sequence: ["2", "4", "8", "16", "?"],
        options: ["18", "24", "32", "64"],
        answer: "32",
        explanation: "Each number is doubled: 2, 4, 8, 16, 32"
      },
      {
        id: 8,
        type: "visual",
        question: "Which shape completes the pattern?",
        pattern: "red circle, blue square, green triangle, red circle, blue square, ?",
        options: ["red triangle", "green triangle", "blue circle", "yellow star"],
        answer: "green triangle",
        explanation: "The pattern repeats colors and shapes: red circle, blue square, green triangle"
      },
      {
        id: 9,
        type: "word",
        question: "Which word completes the pattern?",
        pattern: "sun, moon, stars, ?",
        options: ["planet", "ocean", "mountain", "cloud"],
        answer: "planet",
        explanation: "The pattern is celestial objects: sun, moon, stars, planet"
      },
      {
        id: 10,
        type: "sequence",
        question: "What comes next in the sequence?",
        sequence: ["A", "C", "E", "G", "?"],
        options: ["H", "I", "J", "K"],
        answer: "I",
        explanation: "The sequence follows every other letter: A, C, E, G, I"
      }
    ]
  },
  {
    level: 3,
    difficulty: "hard",
    patterns: [
      {
        id: 11,
        type: "sequence",
        question: "What comes next in the sequence?",
        sequence: ["1", "4", "9", "16", "?"],
        options: ["20", "25", "36", "49"],
        answer: "25",
        explanation: "The sequence is square numbers: 1², 2², 3², 4², 5²"
      },
      {
        id: 12,
        type: "sequence",
        question: "What comes next in the sequence?",
        sequence: ["1", "1", "2", "3", "5", "?"],
        options: ["6", "7", "8", "9"],
        answer: "8",
        explanation: "The sequence is Fibonacci: each number is the sum of the two before it"
      },
      {
        id: 13,
        type: "visual",
        question: "Which shape completes the pattern?",
        pattern: "1 circle, 2 squares, 3 triangles, 4 circles, ?",
        options: ["5 circles", "5 squares", "5 triangles", "4 triangles"],
        answer: "5 squares",
        explanation: "The pattern alternates shape and increases count: 1 circle, 2 squares, 3 triangles, 4 circles, 5 squares"
      },
      {
        id: 14,
        type: "word",
        question: "Which word completes the pattern?",
        pattern: "apple, banana, cherry, date, ?",
        options: ["elderberry", "fig", "grape", "honeydew"],
        answer: "elderberry",
        explanation: "The pattern follows fruits in alphabetical order: A, B, C, D, E"
      },
      {
        id: 15,
        type: "sequence",
        question: "What comes next in the sequence?",
        sequence: ["Z", "Y", "X", "W", "?"],
        options: ["T", "U", "V", "S"],
        answer: "V",
        explanation: "The sequence follows reverse alphabetical order: Z, Y, X, W, V"
      }
    ]
  }
];