/** Human-readable message for mysql2 / connection failures. */
export function dbErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;

  if (typeof error === 'object' && error !== null) {
    const err = error as {
      name?: string;
      message?: string;
      code?: string;
      errors?: Array<{ message?: string; code?: string }>;
    };

    const parts: string[] = [];
    if (err.message) parts.push(err.message);
    if (Array.isArray(err.errors)) {
      for (const nested of err.errors) {
        if (nested?.message) parts.push(nested.message);
        else if (nested?.code) parts.push(String(nested.code));
      }
    }

    const joined = parts.filter(Boolean).join(' | ');
    const code = String(err.code || '');
    const haystack = `${joined} ${code}`;

    if (
      err.name === 'AggregateError' ||
      /ECONNREFUSED|ENOTFOUND|ECONNRESET|protocol_connection_lost|connect/i.test(haystack)
    ) {
      return 'Database is not running. Start MySQL (or Docker Desktop + MySQL) and refresh.';
    }

    if (joined.trim()) return joined.trim();
  }

  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
