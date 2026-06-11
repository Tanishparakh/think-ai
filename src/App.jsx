import { useState } from "react";
import "./App.css";
import { analyzeArgument, solveExamQuestion } from "./services/geminiService";
import AnalysisPanel from "./components/AnalysisPanel";
import LogicGraph from "./components/LogicGraph";
import ModeSelector from "./components/ModeSelector";
import ExamSolverPanel from "./components/ExamSolverPanel";

function App() {
  const [activeMode, setActiveMode] = useState("logic");
  const [inputText, setInputText] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [logicResult, setLogicResult] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const logicSample =
    "If a person is a doctor, then they studied medicine. Priya studied medicine. Therefore, Priya is a doctor.";

  const examSample = `When Tom told Aida that he was thinking of giving up his hobby of drawing to focus on becoming an engineer, Aida said: "You don’t need to give up a hobby like drawing just because you want to work in engineering. It’s good for you to have hobbies. They help keep you happy and relaxed so you can also study harder."

Which one of these statements, if true, most strengthens Aida’s argument?

A. Artistic or creative skills are seen as important skills for engineers to have.
B. Tom’s latest school report said that he wasn’t studying hard enough.
C. Tom’s school encourages its students to have at least one hobby.
D. Learning to draw well also often takes hard work and concentration.`;

  const maxCharacters = activeMode === "exam" ? 6000 : 3000;
  const characterCount = inputText.length;

  function handleModeChange(mode) {
    setActiveMode(mode);
    setInputText("");
    setStudentAnswer("");
    setLogicResult(null);
    setExamResult(null);
    setErrorMessage("");
  }

  function handleSampleClick() {
    setInputText(activeMode === "logic" ? logicSample : examSample);
    setStudentAnswer("");
    setErrorMessage("");
    setLogicResult(null);
    setExamResult(null);
  }

  async function handleAnalyzeClick() {
    setErrorMessage("");
    setLogicResult(null);
    setExamResult(null);

    if (!inputText.trim()) {
      setErrorMessage(
        activeMode === "logic"
          ? "Please enter an argument first."
          : "Please enter a Thinking Skills question first."
      );
      return;
    }

    if (inputText.length > maxCharacters) {
      setErrorMessage(
        `This input is very long. Please keep it under ${maxCharacters} characters for better analysis.`
      );
      return;
    }

    try {
      setIsLoading(true);

      if (activeMode === "logic") {
        const result = await analyzeArgument(inputText);
        setLogicResult(result);
      } else {
        const result = await solveExamQuestion(inputText, studentAnswer);
        setExamResult(result);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const heroSubtitle =
    activeMode === "logic"
      ? "Visual Logic Decomposition and Fallacy Detector"
      : "AI Thinking Skills Tutor for Exam-Style MCQs";

  return (
    <div className="app">
      <header className="hero">
        <div className="badge">Thinking Skills AI Tutor</div>
        <h1>ThinkGraph AI</h1>
        <p>{heroSubtitle}</p>

        <div className="workflow-strip">
          {activeMode === "logic" ? (
            <>
              <div>1. Paste Argument</div>
              <span>→</span>
              <div>2. Extract Logic</div>
              <span>→</span>
              <div>3. Build Graph</div>
              <span>→</span>
              <div>4. Detect Fallacy</div>
            </>
          ) : (
            <>
              <div>1. Paste MCQ</div>
              <span>→</span>
              <div>2. Detect Type</div>
              <span>→</span>
              <div>3. Solve + Teach</div>
              <span>→</span>
              <div>4. Generate Practice</div>
            </>
          )}
        </div>
      </header>

      <main className="main-layout">
        <section className="mode-card">
          <div className="card-header">
            <div>
              <h2>Choose Workspace</h2>
              <p className="section-description">
                Keep the original logic mapper or switch to exam-solving tutor mode.
              </p>
            </div>
            <span className="card-tag">Mode</span>
          </div>

          <ModeSelector activeMode={activeMode} onModeChange={handleModeChange} />
        </section>

        <section className="input-card">
          <div className="card-header">
            <div>
              <h2>{activeMode === "logic" ? "Enter Logic Argument" : "Enter Thinking Skills Question"}</h2>
              <p className="section-description">
                {activeMode === "logic"
                  ? "Paste a critical thinking, verbal reasoning, or logical argument below."
                  : "Paste one full MCQ question with options A, B, C, and D. You may also enter your chosen answer for feedback."}
              </p>
            </div>
            <span className="card-tag">Input</span>
          </div>

          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder={
              activeMode === "logic"
                ? "Example: If A is true, then B is true. B is true. Therefore, A is true."
                : "Paste the full question here, including options A, B, C, and D."
            }
          />

          {activeMode === "exam" && (
            <div className="student-answer-row">
              <label htmlFor="student-answer">Your answer, if already attempted</label>
              <select
                id="student-answer"
                value={studentAnswer}
                onChange={(event) => setStudentAnswer(event.target.value)}
              >
                <option value="">Not selected</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          )}

          <div className="textarea-footer">
            <span>{characterCount}/{maxCharacters} characters</span>
            <span>
              {activeMode === "logic"
                ? "Best results: short and clear arguments"
                : "Best results: include the passage, question, and all options"}
            </span>
          </div>

          <div className="button-row">
            <button
              className="secondary-button"
              onClick={handleSampleClick}
              disabled={isLoading}
            >
              {activeMode === "logic" ? "Try Sample Argument" : "Try Sample Exam Question"}
            </button>

            <button
              className="primary-button"
              onClick={handleAnalyzeClick}
              disabled={isLoading}
            >
              {isLoading
                ? activeMode === "logic"
                  ? "Analyzing..."
                  : "Solving..."
                : activeMode === "logic"
                  ? "Analyze Argument"
                  : "Solve Question"}
            </button>
          </div>

          {isLoading && (
            <div className="message-box loading-message">
              {activeMode === "logic"
                ? "Analyzing argument..."
                : "Solving the question and preparing teaching feedback..."}
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
              <h2>{activeMode === "logic" ? "Analysis Panel" : "Exam Solution Panel"}</h2>
              <p className="section-description">
                {activeMode === "logic"
                  ? "Premises, assumptions, conclusion, validity score, and fallacy explanation."
                  : "Correct answer, step-by-step explanation, option analysis, feedback, and practice."}
              </p>
            </div>
            <span className="card-tag">Output</span>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <p>{activeMode === "logic" ? "Analyzing argument..." : "Solving question..."}</p>
              <span>
                {activeMode === "logic"
                  ? "Gemini is extracting the logical structure and preparing the visual reasoning breakdown."
                  : "Gemini is identifying the question type, solving the MCQ, and preparing tutor-style feedback."}
              </span>
            </div>
          ) : activeMode === "logic" ? (
            <AnalysisPanel analysis={logicResult} />
          ) : (
            <ExamSolverPanel result={examResult} />
          )}
        </section>

        {activeMode === "logic" && (
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

            <LogicGraph analysis={logicResult} />

            <div className="legend">
              <span><b className="dot premise-dot"></b> Premise</span>
              <span><b className="dot assumption-dot"></b> Assumption</span>
              <span><b className="dot conclusion-dot"></b> Conclusion</span>
              <span><b className="dot fallacy-dot"></b> Fallacy</span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
