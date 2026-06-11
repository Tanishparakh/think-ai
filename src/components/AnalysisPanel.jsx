function getScoreLevel(score) {
    if (score >= 75) return "strong";
    if (score >= 45) return "medium";
    return "weak";
  }
  
  function AnalysisPanel({ analysis }) {
    if (!analysis) {
      return (
        <div className="empty-state">
          <p>No analysis yet.</p>
          <span>
            After analysis, this area will show premises, hidden assumptions,
            conclusion, fallacy detection, validity score, and corrected reasoning.
          </span>
        </div>
      );
    }
  
    const hasFallacy = analysis.fallacy?.detected === true;
  
    // Keeps score safely between 0 and 100 even if AI gives unusual value.
    const safeScore = Math.max(0, Math.min(100, Number(analysis.validity_score) || 0));
    const scoreLevel = getScoreLevel(safeScore);
  
    return (
      <div className="analysis-panel">
        <div className={`score-card ${scoreLevel}`}>
          <div>
            <p className="small-label">Validity Score</p>
            <h3>{safeScore}/100</h3>
          </div>
  
          <div className={hasFallacy ? "score-status danger" : "score-status success"}>
            {hasFallacy ? "Fallacy Detected" : "No Major Fallacy"}
          </div>
        </div>
  
        <div className="score-bar">
          <div
            className={`score-fill ${scoreLevel}`}
            style={{ width: `${safeScore}%` }}
          ></div>
        </div>
  
        <div className="analysis-section">
          <h3>Premises</h3>
  
          {analysis.premises.length > 0 ? (
            <ul className="analysis-list">
              {analysis.premises.map((premise) => (
                <li key={premise.id}>
                  <strong>{premise.id}:</strong> {premise.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted-text">No clear premises found.</p>
          )}
        </div>
  
        <div className="analysis-section">
          <h3>Hidden Assumptions</h3>
  
          {analysis.assumptions.length > 0 ? (
            <ul className="analysis-list">
              {analysis.assumptions.map((assumption) => (
                <li key={assumption.id}>
                  <strong>{assumption.id}:</strong> {assumption.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted-text">No major hidden assumptions found.</p>
          )}
        </div>
  
        <div className="analysis-section">
          <h3>Conclusion</h3>
          <div className={hasFallacy ? "highlight-box conclusion-risk-box" : "highlight-box conclusion-box"}>
            {analysis.conclusion?.text || "No clear conclusion found."}
          </div>
        </div>
  
        <div className="analysis-section">
          <h3>Fallacy Analysis</h3>
  
          <div className={hasFallacy ? "highlight-box fallacy-box" : "highlight-box safe-box"}>
            <p>
              <strong>Detected:</strong> {hasFallacy ? "Yes" : "No"}
            </p>
  
            <p>
              <strong>Fallacy Name:</strong> {analysis.fallacy?.name || "None"}
            </p>
  
            <p>
              <strong>Explanation:</strong>{" "}
              {analysis.fallacy?.explanation || "No fallacy explanation provided."}
            </p>
          </div>
        </div>
  
        <div className="analysis-section">
          <h3>Corrected Reasoning</h3>
          <div className="highlight-box corrected-box">
            {analysis.corrected_reasoning || "No correction needed."}
          </div>
        </div>
      </div>
    );
  }
  
  export default AnalysisPanel;