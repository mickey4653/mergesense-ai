import * as vscode from 'vscode';
import { resolveConflict, ConflictResult } from '../lib/conflict-resolver';
import { FileOperations } from '../utils/FileOperations';
import { StatusBarManager } from '../utils/StatusBarManager';

export class ConflictResolverPanel {
  public static currentPanel: ConflictResolverPanel | undefined;
  public static readonly viewType = 'mergeSenseAI';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _fileName: string;
  private _conflictText: string;
  private _conflictInfo: { startLine: number; endLine: number } | null;
  private _documentUri: vscode.Uri | null;
  private _statusBarManager: StatusBarManager | null = null;
  private _lastResult: ConflictResult | null = null;

  public static createOrShow(
    extensionUri: vscode.Uri,
    fileName: string,
    conflictText: string,
    conflictInfo: { startLine: number; endLine: number } | null,
    documentUri?: vscode.Uri,
    statusBarManager?: StatusBarManager
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (ConflictResolverPanel.currentPanel) {
      ConflictResolverPanel.currentPanel._panel.reveal(column);
      ConflictResolverPanel.currentPanel.update(fileName, conflictText, conflictInfo, documentUri);
      if (statusBarManager) {
        ConflictResolverPanel.currentPanel._statusBarManager = statusBarManager;
      }
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      ConflictResolverPanel.viewType,
      'MergeSense AI - Conflict Resolver',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      }
    );

    ConflictResolverPanel.currentPanel = new ConflictResolverPanel(
      panel,
      extensionUri,
      fileName,
      conflictText,
      conflictInfo,
      documentUri || null,
      statusBarManager || null
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    fileName: string,
    conflictText: string,
    conflictInfo: { startLine: number; endLine: number } | null,
    documentUri: vscode.Uri | null,
    statusBarManager: StatusBarManager | null
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._fileName = fileName;
    this._conflictText = conflictText;
    this._conflictInfo = conflictInfo;
    this._documentUri = documentUri;
    this._statusBarManager = statusBarManager;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        console.log('MergeSense AI: Received message from webview:', message.command);
        switch (message.command) {
          case 'resolveConflict':
            console.log('MergeSense AI: Handling resolveConflict', {
              fileName: message.fileName,
              conflictTextLength: message.conflictText?.length
            });
            await this._handleResolveConflict(message.conflictText, message.fileName);
            break;
          case 'applyMerge':
            await this._handleApplyMerge(message.code, message.autoSave !== false);
            break;
          case 'copyCode':
            await this._handleCopyCode(message.code);
            break;
          case 'error':
            console.error('MergeSense AI: Error from webview:', message.error);
            vscode.window.showErrorMessage(`WebView Error: ${message.error}`);
            if (this._statusBarManager) {
              this._statusBarManager.showError(message.error);
            }
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public update(
    fileName: string,
    conflictText: string,
    conflictInfo: { startLine: number; endLine: number } | null,
    documentUri?: vscode.Uri
  ) {
    this._fileName = fileName;
    this._conflictText = conflictText;
    this._conflictInfo = conflictInfo;
    if (documentUri) {
      this._documentUri = documentUri;
    }
    this._lastResult = null; // Reset result when updating
    this._update();
  }

  private async _handleResolveConflict(conflictText: string, fileName: string) {
    try {
      // Update status bar to loading
      if (this._statusBarManager) {
        this._statusBarManager.showLoading();
      }

      this._panel.webview.postMessage({
        command: 'loading',
        loading: true,
      });

      // Get configuration from VS Code settings
      const config = vscode.workspace.getConfiguration('mergeSenseAI');
      const webhookUrl = config.get<string>('webhookUrl');
      const apiKey = config.get<string>('apiKey') || undefined;
      const timeout = config.get<number>('timeout') || 30000;
      
      console.log('MergeSense AI: Webhook URL from config:', webhookUrl);
      console.log('MergeSense AI: API key configured:', !!apiKey);
      console.log('MergeSense AI: Timeout:', timeout, 'ms');
      
      if (!webhookUrl) {
        const errorMsg = "Webhook URL not configured. Please set 'mergeSenseAI.webhookUrl' in VS Code settings.";
        console.error('MergeSense AI:', errorMsg);
        throw new Error(errorMsg);
      }

      // Pass configuration to resolveConflict
      console.log('MergeSense AI: Calling resolveConflict with:', {
        fileName,
        conflictTextLength: conflictText.length,
        webhookUrl,
        hasApiKey: !!apiKey,
        timeout
      });
      const result = await resolveConflict(conflictText, fileName, webhookUrl, apiKey, timeout);

      // Store result for status bar updates
      this._lastResult = result;

      // Update status bar with success
      if (this._statusBarManager) {
        this._statusBarManager.showSuccess(result.confidence, result.explanation);
      }

      this._panel.webview.postMessage({
        command: 'result',
        result: result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update status bar with error
      if (this._statusBarManager) {
        this._statusBarManager.showError(errorMessage);
      }

      this._panel.webview.postMessage({
        command: 'error',
        error: errorMessage,
      });
      vscode.window.showErrorMessage(`Failed to resolve conflict: ${errorMessage}`);
    } finally {
      this._panel.webview.postMessage({
        command: 'loading',
        loading: false,
      });
    }
  }

  private async _handleApplyMerge(code: string, autoSave: boolean = true) {
    // If we have a document URI, use it; otherwise try to get active editor
    let documentUri = this._documentUri;
    
    if (!documentUri) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage(
          'No active editor found. Please open the file with conflicts first.'
        );
        return;
      }
      documentUri = editor.document.uri;
    }

    // Open/reveal the document to make sure it's active
    const document = await vscode.workspace.openTextDocument(documentUri);
    const editor = await vscode.window.showTextDocument(document);

    let success = false;

    if (!this._conflictInfo) {
      // Replace entire file
      success = await FileOperations.replaceFileContent(documentUri, code);
    } else {
      // Replace conflict section
      const edit = new vscode.WorkspaceEdit();
      const startPos = new vscode.Position(this._conflictInfo.startLine, 0);
      const endPos = new vscode.Position(
        this._conflictInfo.endLine,
        document.lineAt(this._conflictInfo.endLine).text.length
      );
      const range = new vscode.Range(startPos, endPos);
      
      edit.replace(documentUri, range, code);
      success = await vscode.workspace.applyEdit(edit);
    }

    if (success) {
      // Auto-save if requested (default: true for one-click apply)
      if (autoSave) {
        await document.save();
      }

      // Show success toast with action buttons
      const confidence = this._lastResult?.confidence || 0;
      const confidencePercent = Math.round(confidence * 100);
      const confidenceLabel = confidence >= 0.8 
        ? 'High' 
        : confidence >= 0.5 
          ? 'Medium' 
          : 'Low';
      
      const actions: vscode.MessageItem[] = [
        { title: 'View Changes' },
        { title: 'Open File' }
      ];
      
      if (!autoSave) {
        actions.splice(1, 0, { title: 'Save File' });
      }
      
      const action = await vscode.window.showInformationMessage(
        `✅ Conflict resolved successfully! (${confidencePercent}% ${confidenceLabel} confidence)`,
        { modal: false },
        ...actions
      );

      // Handle toast actions
      if (action?.title === 'View Changes') {
        // Open the diff view or scroll to the resolved section
        if (this._conflictInfo) {
          const range = new vscode.Range(
            this._conflictInfo.startLine,
            0,
            this._conflictInfo.startLine,
            0
          );
          editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        }
      } else if (action?.title === 'Save File' && !autoSave) {
        await document.save();
      } else if (action?.title === 'Open File') {
        await vscode.window.showTextDocument(document);
      }

      // Update status bar
      if (this._statusBarManager && this._lastResult) {
        this._statusBarManager.showSuccess(
          this._lastResult.confidence,
          `Applied and ${autoSave ? 'saved' : 'ready to save'}`
        );
      }
    } else {
      vscode.window.showErrorMessage('Failed to apply changes');
      if (this._statusBarManager) {
        this._statusBarManager.showError('Failed to apply changes');
      }
    }
  }

  private async _handleCopyCode(code: string) {
    await vscode.env.clipboard.writeText(code);
    vscode.window.showInformationMessage('Code copied to clipboard!');
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get the path to the resource on disk
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css')
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">
				<title>MergeSense AI</title>
			</head>
			<body>
				<div class="container">
					<h1>MergeSense AI</h1>
					<p class="subtitle">AI-powered Git Merge Conflict resolver</p>
					
					<div class="file-info">
						<strong>File:</strong> ${this._fileName}
					</div>

					<div class="section">
						<h2>Conflict Input</h2>
						<textarea id="conflictInput" class="code-input" placeholder="Paste your conflict here...">${this._escapeHtml(this._conflictText)}</textarea>
						<button id="resolveBtn" class="btn btn-primary">Analyze Conflict</button>
					</div>

					<div id="loading" class="loading hidden">
						<div class="spinner"></div>
						<p>Resolving conflict...</p>
					</div>

					<div id="result" class="result hidden">
						<div id="statusAlert" class="alert"></div>
						<div id="explanation" class="explanation"></div>
						
						<div class="diff-container">
							<div class="diff-header">
								<span>Original</span>
								<span>Resolved</span>
							</div>
							<div id="diffContent" class="diff-content"></div>
						</div>

						<div id="confidenceInfo" class="confidence-info hidden"></div>

						<div class="actions">
							<h3>Accept Changes:</h3>
							<div class="button-group">
								<button id="acceptHead" class="btn btn-outline">Accept HEAD</button>
								<button id="acceptIncoming" class="btn btn-outline">Accept Incoming</button>
								<button id="acceptAI" class="btn btn-primary">Accept AI Merge</button>
								<button id="autoApply" class="btn btn-success hidden">Auto-Apply (High Confidence)</button>
							</div>
							<button id="copyBtn" class="btn btn-secondary">Copy Merged Code</button>
						</div>

						<div id="badges" class="badges"></div>
					</div>

					<div id="error" class="error hidden"></div>
				</div>

				<script nonce="${nonce}">
					// Set up global variables for main.js
					window.fileName = ${JSON.stringify(this._fileName)};
					window.conflictInfo = ${JSON.stringify(this._conflictInfo)};
				</script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  private _escapeHtml(text: string): string {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  public dispose() {
    ConflictResolverPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

