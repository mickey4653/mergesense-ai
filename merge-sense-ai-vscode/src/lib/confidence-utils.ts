/**
 * Get confidence color based on confidence level
 */
export function getConfidenceColor(confidence: number): {
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  if (confidence >= 0.8) {
    return {
      bgColor: "#22c55e", // green-500
      textColor: "#ffffff",
      borderColor: "#16a34a", // green-600
    };
  } else if (confidence >= 0.6) {
    return {
      bgColor: "#eab308", // yellow-500
      textColor: "#ffffff",
      borderColor: "#ca8a04", // yellow-600
    };
  } else {
    return {
      bgColor: "#ef4444", // red-500
      textColor: "#ffffff",
      borderColor: "#dc2626", // red-600
    };
  }
}

/**
 * Get confidence label based on confidence level
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) {
    return "High";
  } else if (confidence >= 0.6) {
    return "Medium";
  } else {
    return "Low";
  }
}

