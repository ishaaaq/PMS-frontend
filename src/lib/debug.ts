/**
 * Debug logging utility for RPC / service errors.
 * Logs are only emitted in development mode.
 */

export const DEBUG = import.meta.env.DEV;

interface SupabaseError {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
}

export function logRpcError(fnName: string, error: unknown): void {
    if (!DEBUG) return;

    const e = error as SupabaseError;
    console.group(`[RPC ERROR] ${fnName}`);
    console.error('message :', e.message ?? '(none)');
    console.error('details :', e.details ?? '(none)');
    console.error('hint    :', e.hint ?? '(none)');
    console.error('code    :', e.code ?? '(none)');
    console.groupEnd();
}
