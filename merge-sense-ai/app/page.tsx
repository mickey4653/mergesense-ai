"use client"
import {useState, useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Editor, { DiffEditor } from "@monaco-editor/react"
import { motion } from "framer-motion";
import {Badge} from "@/components/ui/badge"
import { resolveConflict, type ConflictResult } from "@/lib/conflict-resolver"
import { AlertCircle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { normalizeCode } from "@/lib/utils"
import { getConfidenceColor, getConfidenceLabel } from "@/lib/confidence-utils"
import { DEFAULT_CONFLICT } from "@/lib/constants"

export default function Home() {
  const [conflict, setConflict] = useState("");
  const [result, setResult] = useState<ConflictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  // Load demo on mount
  useEffect(() => {
    setConflict(DEFAULT_CONFLICT);
    setIsDemo(true);
  }, []);

  // Helper function to get status UI
  function getStatusUI(status: ConflictResult['status'], confidence: number) {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle2,
          message: "Merge completed successfully",
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200",
          badgeVariant: "default" as const,
        };
      case 'low_confidence':
        return {
          icon: AlertTriangle,
          message: `Low confidence merge (${Math.round(confidence * 100)}%) — please review carefully`,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
          badgeVariant: "outline" as const,
        };
      case 'ai_failed':
        return {
          icon: XCircle,
          message: "AI failed to process the conflict. Please try again or check your n8n workflow.",
          color: "text-red-600",
          bgColor: "bg-red-50 border-red-200",
          badgeVariant: "destructive" as const,
        };
      case 'unresolved':
        return {
          icon: AlertCircle,
          message: "Conflict not fully resolved — conflict markers still present",
          color: "text-orange-600",
          bgColor: "bg-orange-50 border-orange-200",
          badgeVariant: "outline" as const,
        };
      case 'fallback':
        return {
          icon: AlertTriangle,
          message: "Using fallback merge strategy — AI merge not available",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
          badgeVariant: "outline" as const,
        };
      default:
        return {
          icon: AlertCircle,
          message: "Unknown status",
          color: "text-gray-600",
          bgColor: "bg-gray-50 border-gray-200",
          badgeVariant: "outline" as const,
        };
    }
  }


  async function analyzeConflict() {
    if (!conflict) return;
  
    try {
      setLoading(true);
      setResult(null);
  
      const result = await resolveConflict(conflict, "example.ts");
      setResult(result);
    } catch (error) {
      console.error("Analyze error:", error);
      // Set error state
      setResult({
        explanation: "Failed to analyze conflict. Please check your n8n workflow and try again.",
        mergedCode: "",
        confidence: 0,
        status: 'ai_failed',
      });
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    if (!toast) return;
  
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);
  
  return (
    <main className="min-h-screen bg-background text-foreground p-10">
    <h1 className="text-3xl font-bold mb-2">MergeSense AI</h1>
    <p className="text-muted-foreground mb-8">
      AI-powered Git Merge Conflict resolver
    </p>

    <div className="grid grid-cols-3 gap-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Conflict Input</h2>
          <div className="flex gap-2">
            {isDemo && (
              <span className="text-xs text-muted-foreground bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                Demo Mode
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConflict("");
                setResult(null);
                setIsDemo(true);
              }}
            >
              Clear
            </Button>
            {!isDemo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConflict(DEFAULT_CONFLICT);
                  setIsDemo(true);
                  setResult(null);
                }}
              >
                Load Demo
              </Button>
            )}
          </div>
        </div>
        <Editor
  height="300px"
  defaultLanguage="typescript"
  theme="vs"
  value={conflict}
  onChange={(value = "") => {
    setConflict(value);
    
    // Detect mode based on content
    const isEmpty = !value.trim();
    const isDemoContent = value.trim() === DEFAULT_CONFLICT.trim();
    
    if (isEmpty || isDemoContent) {
      setIsDemo(true);
    } else if (isDemo && value !== DEFAULT_CONFLICT) {
      setIsDemo(false);
    }
  }}
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    wordWrap: "on",
    automaticLayout: true,
  }}
/>

      </Card>

      <div className="flex items-center justify-center flex-col gap-2">
      <Button
  onClick={analyzeConflict}
  disabled={loading || !conflict?.trim()}
>
        {loading ? "Resolving…" : "Analyze Conflict"}
</Button>
      {isDemo && (
        <p className="text-xs text-muted-foreground text-center max-w-[180px]">
          💡 Try Demo: Click above to test. Or paste your own conflict to analyze.
        </p>
      )}
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-2">AI Result</h2>

        {!result && (
          <p className="text-muted-foreground">Waiting for analysis…</p>
        )}

        {result && (
           <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3 }}
         >
            {/* Status Alert */}
            {result.status !== 'success' && (() => {
              const statusUI = getStatusUI(result.status, result.confidence);
              const Icon = statusUI.icon;
              return (
                <div className={`mb-4 p-3 rounded-lg border ${statusUI.bgColor} ${statusUI.color}`}>
                  <div className="flex items-start gap-2">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{statusUI.message}</p>
                  </div>
                </div>
              );
            })()}

            <p className="text-sm mb-4">{result.explanation}</p>

            <div className="mt-4">
  

            <div className="mt-4 h-[350px] border border-border rounded-lg overflow-hidden">
              {result.mergedCode && (
                <DiffEditor
                  key={`diff-${result.mergedCode.length}`}
                  original={conflict}
                  modified={result.mergedCode}
                  language="typescript"
                  theme="vs"
                  options={{
                    renderSideBySide: true,
                    minimap: { enabled: false },
                    readOnly: true,
                    automaticLayout: true,
                  }}
                />
              )}
            </div>

            {/* Accept Controls */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Accept Changes:</div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (result.headVersion) {
                      const normalizedCode = normalizeCode(result.headVersion);
                      setConflict(normalizedCode);
                      setToast("HEAD version applied!");
                    } else {
                      setToast("HEAD version not available");
                    }
                  }}
                  disabled={!result.headVersion}
                >
                  Accept HEAD
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (result.incomingVersion) {
                      const normalizedCode = normalizeCode(result.incomingVersion);
                      setConflict(normalizedCode);
                      setToast("Incoming version applied!");
                    } else {
                      setToast("Incoming version not available");
                    }
                  }}
                  disabled={!result.incomingVersion}
                >
                  Accept Incoming
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const codeToApply = result.mergedCode || "";
                    if (codeToApply) {
                      const normalizedCode = normalizeCode(codeToApply);
                      setConflict(normalizedCode);
                      setToast("AI merge applied!");
                    } else {
                      setToast("AI merge not available");
                    }
                  }}
                  disabled={!result.mergedCode}
                >
                  Accept AI Merge
                </Button>
              </div>
            </div>

            {/* Copy Button */}
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    const codeToCopy = result.mergedCode || "";
                    if (codeToCopy && codeToCopy.trim().length > 0) {
                      await navigator.clipboard.writeText(codeToCopy);
                      setToast("Copied!");
                    } else {
                      setToast("No code to copy");
                    }
                  } catch (error) {
                    console.error("Failed to copy:", error);
                    setToast("Failed to copy");
                  }
                }}
              >
                Copy Merged Code
              </Button>
            </div>


</div>


            <div className="flex items-center gap-2 mt-4">
              {(() => {
                const statusUI = getStatusUI(result.status, result.confidence);
                const Icon = statusUI.icon;
                const confidenceColors = getConfidenceColor(result.confidence);
                const confidenceLabel = getConfidenceLabel(result.confidence);
                return (
                  <>
                    <Badge variant={statusUI.badgeVariant} className="flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {statusUI.message.split(' — ')[0]}
                    </Badge>
                    <Badge 
                      className={`${confidenceColors.bgColor} ${confidenceColors.textColor} ${confidenceColors.borderColor} border`}
                    >
                      {confidenceLabel} Confidence: {Math.round(result.confidence * 100)}%
                    </Badge>
                  </>
                );
              })()}
            </div>
            </motion.div>
        )}
      </Card>
    </div>
    {toast && (
  <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
    {toast}
  </div>
)}


  </main>
  );
}

