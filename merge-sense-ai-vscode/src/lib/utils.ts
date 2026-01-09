/**
 * Normalizes code formatting for Git compatibility
 * - Converts Windows line endings (\r\n) to Unix (\n)
 * - Trims trailing whitespace from each line
 */
export function normalizeCode(code: string): string {
  return code
    .replaceAll("\r\n", "\n")
    .split("\n")
    .map((line: string) => line.trimEnd())
    .join("\n");
}

