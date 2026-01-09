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
      explanation: "❌ Partial merge warning: The AI response contains unresolved conflict markers. Please check your n8n workflow or review the result manually.",
      mergedCode: responseText,
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
  
  // Check if merged code contains conflict markers (partial merge)
  if (mergedCode && hasConflictMarkers(mergedCode)) {
    if (!finalResult.explanation || finalResult.explanation === "Merge conflict resolved") {
      finalResult.explanation = "⚠️ Partial merge warning: The AI response contains unresolved conflict markers. Please review and complete the merge manually.";
    }
    // Keep the partial code but mark as unresolved - status will be set later
  }
  
  if (!mergedCode && finalResult.incomingVersion && finalResult.headVersion) {
    finalResult.mergedCode = finalResult.incomingVersion;
    if (!finalResult.explanation || finalResult.explanation === "Merge conflict resolved") {
      finalResult.explanation = "⚠️ Fallback merge: Your n8n workflow parsed the conflict but didn't generate merged code. Using incoming version as fallback. Please review carefully.";
    }
    if (originalConfidence === null) {
      finalResult.confidence = 0.5;
    } else {
      finalResult.confidence = originalConfidence;
    }
    finalResult.status = 'fallback';
  } else if (!mergedCode && finalResult.incomingVersion) {
    finalResult.mergedCode = finalResult.incomingVersion;
    if (!finalResult.explanation || finalResult.explanation === "Merge conflict resolved") {
      finalResult.explanation = "⚠️ Fallback merge: Using incoming version. Review recommended.";
    }
    finalResult.status = 'fallback';
  } else {
    finalResult.mergedCode = mergedCode;
  }
}

// Helper function to determine status based on result
function determineStatus(result: ConflictResult): ConflictResultStatus {
  // Check if conflict is unresolved (conflict markers still present)
  if (hasConflictMarkers(result.mergedCode)) {
    return 'unresolved';
  }
  
  // Check if AI failed (no merged code and low confidence)
  if (!result.mergedCode || result.mergedCode.trim() === '') {
    return 'ai_failed';
  }
  
  // If status is already set (e.g., 'fallback'), keep it unless we have better info
  if (result.status && result.status !== 'success' && result.status !== 'low_confidence') {
    // Only override if we have high confidence, otherwise keep the existing status
    if (result.confidence >= 0.8 && hasConflictMarkers(result.mergedCode) === false) {
      return 'success';
    }
    return result.status;
  }
  
  // New confidence-based status determination:
  // 🟢 80-100% → success (auto-apply recommended)
  // 🟡 50-79% → low_confidence (review suggested)
  // 🔴 <50% → low_confidence (manual resolution warning)
  if (result.confidence < 0.8) {
    return 'low_confidence';
  }
  
  return 'success';
}

// Helper function to normalize code formatting
function normalizeCodeFormatting(code: string): string {
  return code
    .replaceAll("\r\n", "\n")
    .split("\n")
    .map((line: string) => line.trimEnd())
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

  // Normalize code formatting
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
 * Create an AbortController with timeout
 * Uses AbortSignal if available, otherwise creates a simple timeout wrapper
 */
function createTimeoutController(timeoutMs: number): { signal?: AbortSignal; timeoutId?: NodeJS.Timeout } {
  // Check if AbortController is available (Node 15+ or browser)
  if (typeof AbortController !== 'undefined') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    return { signal: controller.signal, timeoutId };
  }
  
  // Fallback: return empty object if AbortController not available
  // The fetch implementation should handle this
  return {};
}

/**
 * Main function to resolve conflict
 */
export async function resolveConflict(
  conflictText: string,
  fileName: string = "example.ts",
  webhookUrl?: string,
  apiKey?: string,
  timeoutMs: number = 30000
): Promise<ConflictResult> {
  // Use provided webhook URL or get from environment
  const finalWebhookUrl = webhookUrl || process.env.N8N_WEBHOOK_URL;
  
  if (!finalWebhookUrl) {
    throw new Error(
      "Webhook URL not configured. Please set 'mergeSenseAI.webhookUrl' in VS Code settings."
    );
  }
  
  console.log('MergeSense AI: Calling webhook:', finalWebhookUrl);
  console.log('MergeSense AI: Timeout:', timeoutMs, 'ms');
  console.log('MergeSense AI: API key provided:', !!apiKey);
  
  // Use Node.js built-in fetch (Node 18+) or require node-fetch
  let fetchFn: typeof fetch;
  
  // Try to use global fetch (Node 18+)
  if (globalThis.fetch !== undefined) {
    fetchFn = globalThis.fetch;
    console.log('MergeSense AI: Using globalThis.fetch');
  } else if (typeof fetch === 'function') {
    fetchFn = fetch;
    console.log('MergeSense AI: Using fetch');
  } else {
    // Fallback to node-fetch if available
    console.log('MergeSense AI: fetch not available, trying node-fetch');
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      fetchFn = require('node-fetch') as typeof fetch;
      console.log('MergeSense AI: Using node-fetch');
    } catch (requireError: unknown) {
      const errorMsg = requireError instanceof Error ? requireError.message : String(requireError);
      throw new Error(
        `HTTP client not available. Please install node-fetch: npm install node-fetch. Error: ${errorMsg}`
      );
    }
  }
  
  try {
    // Build headers with optional API key
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (apiKey && apiKey.trim()) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`;
    }
    
    // Create timeout controller
    const timeoutController = createTimeoutController(timeoutMs);
    
    console.log('MergeSense AI: Sending request to webhook...');
    
    // Build fetch options with optional signal
    const fetchOptions: RequestInit = {
      method: "POST",
      headers,
      body: JSON.stringify({
        fileName,
        conflictText,
      }),
    };
    
    // Add signal if AbortController is available
    if (timeoutController.signal) {
      fetchOptions.signal = timeoutController.signal;
    }
    
    // Use Promise.race for timeout if signal not available
    const fetchPromise = fetchFn(finalWebhookUrl, fetchOptions);
    const timeoutPromise = new Promise<never>((_, reject) => {
      if (timeoutController.timeoutId) {
        // Signal will handle it
        return;
      }
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeoutMs);
    });
    
    let res: Response;
    if (timeoutController.signal) {
      res = await fetchPromise;
    } else {
      res = await Promise.race([fetchPromise, timeoutPromise]);
    }

    console.log('MergeSense AI: Response status:', res.status, res.statusText);

    // Handle authentication errors
    if (res.status === 401 || res.status === 403) {
      const errorText = await res.text();
      console.error('MergeSense AI: Authentication error:', errorText);
      throw new Error(
        `Authentication failed (${res.status}). Please check your API key in VS Code settings.`
      );
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('MergeSense AI: Webhook error response:', errorText);
      
      // Provide more specific error messages
      if (res.status >= 500) {
        throw new Error(
          `Server error (${res.status}): The n8n webhook is experiencing issues. Please try again later.`
        );
      } else if (res.status === 404) {
        throw new Error(
          `Webhook not found (404): Please verify the webhook URL is correct.`
        );
      } else {
        throw new Error(`Webhook returned error: ${res.status} ${res.statusText}`);
      }
    }

    const rawData = await res.json();
    console.log('MergeSense AI: Received response:', JSON.stringify(rawData).substring(0, 200));
  
    // Parse the API response
    const parsedResult = parseApiResponse(rawData);
    
    // Normalize and apply fallback logic
    return normalizeResult(parsedResult);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('MergeSense AI: Fetch error:', errorMessage);
    
    // Handle timeout errors
    if (errorMessage.includes('abort') || errorMessage.includes('timeout') || errorMessage === 'Request timeout') {
      throw new Error(
        `⏱️ Request timed out after ${timeoutMs / 1000} seconds. The n8n workflow may be taking too long or experiencing issues. Please try again or check your workflow configuration.`
      );
    }
    
    // Handle network errors
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      throw new Error(
        `🌐 Network error: Could not connect to webhook at ${finalWebhookUrl}. Please ensure:\n` +
        `  • n8n is running\n` +
        `  • The webhook URL is correct\n` +
        `  • There are no firewall/network restrictions`
      );
    }
    
    // Handle partial merge warnings - check if we have a result but with unresolved conflicts
    if (errorMessage.includes('unresolved') || errorMessage.includes('conflict markers')) {
      throw new Error(
        `⚠️ Partial merge detected: The AI response contains unresolved conflict markers. Please review the result manually or try again.`
      );
    }
    
    throw new Error(`❌ Failed to call webhook: ${errorMessage}`);
  }
}

