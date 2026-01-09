import * as vscode from 'vscode';
import { ConflictResolverPanel } from './panels/ConflictResolverPanel';
import { ConflictDetector } from './utils/ConflictDetector';
import { StatusBarManager } from './utils/StatusBarManager';

// Global status bar manager instance
let statusBarManager: StatusBarManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('MergeSense AI extension is now active!');

  // Initialize status bar manager
  statusBarManager = new StatusBarManager();
  context.subscriptions.push(statusBarManager);

  // Register command to resolve conflict (improved title)
  const resolveConflictCommand = vscode.commands.registerCommand(
    'mergeSenseAI.resolveConflict',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        statusBarManager.showError('No active editor');
        return;
      }

      const document = editor.document;
      const fileContent = document.getText();
      const fileName = document.fileName.split(/[/\\]/).pop() || 'unknown';

      // Detect conflicts in the file
      const conflictDetector = new ConflictDetector();
      const hasConflict = conflictDetector.hasConflictMarkers(fileContent);

      if (!hasConflict) {
        vscode.window.showInformationMessage(
          'No conflict markers found in the current file'
        );
        statusBarManager.hide();
        return;
      }

      // Extract conflict sections
      const conflicts = conflictDetector.extractConflicts(fileContent);
      if (conflicts.length === 0) {
        vscode.window.showWarningMessage('Could not parse conflict markers');
        statusBarManager.showError('Could not parse conflicts');
        return;
      }

      // Show status bar loading
      statusBarManager.showLoading();

      // Open the conflict resolver panel
      ConflictResolverPanel.createOrShow(
        context.extensionUri,
        fileName,
        fileContent,
        conflicts[0], // For now, handle first conflict
        document.uri, // Pass document URI so we can apply changes later
        statusBarManager // Pass status bar manager for updates
      );
    }
  );

  // Register command to open panel manually (demo mode)
  const openPanelCommand = vscode.commands.registerCommand(
    'mergeSenseAI.openPanel',
    () => {
      ConflictResolverPanel.createOrShow(
        context.extensionUri,
        'demo.ts',
        '',
        null,
        undefined,
        statusBarManager
      );
    }
  );

  // Auto-detect conflicts on file open/change
  const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (!editor) {
        statusBarManager.hide();
        return;
      }

      const document = editor.document;
      const fileContent = document.getText();
      const conflictDetector = new ConflictDetector();

      if (conflictDetector.hasConflictMarkers(fileContent)) {
        const conflicts = conflictDetector.extractConflicts(fileContent);
        const conflictCount = conflicts.length;
        
        // Show status bar with conflict count
        statusBarManager.showConflictDetected(conflictCount);

        // Show notification with better UX
        const action = await vscode.window.showInformationMessage(
          `Git conflict${conflictCount > 1 ? 's' : ''} detected! Would you like to resolve ${conflictCount > 1 ? 'them' : 'it'} with AI?`,
          { modal: false },
          'Resolve with AI',
          'Show Preview',
          'Dismiss'
        );

        if (action === 'Resolve with AI') {
          vscode.commands.executeCommand('mergeSenseAI.resolveConflict');
        } else if (action === 'Show Preview') {
          // Show inline diff preview (peek view)
          await showInlineDiffPreview(editor, conflicts[0]);
        }
      } else {
        statusBarManager.hide();
      }
    }
  );

  // Also check conflicts when document changes
  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document === event.document) {
        const conflictDetector = new ConflictDetector();
        if (conflictDetector.hasConflictMarkers(event.document.getText())) {
          const conflicts = conflictDetector.extractConflicts(event.document.getText());
          statusBarManager.showConflictDetected(conflicts.length);
        } else {
          statusBarManager.hide();
        }
      }
    }
  );

  context.subscriptions.push(
    resolveConflictCommand,
    openPanelCommand,
    onDidChangeActiveEditor,
    onDidChangeTextDocument
  );
}

/**
 * Show inline diff preview using VS Code peek view
 */
async function showInlineDiffPreview(
  editor: vscode.TextEditor,
  conflict: { startLine: number; endLine: number; headContent: string; incomingContent: string }
): Promise<void> {
  // Show a peek view with the conflict
  const range = new vscode.Range(
    conflict.startLine,
    0,
    conflict.endLine,
    0
  );

  // Reveal the range to show the conflict
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

  // Note: VS Code doesn't have a direct API for showing peek views programmatically
  // We reveal the conflict range and show a notification
  await vscode.window.showInformationMessage(
    'Conflict preview shown in editor. Use "MergeSense: Resolve Current Conflict" to resolve.',
    { modal: false },
    'Resolve Now'
  ).then(action => {
    if (action === 'Resolve Now') {
      vscode.commands.executeCommand('mergeSenseAI.resolveConflict');
    }
  });
}

export function deactivate() {
  if (statusBarManager) {
    statusBarManager.dispose();
  }
}

