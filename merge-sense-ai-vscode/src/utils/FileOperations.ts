import * as vscode from 'vscode';

/**
 * Utility class for file operations in VS Code
 */
export class FileOperations {
  /**
   * Read content from active editor
   */
  static async readActiveFile(): Promise<{
    content: string;
    fileName: string;
    uri: vscode.Uri;
  } | null> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }

    const document = editor.document;
    return {
      content: document.getText(),
      fileName: document.fileName.split('/').pop() || 'unknown',
      uri: document.uri,
    };
  }

  /**
   * Write content to active editor, replacing conflict section
   */
  static async writeToActiveFile(
    conflictStartLine: number,
    conflictEndLine: number,
    resolvedContent: string
  ): Promise<boolean> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return false;
    }

    const document = editor.document;
    const edit = new vscode.WorkspaceEdit();

    // Create range for the conflict section
    const startPos = new vscode.Position(conflictStartLine, 0);
    const endPos = new vscode.Position(
      conflictEndLine,
      document.lineAt(conflictEndLine).text.length
    );
    const range = new vscode.Range(startPos, endPos);

    // Replace conflict with resolved content
    edit.replace(document.uri, range, resolvedContent);

    // Apply the edit
    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
      // Save the document
      await document.save();
      vscode.window.showInformationMessage('Conflict resolved and saved!');
      return true;
    } else {
      vscode.window.showErrorMessage('Failed to apply changes');
      return false;
    }
  }

  /**
   * Replace entire file content
   */
  static async replaceFileContent(
    uri: vscode.Uri,
    newContent: string
  ): Promise<boolean> {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER
      )
    );

    edit.replace(uri, fullRange, newContent);
    const success = await vscode.workspace.applyEdit(edit);

    if (success) {
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document);
      await document.save();
      return true;
    }

    return false;
  }
}

