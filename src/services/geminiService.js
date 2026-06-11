// File: src/services/geminiService.js

import { GoogleGenAI } from "@google/genai";

// This function creates the full prompt that we send to Gemini.
// The prompt clearly tells Gemini to return only valid JSON.
function buildGeminiPrompt(argumentText) {
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

// Gemini sometimes returns JSON inside markdown backticks.
// This function tries to clean that response.
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

// This checks only the most important fields.
// We keep it light because this is a beginner-friendly MVP.
function validateAnalysisData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid analysis format");
  }

  if (!Array.isArray(data.premises)) {
    throw new Error("Missing premises array");
  }

  if (!Array.isArray(data.assumptions)) {
    throw new Error("Missing assumptions array");
  }

  if (!data.conclusion || typeof data.conclusion !== "object") {
    throw new Error("Missing conclusion object");
  }

  if (!data.fallacy || typeof data.fallacy !== "object") {
    throw new Error("Missing fallacy object");
  }

  if (typeof data.validity_score !== "number") {
    throw new Error("Missing validity score");
  }

  if (!Array.isArray(data.graph_nodes)) {
    throw new Error("Missing graph nodes array");
  }

  if (!Array.isArray(data.graph_edges)) {
    throw new Error("Missing graph edges array");
  }

  return true;
}

export async function analyzeArgument(argumentText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Please add VITE_GEMINI_API_KEY in your .env file."
    );
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  try {
    const prompt = buildGeminiPrompt(argumentText);

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });

    const rawText = response.text;

    if (!rawText) {
      throw new Error("AI returned an empty response. Please try again.");
    }

    const cleanedText = cleanGeminiResponse(rawText);

    let parsedData;

    try {
      parsedData = JSON.parse(cleanedText);
    } catch {
      throw new Error("AI returned an unreadable response. Please try again.");
    }

    validateAnalysisData(parsedData);

    return parsedData;
  } catch (error) {
    const errorMessage = error.message || "";

    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("rate")) {
      throw new Error("Too many requests. Wait for a minute and try again.");
    }

    if (
      errorMessage.includes("API key") ||
      errorMessage.includes("VITE_GEMINI_API_KEY") ||
      errorMessage.includes("unreadable") ||
      errorMessage.includes("empty response")
    ) {
      throw error;
    }

    throw new Error(
      "Could not connect to Gemini. Please check your internet or API key."
    );
  }
}