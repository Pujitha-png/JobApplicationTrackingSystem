// backend/services/applicationStateService.js

// Define all stages
const stages = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected"
];

// Define allowed transitions
const allowedTransitions = {
  applied: ["screening", "rejected"],
  screening: ["interview", "rejected"],
  interview: ["offer", "rejected"],
  offer: ["hired", "rejected"],
  hired: [],
  rejected: []
};

class ApplicationStateService {
  // Check if stage exists
  static isValidStage(stage) {
    return stages.includes(stage);
  }

  // Check if transition is allowed
  static isValidTransition(currentStage, nextStage) {
    const allowed = allowedTransitions[currentStage] || [];
    return allowed.includes(nextStage);
  }

  // Add this method for controllers
  static canTransition(currentStage, nextStage) {
    return this.isValidTransition(currentStage, nextStage);
  }

  // HARD enforcement (prevents mistakes everywhere)
  static enforceTransition(currentStage, nextStage) {
    if (!this.isValidStage(currentStage) || !this.isValidStage(nextStage)) {
      throw new Error("Invalid application stage");
    }

    if (!this.isValidTransition(currentStage, nextStage)) {
      throw new Error(
        `Invalid transition from ${currentStage} to ${nextStage}`
      );
    }
  }

  // Optional helper
  static getAllowedNextStages(currentStage) {
    return allowedTransitions[currentStage] || [];
  }
}

// ESM export
export default ApplicationStateService;
