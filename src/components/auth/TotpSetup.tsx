import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { MfaService } from '../../services/mfa.service';

interface TotpSetupProps {
    onComplete: () => void;
}

export default function TotpSetup({ onComplete }: TotpSetupProps) {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [factorId, setFactorId] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const initMfa = async () => {
            try {
                const { factorId, uri, secret } = await MfaService.enroll();
                setFactorId(factorId);
                setQrCode(uri);
                setSecret(secret);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Failed to initialize MFA setup';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        initMfa();
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!factorId || code.length < 6) return;

        setVerifying(true);
        setError('');

        try {
            await MfaService.verifyEnrollment(factorId, code);
            setSuccess(true);
            setTimeout(() => {
                onComplete();
            }, 1500);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Invalid code. Please try again.';
            setError(msg);
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Preparing secure setup...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Setup Complete!</h3>
                <p className="text-gray-600 dark:text-gray-400">Two-factor authentication is now enabled.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center max-w-sm mx-auto w-full">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Protect Your Account
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
                Your account requires multi-factor authentication. Scan the QR code below with your authenticator app (like Google Authenticator or Authy).
            </p>

            {error && (
                <div className="w-full bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            {qrCode && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <QRCodeSVG value={qrCode} size={200} />
                </div>
            )}

            {secret && (
                <div className="mb-8 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Can't scan the code? Enter this secret manually:</p>
                    <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                        {secret}
                    </code>
                </div>
            )}

            <form onSubmit={handleVerify} className="w-full">
                <div className="mb-4">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                        Enter 6-Digit Code
                    </label>
                    <input
                        id="code"
                        type="text"
                        required
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="block w-full text-center text-2xl tracking-[0.5em] px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-300 dark:placeholder-gray-600 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>
                <button
                    type="submit"
                    disabled={verifying || code.length < 6}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                    {verifying ? 'Verifying...' : 'Verify & Enable'}
                </button>
            </form>
        </div>
    );
}
