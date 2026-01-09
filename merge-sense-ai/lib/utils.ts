import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes code formatting for Git compatibility
 * - Converts Windows line endings (\r\n) to Unix (\n)
 * - Trims trailing whitespace from each line
 * - Preserves the overall structure
 */
export function normalizeCode(code: string): string {
  return code
    .replaceAll("\r\n", "\n")  // Normalize line endings (Windows to Unix)
    .split("\n")
    .map(line => line.trimEnd())  // Trim trailing whitespace from each line
    .join("\n");
}
