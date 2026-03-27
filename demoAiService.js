function normalizeTopic(topic) {
  return (topic || "this topic").trim();
}

function titleCase(value) {
  return normalizeTopic(value)
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTopicCategory(topic) {
  const value = normalizeTopic(topic).toLowerCase();

  if (/(python|java|javascript|code|programming|algorithm|data structure|react|html|css|sql)/.test(value)) {
    return "technical";
  }

  if (/(war|history|revolution|empire|president|civilization|ancient|world war)/.test(value)) {
    return "history";
  }

  if (/(biology|cell|photosynthesis|chemistry|physics|atom|force|ecosystem|genetics)/.test(value)) {
    return "science";
  }

  if (/(economics|market|demand|supply|finance|inflation|gdp|business)/.test(value)) {
    return "economics";
  }

  return "general";
}

function getExplanationTemplates(topic) {
  const safeTopic = normalizeTopic(topic);
  const prettyTopic = titleCase(topic);
  const category = getTopicCategory(topic);

  const common = {
    simple: `${prettyTopic} is best understood by starting with the basic idea, then looking at a few examples, and finally seeing why it matters. When you study ${safeTopic}, ask: what is it, what are its main parts, and where is it used?`,
    medium: `${prettyTopic} can be studied by breaking it into definition, structure, process, and application. A strong medium-level answer should explain the core concept, identify important terms, and connect the topic to examples or real situations so the learner understands both meaning and use.`,
    advanced: `${prettyTopic} should be approached through formal definition, conceptual boundaries, internal components, and practical implications. A detailed explanation should describe how the topic works, what assumptions it depends on, how it compares with related ideas, and what kinds of problems it helps solve.`
  };

  const categoryMap = {
    technical: {
      simple: `${prettyTopic} is a technical topic that usually involves rules, logic, and step-by-step behavior. To understand ${safeTopic}, first learn the purpose of it, then see a small example, and then notice how input becomes output.`,
      medium: `${prettyTopic} can be explained through its purpose, syntax or structure, common workflow, and practical usage. A medium-level understanding should include the main concepts, what developers or students use it for, and how to recognize correct vs incorrect usage in examples.`,
      advanced: `${prettyTopic} should be studied in terms of architecture, abstractions, implementation patterns, constraints, and tradeoffs. A detailed technical explanation should include the formal role of the concept, how it interacts with related systems, typical edge cases, and why certain design choices or best practices matter.`
    },
    history: {
      simple: `${prettyTopic} is a history topic, so the easiest way to understand it is to ask what happened, who was involved, why it happened, and what changed afterward. Put the events in order and connect them like a story.`,
      medium: `${prettyTopic} should be explained through historical context, major actors, causes, events, and consequences. A medium-level explanation should identify the timeline, the motives of the groups involved, and the short-term and long-term effects on society or politics.`,
      advanced: `${prettyTopic} should be analyzed through chronology, political and social context, competing interpretations, and historical impact. A detailed explanation should not only describe the event but also examine causation, structural factors, perspective, and how historians interpret its significance.`
    },
    science: {
      simple: `${prettyTopic} is a science topic, so start by learning what it is, what parts are involved, and what happens during the process. Think of it as understanding the pieces and how they interact.`,
      medium: `${prettyTopic} can be explained by covering the definition, the important components, the underlying process or mechanism, and any real-world examples. A medium-level answer should connect the scientific idea to observable outcomes and key vocabulary.`,
      advanced: `${prettyTopic} should be described in terms of scientific mechanism, relevant variables, formal terminology, and broader implications. A detailed explanation should show how the process works step by step, what factors influence it, and how it connects to larger systems, experiments, or applications.`
    },
    economics: {
      simple: `${prettyTopic} is easier to understand when you focus on who is making choices, what resources are limited, and how those choices affect outcomes. Start with the basic idea and then connect it to everyday examples like prices, jobs, or markets.`,
      medium: `${prettyTopic} can be studied by looking at the core definition, the main economic forces involved, and the effects on people, firms, or markets. A medium-level explanation should include the relationships between causes and outcomes and use realistic examples.`,
      advanced: `${prettyTopic} should be analyzed through formal concepts, incentives, constraints, systemic interactions, and policy or market implications. A detailed explanation should identify the mechanisms at work, the assumptions behind common models, and the wider consequences of changes in behavior or conditions.`
    }
  };

  return categoryMap[category] || common;
}

export function getDemoTopicExplanation(topic) {
  const safeTopic = normalizeTopic(topic);
  const prettyTopic = titleCase(topic);
  const templates = getExplanationTemplates(topic);

  return {
    topic: safeTopic,
    explanations: {
      simple: `${templates.simple}\n\nQuick study note: define ${safeTopic} in one sentence, list 3 important points, and explain one easy example in your own words.`,
      medium: `${templates.medium}\n\nStudy framework:\n1. Write a clear definition of ${safeTopic}.\n2. Identify the main subtopics or building blocks.\n3. Explain how those parts connect.\n4. Add one example, one application, and one common mistake students make.`,
      advanced: `${templates.advanced}\n\nDetailed notes structure for ${prettyTopic}:\n- Definition and scope: What exactly the topic includes and excludes.\n- Core components: The major parts, stages, or concepts.\n- Internal logic: How the topic behaves or develops step by step.\n- Comparisons: How it differs from related concepts.\n- Applications or significance: Why it matters in practice, academics, or problem-solving.\n- Common confusion points: Areas where students often mix up terms or oversimplify the idea.\n\nIf you revise it this way, your answer will sound more complete and exam-ready instead of just memorized.`
    }
  };
}

export function getDemoQuiz(topic, questionCount = 10) {
  const safeTopic = normalizeTopic(topic);
  const prettyTopic = titleCase(topic);

  const baseQuestions = [
    {
      prompt: `Which is the best first step in understanding ${safeTopic}?`,
      options: [
        `Learn the basic definition and core idea`,
        `Memorize advanced details first`,
        `Avoid examples`,
        `Ignore related concepts`
      ],
      correctAnswer: `Learn the basic definition and core idea`,
      explanation: `A strong foundation starts with the basic definition and the central purpose of the topic.`,
      concept: `${prettyTopic} basics`
    },
    {
      prompt: `What improves mastery of ${safeTopic} the most?`,
      options: [
        `Combining explanation, examples, and practice`,
        `Reading once without revision`,
        `Skipping difficult parts entirely`,
        `Memorizing without understanding`
      ],
      correctAnswer: `Combining explanation, examples, and practice`,
      explanation: `Students learn more effectively when they combine understanding with active practice.`,
      concept: `${prettyTopic} learning strategy`
    },
    {
      prompt: `A complete answer about ${safeTopic} should include:`,
      options: [
        `Definition, key points, and application`,
        `Only a keyword list`,
        `Only one short sentence`,
        `Unrelated facts`
      ],
      correctAnswer: `Definition, key points, and application`,
      explanation: `A full answer needs meaning, structure, and relevance.`,
      concept: `${prettyTopic} explanation quality`
    },
    {
      prompt: `Why are examples useful when studying ${safeTopic}?`,
      options: [
        `They make abstract ideas easier to understand`,
        `They replace all theory`,
        `They remove the need to revise`,
        `They make definitions unnecessary`
      ],
      correctAnswer: `They make abstract ideas easier to understand`,
      explanation: `Examples translate abstract content into something students can understand and remember.`,
      concept: `${prettyTopic} examples`
    },
    {
      prompt: `What is a common mistake when learning ${safeTopic}?`,
      options: [
        `Memorizing without understanding the underlying idea`,
        `Using active recall`,
        `Reviewing weak areas`,
        `Comparing related concepts`
      ],
      correctAnswer: `Memorizing without understanding the underlying idea`,
      explanation: `Without understanding, students struggle to explain or apply the topic later.`,
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

  return {
    topic: safeTopic,
    flashcards: [
      {
        front: `Define ${safeTopic}`,
        back: `${prettyTopic} should be explained using a clear definition, its key parts, and why it matters.`
      },
      {
        front: `What are the key parts of ${safeTopic}?`,
        back: `Break the topic into smaller subtopics, processes, or components before trying to memorize details.`
      },
      {
        front: `Why is ${safeTopic} important?`,
        back: `Understanding its importance helps connect the topic to applications, exam answers, and real examples.`
      },
      {
        front: `What is a common student mistake in ${safeTopic}?`,
        back: `Students often memorize isolated facts instead of understanding the full concept and how its parts connect.`
      },
      {
        front: `How should you revise ${safeTopic}?`,
        back: `Use explanation, examples, flashcards, active recall, and short quizzes to test understanding.`
      },
      {
        front: `How do you write a strong answer on ${safeTopic}?`,
        back: `Start with definition, explain the main points clearly, include an example or application, and finish with significance.`
      }
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
