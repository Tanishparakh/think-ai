// File: src/services/geminiService.js

// Frontend service for both app modes.
// The Gemini API key stays server-side inside the Vercel function at /api/analyze.

async function callAnalyzeApi(payload) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not analyze the input.");
  }

  return data;
}

export async function analyzeArgument(argumentText) {
  if (!argumentText || !argumentText.trim()) {
    throw new Error("Please enter an argument first.");
  }

  if (argumentText.length > 3000) {
    throw new Error("This argument is very long. Try shortening it for better analysis.");
  }

  try {
    return await callAnalyzeApi({
      mode: "logic",
      inputText: argumentText,
    });
  } catch (error) {
    if (
      error.message.includes("Please enter") ||
      error.message.includes("very long") ||
      error.message.includes("API key") ||
      error.message.includes("unreadable") ||
      error.message.includes("Too many requests")
    ) {
      throw error;
    }

    throw new Error(
      "Could not connect to Gemini. Please check your internet or API key."
    );
  }
}

export async function solveExamQuestion(questionText, studentAnswer = "") {
  if (!questionText || !questionText.trim()) {
    throw new Error("Please enter a Thinking Skills question first.");
  }

  if (questionText.length > 6000) {
    throw new Error("This question is very long. Try shortening it for better analysis.");
  }

  try {
    return await callAnalyzeApi({
      mode: "exam",
      inputText: questionText,
      studentAnswer,
    });
  } catch (error) {
    if (
      error.message.includes("Please enter") ||
      error.message.includes("very long") ||
      error.message.includes("API key") ||
      error.message.includes("unreadable") ||
      error.message.includes("Too many requests")
    ) {
      throw error;
    }

    throw new Error(
      "Could not connect to Gemini. Please check your internet or API key."
    );
  }
}
