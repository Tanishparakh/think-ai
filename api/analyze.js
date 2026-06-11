import { GoogleGenAI } from "@google/genai";

function buildLogicPrompt(argumentText) {
  return `
You are a logic and critical thinking expert.

Your task is to analyze the user's argument for a student learning Thinking Skills, Critical Thinking, and Verbal Reasoning.

Definitions:
- Premise: A statement used as evidence or support for another statement.
- Hidden assumption: An unstated idea that must be true for the argument to work.
- Conclusion: The final claim that the argument is trying to prove.
- Fallacy: A mistake in reasoning that makes an argument weak, invalid, or misleading.

Analyze the argument carefully.

Important rules:
- Return only raw valid JSON.
- Do not include markdown.
- Do not include backticks.
- Do not include headings.
- Do not include explanation outside the JSON.
- Use the exact schema given below.
- Do not omit any fields.
- If information is missing, use empty arrays or suitable default values.
- Make all IDs consistent.
- Every graph edge source and target must match an existing graph node ID.
- Keep explanations simple for students.
- Do not over-detect fallacies.
- If the reasoning is mostly acceptable, say no fallacy is detected.
- Give a fair validity score from 0 to 100.
- 0 means completely invalid.
- 100 means logically strong or valid.
- Suggest corrected reasoning only if needed. If no correction is needed, write a short sentence saying the reasoning is already acceptable.

Detect at least these fallacies when relevant:
1. Affirming the consequent
2. Denying the antecedent
3. Circular reasoning
4. Ad hominem
5. Strawman
6. False cause
7. Hasty generalization
8. False dilemma
9. Slippery slope
10. Appeal to authority
11. Appeal to emotion
12. Weak analogy
13. Begging the question
14. Non sequitur
15. Red herring

Return JSON in this exact structure:

{
  "premises": [
    {
      "id": "p1",
      "text": "Premise text here"
    }
  ],
  "assumptions": [
    {
      "id": "a1",
      "text": "Hidden assumption text here"
    }
  ],
  "conclusion": {
    "id": "c1",
    "text": "Conclusion text here"
  },
  "logical_relationships": [
    {
      "from": "p1",
      "to": "c1",
      "label": "supports"
    }
  ],
  "fallacy": {
    "detected": true,
    "name": "Affirming the Consequent",
    "explanation": "The argument wrongly assumes that because the result is true, the cause must also be true.",
    "affected_nodes": ["p1", "c1"]
  },
  "validity_score": 35,
  "corrected_reasoning": "Corrected version of the reasoning.",
  "graph_nodes": [
    {
      "id": "p1",
      "label": "Premise 1",
      "text": "Premise text here",
      "type": "premise"
    },
    {
      "id": "c1",
      "label": "Conclusion",
      "text": "Conclusion text here",
      "type": "conclusion"
    }
  ],
  "graph_edges": [
    {
      "id": "e1",
      "source": "p1",
      "target": "c1",
      "label": "supports"
    }
  ]
}

If no fallacy is detected:
- fallacy.detected must be false
- fallacy.name must be "None"
- fallacy.explanation must explain why the reasoning appears acceptable
- fallacy.affected_nodes must be []

User's argument:
${argumentText}
`;
}

function buildExamPrompt(questionText, studentAnswer) {
  const cleanStudentAnswer = studentAnswer ? studentAnswer.toUpperCase() : "";

  return `
You are an expert Thinking Skills tutor for Selective School, Scholarship, Opportunity Class, Cambridge Thinking Skills, and verbal/problem-solving reasoning tests.

The user will paste one exam-style multiple-choice Thinking Skills question. It may include a passage, rules, tables described in text, and options A, B, C, D.

Your job is to solve the question AND teach the student how to solve that type next time.

The app is designed for these question types:
- Identifying Strengths: choose the option that best supports the argument.
- Identifying Weaknesses: choose the option that most weakens the argument.
- Evaluating Reasoning: decide whose reasoning is correct, or what can/cannot follow.
- Identifying Mistakes / Flaws: identify the mistaken assumption or reasoning error.
- Conditional Logic / Must Be True / Not Possible: convert rules into logical chains.
- Matching Arguments: match the reasoning pattern, not the topic.
- Assumption Questions: identify what must be assumed for the argument to work.
- Argument Analysis: find the main conclusion, reasons, and hidden assumptions.
- Numerical Problem Solving: show calculation steps for prices, ratios, schedules, counts, time, scores, tables, charts, and constraints.
- Arrangement / Constraint Logic: build a small reasoning table or ordered list.
- Venn / Set Logic: reason using groups, overlaps, all/some/no statements.
- Visual or Spatial Reasoning: solve only if the text provides enough information. If an image/diagram is required but not described, say that the diagram is needed and give the best text-based guidance.

Important output rules:
- Return only raw valid JSON.
- Do not include markdown.
- Do not include backticks.
- Do not include extra explanation outside JSON.
- Do not omit fields.
- Keep language simple and student-friendly.
- Do not guess blindly. If the pasted question is incomplete, say what is missing.
- The correct_answer must be one of "A", "B", "C", "D", or "Cannot determine".
- Explain why the correct option is correct and why each wrong option is not the best.
- If the student provided an answer, give feedback on their likely mistake and how to improve.
- Generate one similar practice question of the same type after solving.
- For visual/spatial questions, do not pretend to see a missing image unless the image is described in text.

Student's selected answer:
${cleanStudentAnswer || "No answer selected"}

Return JSON in this exact structure:

{
  "mode": "exam",
  "question_type": "Identifying Strengths",
  "difficulty": "Easy",
  "skill_tested": "Finding the option that best supports the main conclusion.",
  "main_point": "The main conclusion or claim in the question.",
  "key_rule_or_condition": "The key rule, condition, formula, or relationship needed to solve the question.",
  "correct_answer": "A",
  "confidence_score": 90,
  "step_by_step_solution": [
    "Step 1: Identify what the question is asking.",
    "Step 2: Find the main point or rule.",
    "Step 3: Compare each option with the main point.",
    "Step 4: Choose the option that best satisfies the question."
  ],
  "option_analysis": [
    {
      "option": "A",
      "text": "Option A text if available.",
      "is_correct": true,
      "explanation": "Why this option is correct or not correct."
    },
    {
      "option": "B",
      "text": "Option B text if available.",
      "is_correct": false,
      "explanation": "Why this option is correct or not correct."
    },
    {
      "option": "C",
      "text": "Option C text if available.",
      "is_correct": false,
      "explanation": "Why this option is correct or not correct."
    },
    {
      "option": "D",
      "text": "Option D text if available.",
      "is_correct": false,
      "explanation": "Why this option is correct or not correct."
    }
  ],
  "student_feedback": {
    "student_answer": "${cleanStudentAnswer}",
    "is_student_correct": false,
    "message": "Feedback comparing the student's answer with the correct answer.",
    "likely_mistake": "The likely reasoning mistake the student made.",
    "improvement_tip": "A specific tip to improve next time."
  },
  "teaching_tip": "General method for solving this question type.",
  "score_improvement_tip": "One practical strategy to improve score in this question type.",
  "reasoning_map": {
    "nodes": [
      {
        "id": "n1",
        "label": "Main Point",
        "text": "Main point or rule here.",
        "type": "main"
      },
      {
        "id": "n2",
        "label": "Correct Option",
        "text": "Why the correct option works.",
        "type": "answer"
      }
    ],
    "edges": [
      {
        "from": "n1",
        "to": "n2",
        "label": "supports answer"
      }
    ]
  },
  "similar_practice_question": {
    "question": "A new short practice question of the same type.",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "correct_answer": "B",
    "explanation": "Short explanation for the generated practice question.",
    "skill_tested": "Same skill being practised."
  }
}

If no student answer was selected:
- student_feedback.student_answer must be ""
- student_feedback.is_student_correct must be false
- student_feedback.message must say "No answer was selected, so feedback is based on the correct solution only."
- student_feedback.likely_mistake can explain a common trap for this question type.

User's exam question:
${questionText}
`;
}

function cleanGeminiResponse(text) {
  let cleanedText = text.trim();

  cleanedText = cleanedText
    .replace(/```json/g, "")
    .replace(/```JSON/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleanedText.indexOf("{");
  const lastBrace = cleanedText.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanedText = cleanedText.slice(firstBrace, lastBrace + 1);
  }

  return cleanedText;
}

function validateLogicData(data) {
  if (!data || typeof data !== "object") throw new Error("Invalid analysis format");
  if (!Array.isArray(data.premises)) throw new Error("Missing premises array");
  if (!Array.isArray(data.assumptions)) throw new Error("Missing assumptions array");
  if (!data.conclusion || typeof data.conclusion !== "object") throw new Error("Missing conclusion object");
  if (!data.fallacy || typeof data.fallacy !== "object") throw new Error("Missing fallacy object");
  if (typeof data.validity_score !== "number") throw new Error("Missing validity score");
  if (!Array.isArray(data.graph_nodes)) throw new Error("Missing graph nodes array");
  if (!Array.isArray(data.graph_edges)) throw new Error("Missing graph edges array");
  return true;
}

function validateExamData(data) {
  if (!data || typeof data !== "object") throw new Error("Invalid exam solution format");
  if (!data.question_type) throw new Error("Missing question type");
  if (!data.correct_answer) throw new Error("Missing correct answer");
  if (!Array.isArray(data.step_by_step_solution)) throw new Error("Missing solution steps");
  if (!Array.isArray(data.option_analysis)) throw new Error("Missing option analysis");
  if (!data.student_feedback || typeof data.student_feedback !== "object") throw new Error("Missing student feedback");
  if (!data.similar_practice_question || typeof data.similar_practice_question !== "object") throw new Error("Missing practice question");
  return true;
}

async function callGemini(prompt, apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  const geminiResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const rawText = geminiResponse.text;

  if (!rawText) {
    throw new Error("AI returned an empty response. Please try again.");
  }

  const cleanedText = cleanGeminiResponse(rawText);

  try {
    return JSON.parse(cleanedText);
  } catch {
    throw new Error("AI returned an unreadable response. Please try again.");
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Only POST requests are allowed.",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({
      error:
        "Gemini API key is missing on the server. Please add GEMINI_API_KEY in Vercel Environment Variables.",
    });
  }

  try {
    // Backward compatible support for the old frontend payload.
    const mode = request.body?.mode || "logic";
    const inputText = request.body?.inputText || request.body?.argumentText || "";
    const studentAnswer = request.body?.studentAnswer || "";

    if (!inputText || !inputText.trim()) {
      return response.status(400).json({
        error: mode === "exam" ? "Please enter a Thinking Skills question first." : "Please enter an argument first.",
      });
    }

    const maxLength = mode === "exam" ? 6000 : 3000;

    if (inputText.length > maxLength) {
      return response.status(400).json({
        error: `This input is very long. Please keep it under ${maxLength} characters for better analysis.`,
      });
    }

    if (mode === "exam") {
      const prompt = buildExamPrompt(inputText, studentAnswer);
      const parsedData = await callGemini(prompt, apiKey);
      validateExamData(parsedData);
      return response.status(200).json(parsedData);
    }

    const prompt = buildLogicPrompt(inputText);
    const parsedData = await callGemini(prompt, apiKey);
    validateLogicData(parsedData);
    return response.status(200).json(parsedData);
  } catch (error) {
    const errorMessage = error.message || "";

    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("rate")) {
      return response.status(429).json({
        error: "Too many requests. Wait for a minute and try again.",
      });
    }

    if (
      errorMessage.includes("unreadable") ||
      errorMessage.includes("empty response") ||
      errorMessage.includes("Missing") ||
      errorMessage.includes("Invalid")
    ) {
      return response.status(502).json({
        error: errorMessage,
      });
    }

    return response.status(500).json({
      error: "Could not connect to Gemini. Please check your internet or API key.",
    });
  }
}
