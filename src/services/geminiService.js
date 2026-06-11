// File: src/services/geminiService.js

// This frontend service no longer talks directly to Gemini.
// It sends the argument to our Vercel serverless function at /api/analyze.
// This keeps the Gemini API key on the server side.

export async function analyzeArgument(argumentText) {
  if (!argumentText || !argumentText.trim()) {
    throw new Error("Please enter an argument first.");
  }

  if (argumentText.length > 3000) {
    throw new Error("This argument is very long. Try shortening it for better analysis.");
  }

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ argumentText }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not analyze the argument.");
    }

    return data;
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