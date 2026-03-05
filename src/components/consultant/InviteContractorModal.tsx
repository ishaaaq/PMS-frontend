import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { InvitationsService } from '../../services/invitations.service';

interface InviteContractorModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
    projectName?: string;
}

export default function InviteContractorModal({ isOpen, onClose, projectId, projectName }: InviteContractorModalProps) {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteLink, setInviteLink] = useState<string | null>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setInviteLink(null);
            setInviteError('');
            setInviteEmail('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInviteContractor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !projectId) {
            if (!projectId) setInviteError('Select a project first');
            return;
        }

        setInviteLoading(true);
        setInviteError('');

        try {
            const inviteId = await InvitationsService.createInvitation(inviteEmail, 'CONTRACTOR', projectId);
            const link = `${window.location.origin}/invite/${inviteId}`;
            setInviteLink(link);

            // Auto-open email client
            const subject = encodeURIComponent(`You're invited to PTDF ProMOS as a Contractor`);
            const projectText = projectName ? ` for project "${projectName}"` : '';
            const body = encodeURIComponent(
                `Hello,\n\nYou have been invited to join the PTDF Project Management and Operation System (ProMOS) as a CONTRACTOR${projectText}.\n\nClick the link below to accept your invitation and set up your account:\n\n${link}\n\nThis link is unique to you. Do not share it with anyone else.\n\nBest regards,\nPTDF ProMOS Team`
            );
            window.open(`https://mail.google.com/mail/?view=cm&to=${inviteEmail}&su=${subject}&body=${body}`, '_blank');
            setInviteEmail('');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to create invitation';
            setInviteError(msg);
        } finally {
            setInviteLoading(false);
        }
    };

    const resetInviteForm = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invite Contractor</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Send a registration link via email</p>
                    </div>
                </div>

                {inviteLink ? (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Invitation Created!</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">An email has been opened. Share this link with the contractor:</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-300 truncate border border-gray-100 dark:border-gray-600">
                            {inviteLink}
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText(inviteLink); }}
                            className="w-full py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            Copy Link
                        </button>
                        <button
                            onClick={resetInviteForm}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleInviteContractor} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contractor Email</label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                                placeholder="contractor@example.com"
                                required
                                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                            {inviteError && (
                                <p className="mt-2 text-xs text-red-500 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" /> {inviteError}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={resetInviteForm}
                                className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={inviteLoading || !inviteEmail}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Invite'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
