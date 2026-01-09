import * as vscode from 'vscode';

/**
 * Manages the status bar item for MergeSense AI
 */
export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private loadingTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Create status bar item (priority 100, left side)
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'mergeSenseAI.resolveConflict';
    this.statusBarItem.tooltip = 'MergeSense AI: Click to resolve conflicts';
    this.hide();
  }

  /**
   * Show status bar item with default state
   */
  show(): void {
    this.statusBarItem.text = '$(git-merge) MergeSense AI';
    this.statusBarItem.tooltip = 'MergeSense AI: Click to resolve current conflict';
    this.statusBarItem.show();
  }

  /**
   * Show loading state with spinner
   */
  showLoading(): void {
    this.statusBarItem.text = '$(loading~spin) Resolving conflict...';
    this.statusBarItem.tooltip = 'MergeSense AI: Resolving conflict with AI...';
    this.statusBarItem.show();
  }

  /**
   * Show success state with confidence
   */
  showSuccess(confidence: number, message?: string): void {
    const confidencePercent = Math.round(confidence * 100);
    let icon = '$(check)';
    let color = '#22c55e'; // Green
    
    if (confidence >= 0.8) {
      icon = '$(check)';
      color = '#22c55e';
    } else if (confidence >= 0.5) {
      icon = '$(warning)';
      color = '#eab308';
    } else {
      icon = '$(alert)';
      color = '#ef4444';
    }

    this.statusBarItem.text = `${icon} Resolved (${confidencePercent}%)`;
    this.statusBarItem.color = color;
    
    const confidenceLabel = this.getConfidenceLabel(confidence);
    this.statusBarItem.tooltip = `MergeSense AI: Conflict resolved\n` +
      `Confidence: ${confidencePercent}% (${confidenceLabel})\n` +
      (message || 'Click to resolve another conflict');
    this.statusBarItem.show();

    // Auto-hide after 5 seconds
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    this.loadingTimer = setTimeout(() => {
      this.hide();
    }, 5000);
  }

  /**
   * Show error state
   */
  showError(error: string): void {
    this.statusBarItem.text = '$(error) Resolution failed';
    this.statusBarItem.color = '#ef4444';
    this.statusBarItem.tooltip = `MergeSense AI: ${error}\nClick to try again`;
    this.statusBarItem.show();

    // Auto-hide after 5 seconds
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    this.loadingTimer = setTimeout(() => {
      this.hide();
    }, 5000);
  }

  /**
   * Show conflict detected state
   */
  showConflictDetected(count: number = 1): void {
    const plural = count > 1 ? 's' : '';
    this.statusBarItem.text = `$(git-merge) ${count} conflict${plural} detected`;
    this.statusBarItem.color = '#eab308';
    this.statusBarItem.tooltip = `MergeSense AI: ${count} conflict${plural} detected in current file\nClick to resolve with AI`;
    this.statusBarItem.command = 'mergeSenseAI.resolveConflict';
    this.statusBarItem.show();
  }

  /**
   * Hide status bar item
   */
  hide(): void {
    this.statusBarItem.hide();
  }

  /**
   * Get confidence label
   */
  private getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) {
      return 'High';
    } else if (confidence >= 0.5) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  /**
   * Dispose status bar item
   */
  dispose(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    this.statusBarItem.dispose();
  }
}

