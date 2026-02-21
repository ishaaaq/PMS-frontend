import { Mail, UserPlus, X, Copy, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { InvitationsService } from '../../services/invitations.service';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const [role, setRole] = useState('CONTRACTOR');
    const [email, setEmail] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inviteLink, setInviteLink] = useState<string | null>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            // Small delay so the close animation isn't jarring
            const timer = setTimeout(() => {
                setInviteLink(null);
                setError(null);
                setEmail('');
                setRole('CONTRACTOR');
                setCopied(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const copyLink = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInvite = async () => {
        if (!email) {
            setError('Please enter an email address');
            return;
        }

        // Simple email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const inviteId = await InvitationsService.createInvitation(email, role);
            const link = `${window.location.origin}/invite/${inviteId}`;
            setInviteLink(link);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Invite Error:', err);
            setError(err.message || 'Failed to send invitation. They might already be invited.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendAnother = () => {
        setInviteLink(null);
        setError(null);
        setEmail('');
        setCopied(false);
    };

    const handleClose = () => {
        onClose();
    };

    const roleDescriptions: Record<string, string> = {
        'ADMIN': 'Full platform access',
        'CONSULTANT': 'Project oversight & reviews',
        'CONTRACTOR': 'Submit milestones & evidence',
        'STAFF': 'Internal team member',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                            <UserPlus className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invite Collaborator</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Send a registration link via email</p>
                        </div>
                    </div>

                    {/* Success State */}
                    {inviteLink ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                            <div className="text-center py-4">
                                <div className="mx-auto h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
                                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Invitation Created!</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Share this link with the {role.toLowerCase()}</p>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-300 truncate border border-gray-100 dark:border-gray-600">
                                    {inviteLink}
                                </div>
                                <button
                                    onClick={copyLink}
                                    className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${copied
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                                        : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                                </button>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSendAnother}
                                    className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Send Another
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Form State */
                        <div className="space-y-6">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Select Role</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['ADMIN', 'CONSULTANT', 'CONTRACTOR', 'STAFF'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setRole(r)}
                                            className={`py-3 px-3 text-left rounded-xl border transition-all ${role === r
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600 ring-1 ring-indigo-200 dark:ring-indigo-800'
                                                : 'bg-white dark:bg-gray-700/50 border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <p className={`text-xs font-bold ${role === r ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {r}
                                            </p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{roleDescriptions[r]}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="Enter collaborator email..."
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
                                        className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl focus:ring-2 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white dark:placeholder-gray-500 border outline-none transition-colors ${error
                                            ? 'border-red-300 focus:ring-red-500 dark:border-red-500/50'
                                            : 'border-gray-100 dark:border-gray-600 focus:ring-indigo-500'
                                            }`}
                                    />
                                </div>
                                {error && (
                                    <p className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" /> {error}
                                    </p>
                                )}
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleInvite}
                                disabled={isLoading || !email}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none active:scale-[0.98] transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4" />
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
