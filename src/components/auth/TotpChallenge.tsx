import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { MfaService } from '../../services/mfa.service';

interface TotpChallengeProps {
    factorId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function TotpChallenge({ factorId, onSuccess, onCancel }: TotpChallengeProps) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) return;

        setVerifying(true);
        setError('');

        try {
            await MfaService.verifyChallenge(factorId, code);
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Invalid code. Please try again.';
            setError(msg);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Two-Factor Verification
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
                Enter the 6-digit verification code from your authenticator app.
            </p>

            {error && (
                <div className="w-full bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            <form onSubmit={handleVerify} className="w-full">
                <div className="mb-6">
                    <input
                        id="challenge-code"
                        type="text"
                        required
                        autoFocus
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="block w-full text-center text-3xl tracking-[0.5em] px-4 py-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-300 dark:placeholder-gray-600 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={verifying || code.length < 6}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        {verifying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {verifying ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={verifying}
                        className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
