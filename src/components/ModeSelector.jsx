function ModeSelector({ activeMode, onModeChange }) {
  return (
    <div className="mode-selector" aria-label="Choose analysis mode">
      <button
        type="button"
        className={activeMode === "logic" ? "mode-button active" : "mode-button"}
        onClick={() => onModeChange("logic")}
      >
        <span>Logic Map Mode</span>
        <small>Premises, fallacies, graph</small>
      </button>

      <button
        type="button"
        className={activeMode === "exam" ? "mode-button active" : "mode-button"}
        onClick={() => onModeChange("exam")}
      >
        <span>Exam Solver Mode</span>
        <small>Answer, teaching, feedback</small>
      </button>
    </div>
  );
}

export default ModeSelector;
