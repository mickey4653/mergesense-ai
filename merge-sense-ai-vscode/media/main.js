(function() {
  const vscode = acquireVsCodeApi();
  console.log('MergeSense AI: Script loaded');
  
  // Get fileName from globalThis (set by inline script)
  const fileName = globalThis.fileName || 'unknown.ts';

  // DOM elements
  const conflictInput = document.getElementById('conflictInput');
  const resolveBtn = document.getElementById('resolveBtn');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const statusAlert = document.getElementById('statusAlert');
  const explanation = document.getElementById('explanation');
  const diffContent = document.getElementById('diffContent');
  const acceptHeadBtn = document.getElementById('acceptHead');
  const acceptIncomingBtn = document.getElementById('acceptIncoming');
  const acceptAIBtn = document.getElementById('acceptAI');
  const autoApplyBtn = document.getElementById('autoApply');
  const copyBtn = document.getElementById('copyBtn');
  const badges = document.getElementById('badges');
  const errorDiv = document.getElementById('error');
  const confidenceInfo = document.getElementById('confidenceInfo');

  // Check if elements exist
  if (!conflictInput || !resolveBtn) {
    console.error('MergeSense AI: Required DOM elements not found!', {
      conflictInput: !!conflictInput,
      resolveBtn: !!resolveBtn
    });
    return;
  }

  console.log('MergeSense AI: DOM elements found', {
    fileName: fileName
  });

  let currentResult = null;

  // Handle resolve button click
  resolveBtn.addEventListener('click', () => {
    console.log('MergeSense AI: Resolve button clicked');
    const conflictText = conflictInput.value.trim();
    console.log('MergeSense AI: Conflict text length:', conflictText.length);
    
    if (!conflictText) {
      console.warn('MergeSense AI: No conflict text provided');
      vscode.postMessage({
        command: 'error',
        error: 'Please enter a conflict to resolve'
      });
      return;
    }

    console.log('MergeSense AI: Sending resolveConflict message', {
      fileName: fileName,
      conflictTextLength: conflictText.length
    });

    vscode.postMessage({
      command: 'resolveConflict',
      conflictText: conflictText,
      fileName: fileName
    });
  });

  // Handle accept buttons
  acceptHeadBtn.addEventListener('click', () => {
    if (currentResult && currentResult.headVersion) {
      vscode.postMessage({
        command: 'applyMerge',
        code: currentResult.headVersion
      });
    }
  });

  acceptIncomingBtn.addEventListener('click', () => {
    if (currentResult && currentResult.incomingVersion) {
      vscode.postMessage({
        command: 'applyMerge',
        code: currentResult.incomingVersion
      });
    }
  });

  acceptAIBtn.addEventListener('click', () => {
    if (currentResult && currentResult.mergedCode) {
      vscode.postMessage({
        command: 'applyMerge',
        code: currentResult.mergedCode
      });
    }
  });

  if (autoApplyBtn) {
    autoApplyBtn.addEventListener('click', () => {
      if (currentResult && currentResult.mergedCode) {
        vscode.postMessage({
          command: 'applyMerge',
          code: currentResult.mergedCode,
          autoSave: true // Auto-save for one-click apply
        });
      }
    });
  }

  copyBtn.addEventListener('click', () => {
    if (currentResult && currentResult.mergedCode) {
      vscode.postMessage({
        command: 'copyCode',
        code: currentResult.mergedCode
      });
    }
  });

  // Handle messages from extension
  window.addEventListener('message', event => {
    const message = event.data;

    switch (message.command) {
      case 'loading':
        if (message.loading) {
          loading.classList.remove('hidden');
          result.classList.add('hidden');
          errorDiv.classList.add('hidden');
        } else {
          loading.classList.add('hidden');
        }
        break;

      case 'result':
        currentResult = message.result;
        displayResult(message.result);
        break;

      case 'error':
        showError(message.error);
        break;
    }
  });

  function displayResult(resultData) {
    currentResult = resultData;
    result.classList.remove('hidden');
    errorDiv.classList.add('hidden');

    // Display status alert
    const statusClass = getStatusClass(resultData.status);
    const statusMessage = getStatusMessage(resultData.status, resultData.confidence);
    statusAlert.className = `alert ${statusClass}`;
    statusAlert.textContent = statusMessage;

    // Display explanation
    explanation.textContent = resultData.explanation || 'No explanation provided';

    // Display diff
    if (resultData.mergedCode) {
      const originalText = conflictInput.value;
      diffContent.innerHTML = `
        <pre class="original">${escapeHtml(originalText)}</pre>
        <pre class="resolved">${escapeHtml(resultData.mergedCode)}</pre>
      `;
    }

    // Display badges and confidence info
    const confidenceClass = getConfidenceClass(resultData.confidence);
    const confidenceLabel = getConfidenceLabel(resultData.confidence);
    const confidenceTier = getConfidenceTier(resultData.confidence);
    const confidencePercent = Math.round(resultData.confidence * 100);
    const tooltipText = `Confidence: ${confidencePercent}% (${confidenceTier.tier})\n${confidenceTier.message}`;
    
    badges.innerHTML = `
      <span class="badge ${confidenceClass}" title="${tooltipText}">
        ${confidenceLabel} Confidence: ${confidencePercent}%
      </span>
    `;

    // Display confidence tier information
    if (confidenceInfo) {
      confidenceInfo.className = `confidence-info ${confidenceTier.tier}`;
      confidenceInfo.innerHTML = `
        <strong>${confidenceTier.message}</strong>
        <span>Confidence: ${Math.round(resultData.confidence * 100)}%</span>
      `;
    }

    // Enable/disable buttons based on confidence and availability
    const hasHighConfidence = resultData.confidence >= 0.8;
    const hasMergedCode = !!resultData.mergedCode;
    
    acceptHeadBtn.disabled = !resultData.headVersion;
    acceptIncomingBtn.disabled = !resultData.incomingVersion;
    acceptAIBtn.disabled = !hasMergedCode;
    copyBtn.disabled = !hasMergedCode;
    
    // Show/hide auto-apply button for high confidence merges
    if (autoApplyBtn) {
      if (hasHighConfidence && hasMergedCode && resultData.status === 'success') {
        autoApplyBtn.classList.remove('hidden');
        autoApplyBtn.disabled = false;
      } else {
        autoApplyBtn.classList.add('hidden');
        autoApplyBtn.disabled = true;
      }
    }
  }

  function showError(errorMessage) {
    errorDiv.classList.remove('hidden');
    errorDiv.textContent = errorMessage;
    result.classList.add('hidden');
    loading.classList.add('hidden');
  }

  function getStatusClass(status) {
    switch (status) {
      case 'success':
        return 'success';
      case 'low_confidence':
      case 'fallback':
        return 'warning';
      case 'ai_failed':
      case 'unresolved':
        return 'error';
      default:
        return 'warning';
    }
  }

  function getStatusMessage(status, confidence) {
    const confidencePercent = Math.round((confidence || 0) * 100);
    
    switch (status) {
      case 'success':
        if (confidence >= 0.8) {
          return `🟢 High confidence merge (${confidencePercent}%) — Auto-apply recommended`;
        } else {
          return `Merge completed successfully (${confidencePercent}%)`;
        }
      case 'low_confidence':
        if (confidence >= 0.5 && confidence < 0.8) {
          return `🟡 Medium confidence merge (${confidencePercent}%) — Review suggested before applying`;
        } else {
          return `🔴 Low confidence merge (${confidencePercent}%) — Manual resolution recommended`;
        }
      case 'ai_failed':
        return '❌ AI failed to process the conflict. Please try again or check your n8n workflow.';
      case 'unresolved':
        return '⚠️ Conflict not fully resolved — conflict markers still present in merged code. Please review manually.';
      case 'fallback':
        return '⚠️ Using fallback merge strategy — AI merge not available. Review carefully before applying.';
      default:
        return 'Unknown status';
    }
  }

  function getConfidenceClass(confidence) {
    if (confidence >= 0.8) {
      return 'high-confidence'; // 🟢 80-100%
    } else if (confidence >= 0.5) {
      return 'medium-confidence'; // 🟡 50-79%
    } else {
      return 'low-confidence'; // 🔴 <50%
    }
  }

  function getConfidenceLabel(confidence) {
    if (confidence >= 0.8) {
      return '🟢 High';
    } else if (confidence >= 0.5) {
      return '🟡 Medium';
    } else {
      return '🔴 Low';
    }
  }

  function getConfidenceTier(confidence) {
    if (confidence >= 0.8) {
      return {
        tier: 'high',
        message: 'Auto-apply recommended',
        color: '#22c55e'
      };
    } else if (confidence >= 0.5) {
      return {
        tier: 'medium',
        message: 'Review suggested',
        color: '#eab308'
      };
    } else {
      return {
        tier: 'low',
        message: 'Manual resolution warning',
        color: '#ef4444'
      };
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();

