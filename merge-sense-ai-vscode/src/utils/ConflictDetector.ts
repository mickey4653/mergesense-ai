/**
 * Utility class to detect and extract Git conflict markers from files
 */
export class ConflictDetector {
  private readonly conflictStartMarker = /^<<<<<<< (.+)$/m;
  private readonly conflictSeparator = /^=======$/m;
  private readonly conflictEndMarker = /^>>>>>>> (.+)$/m;

  /**
   * Check if the file content contains conflict markers
   */
  hasConflictMarkers(content: string): boolean {
    return (
      this.conflictStartMarker.test(content) &&
      this.conflictSeparator.test(content) &&
      this.conflictEndMarker.test(content)
    );
  }

  /**
   * Extract all conflicts from file content
   */
  extractConflicts(content: string): Array<{
    startLine: number;
    endLine: number;
    headBranch: string;
    incomingBranch: string;
    headContent: string;
    incomingContent: string;
    fullConflict: string;
  }> {
    const conflicts: Array<{
      startLine: number;
      endLine: number;
      headBranch: string;
      incomingBranch: string;
      headContent: string;
      incomingContent: string;
      fullConflict: string;
    }> = [];

    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const startMatch = lines[i].match(this.conflictStartMarker);
      if (!startMatch) {
        i++;
        continue;
      }

      const startLine = i;
      const headBranch = startMatch[1].trim();
      i++;

      // Find separator
      let separatorLine = -1;
      while (i < lines.length) {
        if (this.conflictSeparator.test(lines[i])) {
          separatorLine = i;
          break;
        }
        i++;
      }

      if (separatorLine === -1) {
        break; // Malformed conflict
      }

      const headContent = lines
        .slice(startLine + 1, separatorLine)
        .join('\n');
      i = separatorLine + 1;

      // Find end marker
      let endLine = -1;
      let incomingBranch = '';
      while (i < lines.length) {
        const endMatch = lines[i].match(this.conflictEndMarker);
        if (endMatch) {
          endLine = i;
          incomingBranch = endMatch[1].trim();
          break;
        }
        i++;
      }

      if (endLine === -1) {
        break; // Malformed conflict
      }

      const incomingContent = lines
        .slice(separatorLine + 1, endLine)
        .join('\n');

      const fullConflict = lines.slice(startLine, endLine + 1).join('\n');

      conflicts.push({
        startLine,
        endLine,
        headBranch,
        incomingBranch,
        headContent,
        incomingContent,
        fullConflict,
      });

      i = endLine + 1;
    }

    return conflicts;
  }

  /**
   * Get the full conflict text from file content
   */
  getFullConflictText(content: string): string | null {
    if (!this.hasConflictMarkers(content)) {
      return null;
    }

    const conflicts = this.extractConflicts(content);
    return conflicts.length > 0 ? conflicts[0].fullConflict : null;
  }
}

