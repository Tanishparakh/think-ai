function OptionAnalysisCard({ option }) {
  return (
    <div className={option.is_correct ? "option-card correct" : "option-card"}>
      <div className="option-card-header">
        <strong>Option {option.option}</strong>
        <span>{option.is_correct ? "Correct" : "Not best"}</span>
      </div>
      {option.text && <p className="option-text">{option.text}</p>}
      <p>{option.explanation}</p>
    </div>
  );
}

function ReasoningMap({ reasoningMap }) {
  if (!reasoningMap?.nodes?.length) return null;

  return (
    <div className="exam-section">
      <h3>Reasoning Map</h3>
      <div className="reasoning-map-box">
        {reasoningMap.nodes.map((node) => (
          <div key={node.id} className={`reasoning-map-node ${node.type || "general"}`}>
            <strong>{node.label}</strong>
            <span>{node.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticeQuestion({ practice }) {
  if (!practice?.question) return null;

  return (
    <div className="exam-section">
      <h3>Similar Practice Question</h3>
      <div className="practice-card">
        <p className="practice-skill">
          <strong>Skill:</strong> {practice.skill_tested || "Same skill as this question"}
        </p>
        <p>{practice.question}</p>

        {practice.options && (
          <div className="practice-options">
            {Object.entries(practice.options).map(([key, value]) => (
              <div key={key}>
                <strong>{key}.</strong> {value}
              </div>
            ))}
          </div>
        )}

        <div className="practice-answer">
          <strong>Answer:</strong> {practice.correct_answer || "Not provided"}
        </div>
        <p>{practice.explanation}</p>
      </div>
    </div>
  );
}

function ExamSolverPanel({ result }) {
  if (!result) {
    return (
      <div className="empty-state">
        <p>No exam solution yet.</p>
        <span>
          Paste a full Thinking Skills multiple-choice question with options A-D.
          The app will identify the question type, solve it, teach the method,
          explain all options, and generate a similar practice question.
        </span>
      </div>
    );
  }

  const feedback = result.student_feedback || {};
  const hasStudentAnswer = Boolean(feedback.student_answer);
  const confidence = Math.max(0, Math.min(100, Number(result.confidence_score) || 0));

  return (
    <div className="exam-panel">
      <div className="exam-answer-card">
        <div>
          <p className="small-label">Correct Answer</p>
          <h3>{result.correct_answer || "Not clear"}</h3>
        </div>
        <div className="exam-meta-stack">
          <span>{result.question_type || "Question type not detected"}</span>
          <span>{confidence}% confidence</span>
        </div>
      </div>

      {hasStudentAnswer && (
        <div className={feedback.is_student_correct ? "feedback-box correct" : "feedback-box incorrect"}>
          <h3>{feedback.is_student_correct ? "Your answer is correct" : "Your answer needs review"}</h3>
          <p>{feedback.message}</p>
          {feedback.likely_mistake && (
            <p>
              <strong>Likely mistake:</strong> {feedback.likely_mistake}
            </p>
          )}
          {feedback.improvement_tip && (
            <p>
              <strong>How to improve:</strong> {feedback.improvement_tip}
            </p>
          )}
        </div>
      )}

      <div className="exam-section-grid">
        <div className="exam-mini-card">
          <h3>Skill Tested</h3>
          <p>{result.skill_tested || "Not specified"}</p>
        </div>
        <div className="exam-mini-card">
          <h3>Main Point / Rule</h3>
          <p>{result.main_point || result.key_rule_or_condition || "Not specified"}</p>
        </div>
      </div>

      {result.key_rule_or_condition && result.key_rule_or_condition !== result.main_point && (
        <div className="exam-section">
          <h3>Key Rule or Condition</h3>
          <div className="highlight-box corrected-box">{result.key_rule_or_condition}</div>
        </div>
      )}

      <div className="exam-section">
        <h3>Step-by-Step Solution</h3>
        {result.step_by_step_solution?.length ? (
          <ol className="step-list">
            {result.step_by_step_solution.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        ) : (
          <p className="muted-text">No step-by-step solution was provided.</p>
        )}
      </div>

      <div className="exam-section">
        <h3>Option Analysis</h3>
        <div className="option-grid">
          {(result.option_analysis || []).map((option) => (
            <OptionAnalysisCard key={option.option} option={option} />
          ))}
        </div>
      </div>

      <ReasoningMap reasoningMap={result.reasoning_map} />

      <div className="exam-section-grid">
        <div className="exam-mini-card teaching">
          <h3>Teaching Tip</h3>
          <p>{result.teaching_tip || "Identify the question type first, then solve using the matching strategy."}</p>
        </div>
        <div className="exam-mini-card improvement">
          <h3>Score Improvement Tip</h3>
          <p>{result.score_improvement_tip || "Before checking options, write the main conclusion or rule in your own words."}</p>
        </div>
      </div>

      <PracticeQuestion practice={result.similar_practice_question} />
    </div>
  );
}

export default ExamSolverPanel;
