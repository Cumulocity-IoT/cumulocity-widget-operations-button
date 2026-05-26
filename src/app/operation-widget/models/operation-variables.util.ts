import { IOperationButtonConfig, IOperationVariable } from './operation-widget-model';

const VARIABLE_REGEX = /\$\{([^}]+)\}/g;

/**
 * Extract unique `${variableName}` placeholders from a JSON string.
 * Returns [] if the string is not valid JSON.
 */
export function parseReferencedVariables(operationValue: string): string[] {
  try {
    JSON.parse(operationValue);
  } catch {
    return [];
  }

  const found = new Set<string>();
  let match: RegExpExecArray | null;
  VARIABLE_REGEX.lastIndex = 0;
  while ((match = VARIABLE_REGEX.exec(operationValue)) !== null) {
    found.add(match[1].trim());
  }
  return [...found];
}

/**
 * Substitute `${var}` placeholders in `operationValue` with `values`,
 * producing a JSON-safe string.
 *
 * - `number` variables: replace the quoted token `"${var}"` (and bare `${var}`)
 *   with the raw number, so the result is a JSON number, not a string.
 * - `text` variables: replace bare `${var}` inside JSON string literals with
 *   the value escaped via JSON.stringify (without the outer quotes), so user
 *   input containing `"` or `\` does not break JSON.parse.
 */
export function substituteVariables(
  operationValue: string,
  values: Record<string, string | number>,
  button: IOperationButtonConfig
): string {
  let result = operationValue;

  for (const [varName, rawValue] of Object.entries(values)) {
    const variableDef = button.operationVariables?.find(v => v.varName === varName);
    const quoted = new RegExp(`"\\$\\{${escapeRegex(varName)}\\}"`, 'g');
    const bare = new RegExp(`\\$\\{${escapeRegex(varName)}\\}`, 'g');

    if (variableDef?.type === 'number') {
      const asNumber = String(rawValue);
      result = result.replace(quoted, asNumber).replace(bare, asNumber);
    } else {
      const escaped = JSON.stringify(String(rawValue));
      // Strip surrounding quotes so we substitute *inside* the JSON string literal.
      const inner = escaped.slice(1, -1);
      result = result.replace(bare, inner);
    }
  }

  return result;
}

/**
 * Build IOperationVariable defaults for a list of variable names,
 * preserving settings from any existing definitions.
 */
export function reconcileOperationVariables(
  found: string[],
  existing: IOperationVariable[] = []
): IOperationVariable[] {
  const byName = new Map(existing.map(v => [v.varName, v]));
  return found.map(varName =>
    byName.get(varName) ?? { varName, label: varName, default: '', type: 'text' }
  );
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
