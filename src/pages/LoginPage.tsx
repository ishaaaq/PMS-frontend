import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import TotpSetup from '../components/auth/TotpSetup';
import TotpChallenge from '../components/auth/TotpChallenge';

interface LocationState {
    from?: { pathname: string };
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login, mfaStatus, refreshMfa, logout, user } = useAuth();

    const from = (location.state as LocationState | null)?.from?.pathname || '/dashboard';

    // Once user object is populated (AAL2 reached), navigate to dashboard
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            // onAuthStateChange fires and updates mfaStatus → component re-renders appropriately
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Invalid credentials or server unavailable';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleMfaSuccess = async () => {
        await refreshMfa();
        // refreshMfa updates mfaStatus + user → useEffect above navigates if user is set
    };

    const handleMfaCancel = async () => {
        await logout();
    };

    // ─── MFA Screens ──────────────────────────────────────────────────────────
    // Only shown AFTER a successful password login (mfaStatus is populated).
    // These checks run regardless of any loading state so the user is never stuck.

    if (mfaStatus?.currentLevel === 'aal1') {
        const factorId = mfaStatus.verifiedFactors?.[0]?.id;

        if (mfaStatus.hasFactors && factorId) {
            // Enrolled – challenge the user
            return (
                <div className="w-full">
                    <TotpChallenge
                        factorId={factorId}
                        onSuccess={handleMfaSuccess}
                        onCancel={handleMfaCancel}
                    />
                </div>
            );
        }

        // Not enrolled – force setup
        return (
            <div className="w-full">
                <TotpSetup onComplete={handleMfaSuccess} />
                <button
                    onClick={handleMfaCancel}
                    className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    Cancel and Sign Out
                </button>
            </div>
        );
    }

    // ─── Login Form ───────────────────────────────────────────────────────────
    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email address
                </label>
                <div className="mt-1">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-ptdf-primary focus:border-ptdf-primary sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Password
                </label>
                <div className="mt-1">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-ptdf-primary focus:border-ptdf-primary sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ptdf-primary hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-900 focus:ring-ptdf-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </div>
        </form>
    );
}
