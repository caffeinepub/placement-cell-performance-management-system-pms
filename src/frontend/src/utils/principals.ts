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
