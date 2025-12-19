// backend/utils/stageRules.js

const allowedTransitions = {
  Applied: ["Screening", "Rejected"],
  Screening: ["Interview", "Rejected"],
  Interview: ["Offer", "Rejected"],
  Offer: ["Hired", "Rejected"],
  Hired: [],
  Rejected: []
};

export function isValidTransition(fromStage, toStage) {
  // Normalize stages: first letter uppercase, rest lowercase
  const normalizedFrom = fromStage.charAt(0).toUpperCase() + fromStage.slice(1).toLowerCase();
  const normalizedTo = toStage.charAt(0).toUpperCase() + toStage.slice(1).toLowerCase();

  return allowedTransitions[normalizedFrom]?.includes(normalizedTo);
}
