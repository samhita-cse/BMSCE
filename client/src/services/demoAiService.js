function normalizeTopic(topic) {
  return (topic || "this topic").trim();
}

function titleCase(value) {
  return normalizeTopic(value)
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function detectTopicProfile(topic) {
  const value = normalizeTopic(topic).toLowerCase();

  if (value.includes("world war 1") || value.includes("world war i")) {
    return {
      kind: "history",
      key: "world-war-1",
      pretty: "World War I"
    };
  }

  if (value.includes("world war 2") || value.includes("world war ii")) {
    return {
      kind: "history",
      key: "world-war-2",
      pretty: "World War II"
    };
  }

  if (value.includes("python")) {
    return {
      kind: "technical",
      key: "python",
      pretty: "Python"
    };
  }

  if (/(javascript|react|html|css|sql|algorithm|data structure|programming|coding|java)/.test(value)) {
    return {
      kind: "technical",
      key: "technical-generic",
      pretty: titleCase(topic)
    };
  }

  if (/(history|revolution|empire|civil war|president|ancient|medieval)/.test(value)) {
    return {
      kind: "history",
      key: "history-generic",
      pretty: titleCase(topic)
    };
  }

  if (/(biology|chemistry|physics|atom|cell|photosynthesis|ecosystem|genetics|force|energy)/.test(value)) {
    return {
      kind: "science",
      key: "science-generic",
      pretty: titleCase(topic)
    };
  }

  return {
    kind: "general",
    key: "general",
    pretty: titleCase(topic)
  };
}

function buildExplanationFromProfile(topic) {
  const safeTopic = normalizeTopic(topic);
  const profile = detectTopicProfile(topic);
  const pretty = profile.pretty;

  const specific = {
    "world-war-1": {
      simple: `World War I was a major global war fought mainly between 1914 and 1918. It began after the assassination of Archduke Franz Ferdinand of Austria-Hungary, but the deeper causes included militarism, alliances, imperial rivalry, and nationalism. At a simple level, you can think of it as a conflict where tension between European powers had been building for years, and one event triggered a huge chain reaction.`,
      medium: `World War I was a large international conflict centered in Europe from 1914 to 1918. The two main sides were the Allied Powers, including Britain, France, and Russia, and the Central Powers, including Germany, Austria-Hungary, and the Ottoman Empire. The assassination of Archduke Franz Ferdinand triggered the war, but historians emphasize long-term causes such as alliance systems, arms buildups, colonial competition, and nationalist tensions. Trench warfare became one of the defining features of the conflict, especially on the Western Front, leading to massive casualties and little territorial movement.`,
      advanced: `World War I should be understood as both an immediate diplomatic crisis and the culmination of structural tensions within early twentieth-century Europe. The July Crisis of 1914 escalated because the alliance system converted a regional conflict into a continental and then global war. Militarism encouraged states to rely on mobilization timetables, while imperial competition and nationalism intensified interstate mistrust. Strategically, the war is associated with industrialized mass warfare, attrition, trench systems, artillery dominance, and large-scale mobilization of economies and civilians. Politically, the conflict contributed to the collapse of empires such as Austria-Hungary, Russia, Germany, and the Ottoman Empire, while the Treaty of Versailles helped shape the unstable interwar order.`
    },
    "world-war-2": {
      simple: `World War II was a global war fought from 1939 to 1945. It began when Germany invaded Poland, and it grew into a conflict involving many countries across Europe, Asia, and beyond. A simple way to understand it is that aggressive expansion by Nazi Germany, Fascist Italy, and Imperial Japan led to a worldwide war.`,
      medium: `World War II began in 1939 and involved the Allied Powers, such as Britain, the Soviet Union, the United States, and others, against the Axis Powers, including Germany, Italy, and Japan. The war followed unresolved tensions from World War I, the rise of fascist regimes, economic instability, and expansionist foreign policies. Major events included the invasion of Poland, the Battle of Britain, Operation Barbarossa, the Holocaust, the attack on Pearl Harbor, and the use of atomic bombs on Hiroshima and Nagasaki.`,
      advanced: `World War II should be analyzed through the interaction of ideology, revisionist geopolitics, economic instability, militarization, and the breakdown of collective security. Nazi expansionism, Japanese imperialism, and fascist authoritarianism drove the conflict, while appeasement and weak international enforcement mechanisms failed to contain aggression. The war transformed military strategy through mechanized warfare, air power, amphibious campaigns, and strategic bombing. It also reshaped the international order by accelerating decolonization, establishing the United Nations, revealing the catastrophic consequences of genocide, and producing a bipolar world dominated by the United States and the Soviet Union.`
    },
    python: {
      simple: `Python is a high-level programming language that is designed to be readable and easy to learn. People use it to write scripts, build websites, analyze data, automate tasks, and work with artificial intelligence. The main reason beginners like Python is that its syntax is clean and closer to plain English than many other programming languages.`,
      medium: `Python is an interpreted, high-level, general-purpose programming language known for readable syntax and a large standard library. It supports multiple programming paradigms, including procedural, object-oriented, and functional programming. Python is widely used in web development, scripting, data science, machine learning, automation, and backend services. Important ideas when studying Python include variables, control flow, functions, lists, dictionaries, classes, modules, and exception handling.`,
      advanced: `Python is a dynamically typed, interpreted language whose design emphasizes readability, developer productivity, and expressive syntax. From a technical perspective, Python uses indentation to define block structure, manages memory automatically, and supports first-class functions, generators, decorators, context managers, and object-oriented abstractions. A deeper understanding of Python should include concepts such as mutability vs immutability, scope resolution, iterators and iterables, exception propagation, package/module organization, and the runtime implications of dynamic typing. In practical software engineering, Python is valued for rapid development, ecosystem maturity, and interoperability with scientific, web, and automation frameworks.`
    },
    "technical-generic": {
      simple: `${pretty} is a technical topic, so the easiest way to study it is to understand what problem it solves, what its basic parts are, and how it behaves in a small example.`,
      medium: `${pretty} should be explained using technical vocabulary, but still in a structured way. Start with the core definition, then describe the important components, common workflow, and typical use cases. A medium-level answer should also mention how it differs from related concepts and where students often make mistakes.`,
      advanced: `${pretty} should be analyzed through formal definitions, system behavior, architecture or syntax, edge cases, and tradeoffs. A detailed explanation should explain internal logic, interactions with related concepts, performance or design implications where relevant, and the terminology a technical interviewer or exam evaluator would expect.`
    },
    "history-generic": {
      simple: `${pretty} is a history topic, so begin with what happened, who was involved, when it happened, and why it mattered.`,
      medium: `${pretty} should be explained through context, causes, key events, major figures, and consequences. A good historical explanation connects chronology with motive and impact.`,
      advanced: `${pretty} should be treated as a historical process rather than just a list of facts. A detailed answer should discuss causation, context, competing interpretations, and long-term significance, while remaining historically grounded and accurate.`
    },
    "science-generic": {
      simple: `${pretty} is a science topic, so the best way to understand it is to learn what it is, what parts are involved, and what process is happening.`,
      medium: `${pretty} should be explained through definition, mechanism, components, and real examples. A medium-level answer should show how the system works and why it produces the observed result.`,
      advanced: `${pretty} should be explained using scientific terminology, mechanism, variables, and broader implications. A detailed answer should describe process flow, dependencies, and how the topic fits into a wider scientific framework.`
    },
    general: {
      simple: `${pretty} is best understood by starting with a simple definition, then identifying the main points, and finally connecting it to an easy example or real-world use.`,
      medium: `${pretty} can be explained by breaking it into core ideas, important terms, and practical meaning. A medium-level answer should move from basic definition to organized explanation.`,
      advanced: `${pretty} should be explained in a structured, fact-based way that covers definition, internal logic, important distinctions, and significance. A strong advanced answer should sound precise, topic-aware, and conceptually complete rather than generic.`
    }
  };

  return specific[profile.key] || specific.general;
}

export function getDemoTopicExplanation(topic) {
  const safeTopic = normalizeTopic(topic);
  const prettyTopic = titleCase(topic);
  const explanation = buildExplanationFromProfile(topic);

  return {
    topic: safeTopic,
    explanations: {
      simple: `${explanation.simple}\n\nQuick note: if you are revising ${safeTopic}, start with a one-line definition and one clear example.`,
      medium: `${explanation.medium}\n\nStudy structure:\n1. Define ${safeTopic} clearly.\n2. Identify its major components or causes.\n3. Explain how those parts connect.\n4. Add one example and one common misunderstanding.`,
      advanced: `${explanation.advanced}\n\nDetailed revision guide for ${prettyTopic}:\n- Formal definition or scope\n- Core components, causes, or mechanisms\n- Internal logic or chronological/process flow\n- Important terminology\n- Comparison with related concepts\n- Practical significance, consequences, or applications\n- Common confusion points students should avoid`
    }
  };
}

export function getDemoQuiz(topic, questionCount = 10) {
  const safeTopic = normalizeTopic(topic);
  const prettyTopic = titleCase(topic);
  const profile = detectTopicProfile(topic);

  const questionSets = {
    python: [
      {
        prompt: "What best describes Python?",
        options: [
          "A high-level interpreted programming language",
          "A hardware architecture",
          "A relational database",
          "A browser rendering engine"
        ],
        correctAnswer: "A high-level interpreted programming language",
        explanation: "Python is generally classified as a high-level interpreted programming language with readable syntax.",
        concept: "Python basics"
      },
      {
        prompt: "Which Python data type stores key-value pairs?",
        options: ["Dictionary", "Tuple", "Set", "String"],
        correctAnswer: "Dictionary",
        explanation: "A dictionary maps keys to values and is one of Python's core built-in data structures.",
        concept: "Python data structures"
      },
      {
        prompt: "Why is indentation important in Python?",
        options: [
          "It defines code blocks",
          "It speeds up execution automatically",
          "It replaces variables",
          "It compiles code to machine language"
        ],
        correctAnswer: "It defines code blocks",
        explanation: "Python uses indentation to indicate block structure instead of braces.",
        concept: "Python syntax"
      },
      {
        prompt: "Which concept lets Python handle errors gracefully?",
        options: ["Exception handling", "CSS styling", "SQL indexing", "Type casting only"],
        correctAnswer: "Exception handling",
        explanation: "Python uses try/except and related constructs for exception handling.",
        concept: "Python exceptions"
      },
      {
        prompt: "What is a function in Python?",
        options: [
          "A reusable block of code",
          "A graphics driver",
          "A database table",
          "A command-line flag"
        ],
        correctAnswer: "A reusable block of code",
        explanation: "Functions let you group reusable logic under a defined name.",
        concept: "Python functions"
      }
    ],
    "world-war-1": [
      {
        prompt: "What event is commonly seen as the immediate trigger of World War I?",
        options: [
          "The assassination of Archduke Franz Ferdinand",
          "The bombing of Pearl Harbor",
          "The Russian Revolution",
          "The fall of the Berlin Wall"
        ],
        correctAnswer: "The assassination of Archduke Franz Ferdinand",
        explanation: "The assassination in Sarajevo triggered the July Crisis, which escalated into war.",
        concept: "World War I causes"
      },
      {
        prompt: "Which style of fighting became strongly associated with World War I?",
        options: [
          "Trench warfare",
          "Cyber warfare",
          "Nuclear deterrence",
          "Space warfare"
        ],
        correctAnswer: "Trench warfare",
        explanation: "On the Western Front, trench warfare became a defining feature of the conflict.",
        concept: "World War I warfare"
      },
      {
        prompt: "Which of the following was a long-term cause of World War I?",
        options: [
          "Alliance systems and militarism",
          "The Cold War",
          "The internet",
          "Decolonization after 1945"
        ],
        correctAnswer: "Alliance systems and militarism",
        explanation: "Alliance commitments and arms buildups helped turn a crisis into a large war.",
        concept: "World War I causes"
      },
      {
        prompt: "Which empire collapsed as a result of World War I?",
        options: [
          "Austria-Hungary",
          "The British Empire immediately",
          "The Roman Empire",
          "The Mongol Empire"
        ],
        correctAnswer: "Austria-Hungary",
        explanation: "Austria-Hungary was one of several empires that collapsed by the end of the war.",
        concept: "World War I consequences"
      },
      {
        prompt: "Why is the Treaty of Versailles historically important?",
        options: [
          "It shaped the unstable postwar order",
          "It ended the Cold War",
          "It created the internet",
          "It started the Industrial Revolution"
        ],
        correctAnswer: "It shaped the unstable postwar order",
        explanation: "The treaty imposed terms that influenced European politics and later instability.",
        concept: "World War I aftermath"
      }
    ]
  };

  const baseQuestions =
    questionSets[profile.key] ||
    [
      {
        prompt: `What is the best first step in understanding ${safeTopic}?`,
        options: [
          "Learn the basic definition and core idea",
          "Memorize advanced details first",
          "Avoid examples",
          "Ignore related concepts"
        ],
        correctAnswer: "Learn the basic definition and core idea",
        explanation: "A strong foundation starts with the basic definition and central concept.",
        concept: `${prettyTopic} basics`
      },
      {
        prompt: `What improves mastery of ${safeTopic} the most?`,
        options: [
          "Combining explanation, examples, and practice",
          "Reading once without revision",
          "Skipping difficult parts entirely",
          "Memorizing without understanding"
        ],
        correctAnswer: "Combining explanation, examples, and practice",
        explanation: "Students usually learn best by combining understanding with practice.",
        concept: `${prettyTopic} learning strategy`
      },
      {
        prompt: `A complete answer about ${safeTopic} should include:`,
        options: [
          "Definition, key points, and application",
          "Only a keyword list",
          "Only one short sentence",
          "Unrelated facts"
        ],
        correctAnswer: "Definition, key points, and application",
        explanation: "A strong answer needs meaning, structure, and relevance.",
        concept: `${prettyTopic} explanation quality`
      },
      {
        prompt: `Why are examples useful when studying ${safeTopic}?`,
        options: [
          "They make abstract ideas easier to understand",
          "They replace all theory",
          "They remove the need to revise",
          "They make definitions unnecessary"
        ],
        correctAnswer: "They make abstract ideas easier to understand",
        explanation: "Examples help learners connect abstract ideas to understandable situations.",
        concept: `${prettyTopic} examples`
      },
      {
        prompt: `What is a common mistake when learning ${safeTopic}?`,
        options: [
          "Memorizing without understanding the idea",
          "Using active recall",
          "Reviewing weak areas",
          "Comparing related concepts"
        ],
        correctAnswer: "Memorizing without understanding the idea",
        explanation: "Understanding is necessary if the student wants to explain or apply the topic later.",
        concept: `${prettyTopic} common mistakes`
      }
    ];

  const questions = Array.from({ length: questionCount }, (_, index) => {
    const base = baseQuestions[index % baseQuestions.length];
    return {
      ...base,
      prompt: questionCount > baseQuestions.length ? `${base.prompt} (${index + 1})` : base.prompt
    };
  });

  return {
    topic: safeTopic,
    questions
  };
}

export function getDemoFlashcards(topic) {
  const safeTopic = normalizeTopic(topic);
  const prettyTopic = titleCase(topic);
  const profile = detectTopicProfile(topic);

  if (profile.key === "python") {
    return {
      topic: safeTopic,
      flashcards: [
        { front: "What is Python?", back: "Python is a high-level interpreted programming language known for readability and versatility." },
        { front: "What does indentation do in Python?", back: "Indentation defines code blocks such as function bodies, loops, and conditionals." },
        { front: "What is a dictionary in Python?", back: "A dictionary is a built-in mapping type that stores key-value pairs." },
        { front: "What is exception handling?", back: "It is the mechanism for responding to runtime errors using try, except, finally, and related constructs." },
        { front: "What is a function?", back: "A function is a reusable block of code defined with def that can accept arguments and return values." },
        { front: "Why is Python popular?", back: "It is widely used in web development, automation, data science, AI, and scripting because of readability and ecosystem support." }
      ]
    };
  }

  if (profile.key === "world-war-1") {
    return {
      topic: safeTopic,
      flashcards: [
        { front: "When was World War I fought?", back: "World War I was fought mainly from 1914 to 1918." },
        { front: "What triggered World War I?", back: "The assassination of Archduke Franz Ferdinand triggered the July Crisis that escalated into war." },
        { front: "Name one long-term cause of World War I.", back: "Alliance systems, militarism, imperial rivalry, and nationalism were all major long-term causes." },
        { front: "What type of warfare is associated with World War I?", back: "Trench warfare is one of the most recognized features of the conflict, especially on the Western Front." },
        { front: "What happened to major empires after World War I?", back: "Empires such as Austria-Hungary, Germany, Russia, and the Ottoman Empire were transformed or collapsed." },
        { front: "Why is the Treaty of Versailles important?", back: "It helped shape the postwar order and contributed to later instability in Europe." }
      ]
    };
  }

  return {
    topic: safeTopic,
    flashcards: [
      { front: `Define ${safeTopic}`, back: `${prettyTopic} should be explained using a clear definition, its key parts, and why it matters.` },
      { front: `What are the key parts of ${safeTopic}?`, back: `Break the topic into smaller subtopics, processes, or components before memorizing details.` },
      { front: `Why is ${safeTopic} important?`, back: `Understanding importance helps connect the topic to applications, exam answers, and real examples.` },
      { front: `What is a common student mistake in ${safeTopic}?`, back: `Students often memorize isolated facts instead of understanding the full concept and how its parts connect.` },
      { front: `How should you revise ${safeTopic}?`, back: `Use explanation, examples, flashcards, active recall, and short quizzes to test understanding.` },
      { front: `How do you write a strong answer on ${safeTopic}?`, back: `Start with definition, explain the main points clearly, include an example or application, and finish with significance.` }
    ]
  };
}

export function getDemoWeakAreaAnalysis(topic, attempts) {
  const safeTopic = normalizeTopic(topic);
  const latest = (Array.isArray(attempts) ? attempts : []).at(-1);
  const wrongAnswers = latest?.results?.filter((item) => !item.correct) || [];

  if (!wrongAnswers.length) {
    return {
      weakAreas: [
        {
          topic: safeTopic,
          reason: "No major weak areas were detected in the latest attempt.",
          suggestion: "Keep practicing mixed questions and review your summary notes regularly."
        }
      ]
    };
  }

  const uniqueConcepts = [...new Set(wrongAnswers.map((item) => item.concept).filter(Boolean))];

  return {
    weakAreas: uniqueConcepts.map((concept) => ({
      topic: concept,
      reason: `You missed one or more questions connected to ${concept}.`,
      suggestion: `Review ${concept}, rewrite it in your own words, and answer 3 more practice questions on ${safeTopic}.`
    }))
  };
}

function splitIntoBullets(text) {
  return normalizeTopic(text)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 8);
}

function buildNoteSummary(text) {
  const bullets = splitIntoBullets(text);
  return bullets.length
    ? bullets.map((sentence) => `- ${sentence}`).join("\n")
    : "- The uploaded notes did not contain enough readable text.";
}

export function getDemoNoteExplanation({ noteTitle, noteText }) {
  const title = normalizeTopic(noteTitle || "Your notes");
  const bullets = splitIntoBullets(noteText);
  const joined = bullets.join(" ");

  return {
    topic: title,
    explanations: {
      simple: bullets.length
        ? `These notes are mainly about ${title}. In simple terms, the main ideas are:\n${buildNoteSummary(noteText)}`
        : "I could not find enough readable content in the uploaded notes.",
      medium: bullets.length
        ? `Based on the uploaded notes, ${title} can be explained through these main points:\n${buildNoteSummary(noteText)}\n\nUse these notes to identify the definition, important subtopics, and examples.`
        : "There was not enough note content to build a medium explanation.",
      advanced: bullets.length
        ? `Detailed explanation from the uploaded notes for ${title}:\n${buildNoteSummary(noteText)}\n\nAdvanced study focus:\n- Define the scope of the topic\n- Identify major concepts in the notes\n- Explain how the concepts connect\n- Look for examples, mechanisms, or cause-effect links\n\nReconstructed note context: ${joined}`
        : "There was not enough note content to build an advanced explanation."
    }
  };
}

export function getDemoNoteQuiz({ noteTitle, noteText, questionCount = 10 }) {
  const title = normalizeTopic(noteTitle || "Your notes");
  const bullets = splitIntoBullets(noteText);
  const source = bullets.length ? bullets : [`The notes discuss ${title}.`];

  return {
    topic: title,
    questions: Array.from({ length: questionCount }, (_, index) => {
      const sentence = source[index % source.length];
      return {
        prompt: `Which statement best matches the notes about ${title}? (${index + 1})`,
        options: [
          sentence,
          `The notes say ${title} is unrelated to the topic being studied.`,
          `The notes provide no useful information about ${title}.`,
          `The notes say ${title} should never be revised through examples.`
        ],
        correctAnswer: sentence,
        explanation: "The correct choice is the one directly grounded in the uploaded note text.",
        concept: `${title} notes`
      };
    })
  };
}

export function getDemoNoteFlashcards({ noteTitle, noteText, cardCount = 8 }) {
  const title = normalizeTopic(noteTitle || "Your notes");
  const bullets = splitIntoBullets(noteText);
  const source = bullets.length ? bullets : [`The notes discuss ${title}.`];

  return {
    topic: title,
    flashcards: Array.from({ length: cardCount }, (_, index) => ({
      front: `Key point ${index + 1} from ${title}`,
      back: source[index % source.length]
    }))
  };
}

export function getDemoAnswerFromNotes({ noteTitle, noteText, question }) {
  const title = normalizeTopic(noteTitle || "your notes");
  const bullets = splitIntoBullets(noteText);

  return {
    answer: bullets.length
      ? `Based on ${title}, the best answer to "${question}" is: ${bullets.slice(0, 3).join(" ")}`
      : `I could not find enough readable content in ${title} to answer that confidently.`,
    confidence: bullets.length ? "medium" : "low",
    supportingPoints: bullets.slice(0, 3),
    unknowns: bullets.length ? [] : ["The uploaded notes may be empty, unclear, or unsupported by the free parser."]
  };
}
