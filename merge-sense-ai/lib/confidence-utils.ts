/**
 * Get confidence color based on confidence level
 * Green ≥ 80%, Yellow 60-79%, Red < 60%
 */
export function getConfidenceColor(confidence: number): {
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  if (confidence >= 0.8) {
    return {
      bgColor: "bg-green-500",
      textColor: "text-white",
      borderColor: "border-green-600",
    };
  } else if (confidence >= 0.6) {
    return {
      bgColor: "bg-yellow-500",
      textColor: "text-white",
      borderColor: "border-yellow-600",
    };
  } else {
    return {
      bgColor: "bg-red-500",
      textColor: "text-white",
      borderColor: "border-red-600",
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

