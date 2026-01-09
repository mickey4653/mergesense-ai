// Type definitions
export type ConflictResultStatus = 
  | 'success'           // High confidence, conflict resolved
  | 'low_confidence'     // Confidence < 0.6, needs review
  | 'ai_failed'          // AI couldn't process or returned error
  | 'unresolved'        // Conflict markers still present
  | 'fallback';         // Using fallback merge strategy

export type ConflictResult = {
  explanation: string;
  mergedCode: string;
  confidence: number;
  status: ConflictResultStatus;
  fileName?: string;
  headVersion?: string;
  incomingVersion?: string;
  merged_code?: string;
  result?: string;
  solution?: string;
  response?: {
    mergedCode?: string;
    merged_code?: string;
  };
};

// Helper function to check if text has conflict markers
function hasConflictMarkers(text: string): boolean {
  return text.includes('<<<<<<<') || 
         text.includes('=======') || 
         text.includes('>>>>>>>');
}

// Helper function to handle string response
function handleStringResponse(responseText: string): ConflictResult {
  if (hasConflictMarkers(responseText)) {
    return {
      explanation: "The response appears to be unmerged conflict text. Please check your n8n workflow.",
      mergedCode: "",
      confidence: 0,
      status: 'unresolved',
    };
  }
  return {
    explanation: "Merge conflict resolved",
    mergedCode: responseText,
    confidence: 1,
    status: 'success',
  };
}

// Helper function to extract result from array
function extractFromArray(rawData: unknown[]): ConflictResult | string | null {
  if (rawData.length === 0) return null;
  
  const firstItem = rawData[0];
  
  if (typeof firstItem === 'string') {
    return firstItem;
  }
  
  if (firstItem && typeof firstItem === 'object' && 'output' in firstItem) {
    const output = (firstItem as { output: unknown }).output;
    if (typeof output === 'string') {
      try {
        return JSON.parse(output) as ConflictResult;
      } catch {
        return output;
      }
    }
    return output as ConflictResult;
  }
  
  return firstItem as ConflictResult;
}

// Helper function to parse API response
function parseApiResponse(rawData: unknown): ConflictResult {
  let result: ConflictResult;
  
  // Handle array responses
  if (Array.isArray(rawData)) {
    const extracted = extractFromArray(rawData);
    if (typeof extracted === 'string') {
      result = handleStringResponse(extracted);
    } else if (extracted) {
      result = extracted;
    } else {
      result = {
        explanation: "No result returned",
        mergedCode: "",
        confidence: 0,
        status: 'ai_failed',
      };
    }
  } else if (typeof rawData === 'string') {
    // Handle string responses
    result = handleStringResponse(rawData);
  } else if (rawData && typeof rawData === 'object') {
    // Handle object responses - ensure status is set
    result = rawData as ConflictResult;
    if (!result.status) {
      // Status will be determined later in normalizeResult
      result.status = 'success'; // Temporary, will be recalculated
    }
  } else {
    // Default fallback
    result = {
      explanation: "No result returned",
      mergedCode: "",
      confidence: 0,
      status: 'ai_failed',
    };
  }

  return result;
}

// Helper function to extract mergedCode from various locations
function extractMergedCode(result: ConflictResult): string {
  if (result.mergedCode && typeof result.mergedCode === 'string' && result.mergedCode.trim()) {
    return result.mergedCode;
  }

  // Check alternative field names
  const alternatives = [
    result.merged_code,
    result.result,
    result.solution,
    result.response?.mergedCode,
    result.response?.merged_code,
  ];

  for (const alt of alternatives) {
    if (alt && typeof alt === 'string' && alt.trim()) {
      return alt;
    }
  }

  return "";
}

// Helper function to apply fallback logic
function applyFallbackLogic(finalResult: ConflictResult, originalConfidence: number | null): void {
  const mergedCode = extractMergedCode(finalResult);
  
  if (!mergedCode && finalResult.incomingVersion && finalResult.headVersion) {
    finalResult.mergedCode = finalResult.incomingVersion;
    if (!finalResult.explanation || finalResult.explanation === "Merge conflict resolved") {
      finalResult.explanation = "⚠️ Warning: Your n8n workflow parsed the conflict but didn't generate merged code. Using incoming version as fallback. Please update your n8n workflow to include an AI merge step that generates the 'mergedCode' field.";
    }
    if (originalConfidence === null) {
      finalResult.confidence = 0.5;
    } else {
      finalResult.confidence = originalConfidence;
    }
    finalResult.status = 'fallback';
  } else if (!mergedCode && finalResult.incomingVersion) {
    finalResult.mergedCode = finalResult.incomingVersion;
    finalResult.status = 'fallback';
  } else {
    finalResult.mergedCode = mergedCode;
  }
}

// Helper function to determine status based on result
function determineStatus(result: ConflictResult): ConflictResultStatus {
  // Check if conflict is unresolved
  if (hasConflictMarkers(result.mergedCode)) {
    return 'unresolved';
  }
  
  // Check if AI failed (no merged code and low confidence)
  if (!result.mergedCode || result.mergedCode.trim() === '') {
    return 'ai_failed';
  }
  
  // Check confidence level
  if (result.confidence < 0.6) {
    return 'low_confidence';
  }
  
  // If status is already set (e.g., 'fallback'), keep it
  if (result.status && result.status !== 'success') {
    return result.status;
  }
  
  return 'success';
}

// Helper function to normalize code formatting
function normalizeCodeFormatting(code: string): string {
  return code
    .replaceAll("\r\n", "\n")  // Normalize line endings (Windows to Unix)
    .split("\n")
    .map(line => line.trimEnd())  // Trim trailing whitespace from each line
    .join("\n");
}

// Helper function to normalize final result
function normalizeResult(parsedResult: ConflictResult): ConflictResult {
  const finalResult = parsedResult;
  const originalConfidence = typeof finalResult.confidence === 'number' ? finalResult.confidence : null;

  // Ensure mergedCode is a string
  if (typeof finalResult.mergedCode !== 'string') {
    finalResult.mergedCode = String(finalResult.mergedCode || "");
  }

  // Apply fallback logic if needed
  applyFallbackLogic(finalResult, originalConfidence);

  // Normalize code formatting (line endings and trailing whitespace)
  if (finalResult.mergedCode) {
    finalResult.mergedCode = normalizeCodeFormatting(finalResult.mergedCode);
  }

  // Ensure explanation exists
  if (!finalResult.explanation) {
    finalResult.explanation = "Merge conflict resolved";
  }

  // Ensure confidence exists
  if (typeof finalResult.confidence !== 'number') {
    finalResult.confidence = finalResult.confidence || 0;
  }

  // Determine and set status
  finalResult.status = determineStatus(finalResult);

  return finalResult;
}

/**
 * Get the webhook URL for conflict resolution
 * - In browser/Next.js: uses Next.js API route (handles CORS)
 * - In VS Code extension: uses N8N_WEBHOOK_URL directly
 */
function getWebhookUrl(): string {
  // Check if we're in a browser/Next.js environment
  if (globalThis.window !== undefined) {
    // Browser environment - use Next.js API route
    return "/api/resolve-conflict";
  }
  
  // Node.js/VS Code extension environment - use n8n webhook directly
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error(
      "N8N_WEBHOOK_URL environment variable is not set. " +
      "Please set it in your .env.local file or VS Code extension settings."
    );
  }
  return webhookUrl;
}

// Main function to resolve conflict
export async function resolveConflict(
  conflictText: string,
  fileName: string = "example.ts"
): Promise<ConflictResult> {
  const webhookUrl = getWebhookUrl();
  
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName,
      conflictText,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to analyze conflict");
  }

  const rawData = await res.json();
  
  // Parse the API response
  const parsedResult = parseApiResponse(rawData);
  
  // Normalize and apply fallback logic
  return normalizeResult(parsedResult);
}

