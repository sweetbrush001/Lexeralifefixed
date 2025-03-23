// Replace this with your actual Hugging Face API token
const blabla = "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";

const generateId = () => {
  return "id-" + Math.random().toString(36).substr(2, 9);
};

// Define categories and their question templates
const categoryQuestions = {
  technology: [
    "What is {subtopic}?",
    "What are the main features of {subtopic}?",
    "How is {subtopic} used in modern applications?",
    "What are the key benefits of {subtopic}?",
    "What are the limitations of {subtopic}?",
    "Give an example of {subtopic} in real-world use.",
    "How does {subtopic} compare to similar technologies?",
    "What's the future outlook for {subtopic}?"
  ],
  geography: [
    "Where is {subtopic} located?",
    "What's the climate like in {subtopic}?",
    "What are the main geographical features of {subtopic}?",
    "What makes {subtopic} significant?",
    "What natural resources are found in {subtopic}?",
    "What's the population and demographics of {subtopic}?",
    "What environmental challenges does {subtopic} face?",
    "What's unique about {subtopic}'s culture and history?"
  ],
  history: [
    "What is {subtopic}?",
    "When and where did {subtopic} occur?",
    "Who were the key figures in {subtopic}?",
    "Why is {subtopic} historically significant?",
    "What were the main causes of {subtopic}?",
    "What were the immediate effects of {subtopic}?",
    "How did {subtopic} change society?",
    "What's the lasting impact of {subtopic}?"
  ],
  default: [
    "What is {subtopic}?",
    "Why is {subtopic} important?",
    "How is {subtopic} applied in practice?",
    "What are the fundamental concepts of {subtopic}?",
    "What are real-world examples of {subtopic}?",
    "What are the advantages of {subtopic}?",
    "How has {subtopic} developed over time?",
    "What future developments are expected in {subtopic}?"
  ]
};

// Curated flashcards for common topics
const topicFlashcards = {
  javascript: [
    {
      question: "What is JavaScript?",
      answer: "A high-level programming language that makes web pages interactive. It runs in browsers and supports object-oriented programming."
    },
    {
      question: "What are JavaScript variables?",
      answer: "Containers for storing data values. They can hold numbers, strings, objects, and other data types."
    },
    {
      question: "What are JavaScript functions?",
      answer: "Reusable blocks of code that perform specific tasks. They can take parameters and return values."
    }
  ],
  "mount everest": [
    {
      question: "Where is Mount Everest?",
      answer: "Located on the border between Nepal and Tibet (China) in the Himalayas."
    },
    {
      question: "How tall is Mount Everest?",
      answer: "Reaches 8,848 meters (29,029 feet) above sea level, making it Earth's highest peak."
    },
    {
      question: "What challenges face Mount Everest climbers?",
      answer: "Extreme cold, high altitude, thin air, avalanches, and severe weather conditions."
    }
  ],
  networking: [
    {
      question: "What is a computer network?",
      answer: "A system of interconnected devices that communicate and share resources, such as data and hardware."
    },
    {
      question: "What is an IP address?",
      answer: "A unique identifier assigned to each device on a network, used for communication and data transfer."
    },
    {
      question: "What is a router?",
      answer: "A device that forwards data packets between computer networks, enabling communication between devices."
    }
  ],
  cybersecurity: [
    {
      question: "What is cybersecurity?",
      answer: "The practice of protecting systems, networks, and data from digital attacks and unauthorized access."
    },
    {
      question: "What is a firewall?",
      answer: "A security system that monitors and controls incoming and outgoing network traffic based on predefined rules."
    },
    {
      question: "What is phishing?",
      answer: "A cyber attack where attackers trick individuals into revealing sensitive information by pretending to be trustworthy."
    }
  ],
  "cloud computing": [
    {
      question: "What is cloud computing?",
      answer: "The delivery of computing services like storage, servers, and software over the internet."
    },
    {
      question: "What are the benefits of cloud computing?",
      answer: "Scalability, cost-efficiency, flexibility, and access to resources from anywhere with an internet connection."
    },
    {
      question: "What is AWS?",
      answer: "Amazon Web Services, a leading cloud computing platform offering services like storage, computing, and databases."
    }
  ]
};

function getCuratedFlashcards(subtopic) {
  if (!subtopic) return [];
  
  const lowerTopic = subtopic.toLowerCase();
  const flashcards = topicFlashcards[lowerTopic] || [];
  
  return flashcards.map((card) => ({
    ...card,
    id: generateId(),
    subtopic: subtopic,
    category: lowerTopic
  }));
}

function getQuestionsForCategory(category, subtopic) {
  const templates = categoryQuestions[category.toLowerCase()] || categoryQuestions.default;
  return templates.map(template => template.replace('{subtopic}', subtopic));
}

const generateAnswer = async (prompt, index) => {
  try {
    const blibli = "https://api-inference.huggingface.co/models/google/flan-t5-large";
    
    const response = await fetch(blibli, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${blabla}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 100,
          min_length: 20,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    let answer = data[0]?.generated_text || "";
    
    return answer.trim()
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,!?])/g, '$1');
  } catch (error) {
    console.error(`Error generating answer ${index}:`, error);
    return "";
  }
};

async function getHighQualityGenericFlashcards(category, subtopic, count) {
  if (!category || !subtopic || count <= 0) return [];

  const questions = getQuestionsForCategory(category, subtopic);
  const flashcards = [];

  for (let i = 0; i < count && i < questions.length; i++) {
    try {
      const prompt = `${questions[i]} Give a brief, informative answer about ${subtopic}.`;
      const answer = await generateAnswer(prompt, i);

      if (isValidAnswer(answer, subtopic)) {
        flashcards.push({
          question: questions[i],
          answer: answer,
          id: generateId(),
          subtopic: subtopic,
          category: category
        });
      }

      // Add delay between API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error generating generic flashcard ${i}:`, error);
    }
  }

  return flashcards;
}

const attemptApiGeneration = async (category, subtopic, userQuestions = []) => {
  if (!category || !subtopic) return [];

  const flashcardPool = [];
  const questions = userQuestions.length > 0 ? userQuestions : getQuestionsForCategory(category, subtopic);

  for (let i = 0; i < questions.length && flashcardPool.length < 8; i++) {
    try {
      const prompt = `Give a clear, concise answer (max 50 words) to: ${questions[i]} Focus on ${subtopic}.`;
      const answer = await generateAnswer(prompt, i);

      if (isValidAnswer(answer, subtopic)) {
        flashcardPool.push({
          question: questions[i],
          answer: answer,
          id: generateId(),
          subtopic: subtopic,
          category: category
        });
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error generating flashcard ${i}:`, error);
    }
  }

  return flashcardPool;
};

function isValidAnswer(answer, subtopic) {
  if (!answer || answer.length < 10) return false;

  const lowercaseAnswer = answer.toLowerCase();
  const lowercaseTopic = subtopic.toLowerCase();

  const invalidPatterns = [
    "i don't know",
    "as an ai",
    "i'm not sure",
    "i cannot",
    "i can't",
    lowercaseTopic,
    "is a",
    "refers to",
  ];

  return !invalidPatterns.some(pattern => lowercaseAnswer.includes(pattern)) &&
         answer.split(" ").length >= 5 &&
         new Set(answer.split(" ")).size / answer.split(" ").length >= 0.5;
}

export const generateFlashcards = async (category, subtopic, userQuestions = []) => {
  try {
    if (!category || !subtopic) {
      throw new Error("Category and subtopic are required");
    }

    console.log(`Generating flashcards for category: ${category}, subtopic: ${subtopic}`);
    
    const curatedCards = getCuratedFlashcards(subtopic);
    if (curatedCards.length > 0) {
      console.log(`Using ${curatedCards.length} curated flashcards for ${subtopic}`);
      return curatedCards;
    }

    console.log("No curated flashcards found, attempting API generation");
    const apiCards = await attemptApiGeneration(category, subtopic, userQuestions);
    if (apiCards.length >= 3) {
      console.log(`Using ${apiCards.length} API-generated flashcards`);
      return apiCards;
    }

    console.log("Using high-quality generic flashcards as fallback");
    return await getHighQualityGenericFlashcards(category, subtopic, 8);
  } catch (error) {
    console.error("Error in generateFlashcards:", error);
    return [];
  }
};