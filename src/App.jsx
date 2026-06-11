import { useState } from "react";
import "./App.css";
import { analyzeArgument } from "./services/geminiService";
import AnalysisPanel from "./components/AnalysisPanel";
import LogicGraph from "./components/LogicGraph";

function App() {
  const [argumentText, setArgumentText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sampleArgument =
    "If a person is a doctor, then they studied medicine. Priya studied medicine. Therefore, Priya is a doctor.";

  const characterCount = argumentText.length;

  function handleSampleClick() {
    setArgumentText(sampleArgument);
    setErrorMessage("");
    setAnalysisResult(null);
  }

  async function handleAnalyzeClick() {
    setErrorMessage("");
    setAnalysisResult(null);

    if (!argumentText.trim()) {
      setErrorMessage("Please enter an argument first.");
      return;
    }

    if (argumentText.length > 3000) {
      setErrorMessage(
        "This argument is very long. Try shortening it for better analysis."
      );
      return;
    }

    try {
      setIsLoading(true);
      const result = await analyzeArgument(argumentText);
      setAnalysisResult(result);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="badge">Thinking Skills MVP</div>
        <h1>ThinkGraph AI</h1>
        <p>Visual Logic Decomposition and Fallacy Detector</p>

        <div className="workflow-strip">
          <div>1. Paste Argument</div>
          <span>→</span>
          <div>2. Extract Logic</div>
          <span>→</span>
          <div>3. Build Graph</div>
          <span>→</span>
          <div>4. Detect Fallacy</div>
        </div>
      </header>

      <main className="main-layout">
        <section className="input-card">
          <div className="card-header">
            <div>
              <h2>Enter Logic Argument</h2>
              <p className="section-description">
                Paste a critical thinking, verbal reasoning, or logical argument below.
              </p>
            </div>
            <span className="card-tag">Input</span>
          </div>

          <textarea
            value={argumentText}
            onChange={(event) => setArgumentText(event.target.value)}
            placeholder="Example: If A is true, then B is true. B is true. Therefore, A is true."
          />

          <div className="textarea-footer">
            <span>{characterCount}/3000 characters</span>
            <span>Best results: short and clear arguments</span>
          </div>

          <div className="button-row">
            <button
              className="secondary-button"
              onClick={handleSampleClick}
              disabled={isLoading}
            >
              Try Sample Argument
            </button>

            <button
              className="primary-button"
              onClick={handleAnalyzeClick}
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze Argument"}
            </button>
          </div>

          {isLoading && (
            <div className="message-box loading-message">
              Analyzing argument...
            </div>
          )}

          {errorMessage && (
            <div className="message-box error-message">
              {errorMessage}
            </div>
          )}
        </section>

        <section className="analysis-card">
          <div className="card-header">
            <div>
              <h2>Analysis Panel</h2>
              <p className="section-description">
                Premises, assumptions, conclusion, validity score, and fallacy explanation.
              </p>
            </div>
            <span className="card-tag">Output</span>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <p>Analyzing argument...</p>
              <span>
                Gemini is extracting the logical structure and preparing the visual
                reasoning breakdown.
              </span>
            </div>
          ) : (
            <AnalysisPanel analysis={analysisResult} />
          )}
        </section>

        <section className="graph-card">
          <div className="card-header">
            <div>
              <h2>Visual Logic Graph</h2>
              <p className="section-description">
                This directed graph maps how premises and assumptions support or weaken
                the conclusion.
              </p>
            </div>
            <span className="card-tag">Graph</span>
          </div>

          <LogicGraph analysis={analysisResult} />

          <div className="legend">
            <span><b className="dot premise-dot"></b> Premise</span>
            <span><b className="dot assumption-dot"></b> Assumption</span>
            <span><b className="dot conclusion-dot"></b> Conclusion</span>
            <span><b className="dot fallacy-dot"></b> Fallacy</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;