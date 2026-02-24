import { Principal } from '@dfinity/principal';

/**
 * Parse a comma or newline-separated list of principal IDs
 * Returns an array of valid Principal objects
 */
export function parsePrincipalList(input: string): Principal[] {
  if (!input.trim()) return [];
  
  const lines = input.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  const principals: Principal[] = [];
  
  for (const line of lines) {
    try {
      principals.push(Principal.fromText(line));
    } catch (e) {
      // Skip invalid principals
      console.warn(`Invalid principal: ${line}`);
    }
  }
  
  return principals;
}

/**
 * Validate a single principal ID string
 */
export function isValidPrincipal(text: string): boolean {
  try {
    Principal.fromText(text.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Format a principal for display (truncated)
 */
export function formatPrincipal(principal: Principal, length: number = 10): string {
  const str = principal.toString();
  if (str.length <= length + 3) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Convert a Principal ID string to a deterministic 5-digit numeric string (00001–99999).
 * The same input always produces the same output.
 */
export function principalToShortId(principalId: string): string {
  let hash = 0;
  for (let i = 0; i < principalId.length; i++) {
    const char = principalId.charCodeAt(i);
    hash = (hash * 31 + char) >>> 0; // keep as unsigned 32-bit integer
  }
  const num = (hash % 99999) + 1; // range: 1–99999
  return num.toString().padStart(5, '0');
}
