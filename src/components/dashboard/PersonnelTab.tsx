
import { useState, useEffect, useCallback } from 'react';
import { Users, Mail, UserPlus, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import type { Project } from '../../services/projects';
import { getConsultants } from '../../services/consultants';
import { getAdminContractors } from '../../services/adminContractors';
import { ProjectsService } from '../../services/projects.service';
import UserPickerModal, { type PickerUser } from './UserPickerModal';
import { InvitationsService } from '../../services/invitations.service';
import { Loader2, Check, Copy } from 'lucide-react';

interface PersonnelTabProps {
    project: Project;
    onProjectUpdated?: () => void; // callback to parent to refresh project data
}

type PersonnelType = 'Consultant' | 'Contractor' | 'In-house';

interface Person {
    id: string;
    name: string;
    email: string;
    role: string;
}

// Inline toast notification
interface ToastState {
    type: 'success' | 'error';
    message: string;
}

export default function PersonnelTab({ project, onProjectUpdated }: PersonnelTabProps) {
    const [activePersonnelTab, setActivePersonnelTab] = useState<PersonnelType>('Consultant');
    const [email, setEmail] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<PickerUser[]>([]);

    // Invite states
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);

    // Toast notification
    const [toast, setToast] = useState<ToastState | null>(null);
    const [assigning, setAssigning] = useState(false);

    // Auto-dismiss toast
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    // Reset invite state when switching tabs
    useEffect(() => {
        setInviteLink(null);
        setInviteError(null);
        setEmail('');
        setLinkCopied(false);
    }, [activePersonnelTab]);

    const loadAvailableUsers = useCallback(async () => {
        setLoading(true);
        try {
            if (activePersonnelTab === 'Consultant') {
                const consultants = await getConsultants();
                setAvailableUsers(consultants.map(c => ({
                    id: c.id,
                    name: c.name,
                    email: c.email,
                    role: 'Consultant'
                })));
            } else if (activePersonnelTab === 'Contractor') {
                const contractors = await getAdminContractors();
                setAvailableUsers(contractors.map(c => ({
                    id: c.id,
                    name: c.companyName,
                    email: c.email,
                    role: 'Contractor'
                })));
            } else {
                setAvailableUsers([]);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    }, [activePersonnelTab]);

    useEffect(() => {
        if (isPickerOpen) {
            loadAvailableUsers();
        }
    }, [isPickerOpen, loadAvailableUsers]);

    const handleAssignUser = async (users: PickerUser[]) => {
        if (users.length === 0) return;
        const user = users[0];

        setAssigning(true);
        try {
            if (activePersonnelTab === 'Consultant') {
                if (!user.id) throw new Error('Selected user has no ID');
                await ProjectsService.assignConsultant(project.id, user.id);
                setToast({ type: 'success', message: `${user.name} assigned as Consultant successfully!` });
            } else {
                if (!user.id) throw new Error('Selected user has no ID');
                await ProjectsService.addContractorToProject(project.id, user.id);
                setToast({ type: 'success', message: `${user.name} added to project successfully!` });
            }
            // Let the parent component refresh data instead of hard reload
            onProjectUpdated?.();
        } catch (error: any) {
            console.error('Assignment failed', error);
            setToast({ type: 'error', message: error.message || 'Failed to assign user. Please try again.' });
        } finally {
            setAssigning(false);
        }
    };

    // Populate from project data
    const consultants: Person[] = project.assignedConsultants && project.assignedConsultants.length > 0
        ? project.assignedConsultants.map(c => ({
            id: c.id,
            name: c.name,
            email: 'consultant@ptdf.gov.ng',
            role: 'Consultant'
        }))
        : [];

    const contractors: Person[] = project.projectContractors && project.projectContractors.length > 0
        ? project.projectContractors.map(c => ({
            id: c.id,
            name: c.name,
            email: 'contractor@ptdf.gov.ng',
            role: 'Contractor'
        }))
        : [];

    const inHouseTeam: Person[] = [];

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        let apiRole = activePersonnelTab.toUpperCase();
        if (apiRole === 'IN-HOUSE') apiRole = 'STAFF';

        setInviteLoading(true);
        setInviteError(null);

        try {
            const inviteId = await InvitationsService.createInvitation(email, apiRole, project.id);
            const link = `${window.location.origin}/invite/${inviteId}`;
            setInviteLink(link);
            setEmail('');
        } catch (err: any) {
            console.error('Invite Error:', err);
            setInviteError(err.message || 'Failed to send invitation.');
        } finally {
            setInviteLoading(false);
        }
    };

    const copyInviteLink = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const resetInvite = () => {
        setInviteLink(null);
        setInviteError(null);
        setEmail('');
        setLinkCopied(false);
    };

    const getPersonnelList = () => {
        switch (activePersonnelTab) {
            case 'Consultant': return consultants;
            case 'Contractor': return contractors;
            case 'In-house': return inHouseTeam;
            default: return [];
        }
    };

    const personnelList = getPersonnelList();
    const isEmpty = personnelList.length === 0;

    const tabCounts: Record<PersonnelType, number> = {
        'Consultant': consultants.length,
        'Contractor': contractors.length,
        'In-house': inHouseTeam.length,
    };

    return (
        <div className="space-y-6">
            {/* Inline Toast Notification */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${toast.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                    }`}>
                    {toast.type === 'success'
                        ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        : <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    }
                    <p className="text-sm font-medium flex-1">{toast.message}</p>
                    <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100 transition-opacity text-sm">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Personnel Type Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-1">
                    {(['Consultant', 'Contractor', 'In-house'] as PersonnelType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setActivePersonnelTab(type)}
                            className={`
                                whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all rounded-t-lg
                                ${activePersonnelTab === type
                                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                                }
                            `}
                        >
                            {type}
                            {tabCounts[type] > 0 && (
                                <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${activePersonnelTab === type
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {tabCounts[type]}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Personnel List or Empty State */}
            <div className="glass-card rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {isEmpty ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-20 w-20 text-gray-300 dark:text-gray-600 mb-4 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                            <Users className="h-10 w-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No {activePersonnelTab === 'In-house' ? 'in-house team' : `${activePersonnelTab.toLowerCase()}s`} yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            {activePersonnelTab === 'In-house'
                                ? 'In-house team management coming soon.'
                                : `Add an existing ${activePersonnelTab.toLowerCase()} from the platform or invite a new one via email.`
                            }
                        </p>
                        {activePersonnelTab !== 'In-house' && (
                            <button
                                onClick={() => setIsPickerOpen(true)}
                                disabled={assigning}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add {activePersonnelTab}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                {activePersonnelTab} Team
                            </h3>
                            {activePersonnelTab !== 'In-house' && (
                                <button
                                    onClick={() => setIsPickerOpen(true)}
                                    disabled={assigning}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
                                >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Add More
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {personnelList.map((person: Person) => (
                                <div key={person.id} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-lg hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                                            <span className="text-white font-medium text-xs">
                                                {person.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{person.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full uppercase tracking-wider">
                                        {person.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Invite Section */}
                {activePersonnelTab !== 'In-house' && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50/50 dark:bg-gray-800/30">
                        <div className="flex items-center gap-2 mb-1">
                            <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Invite New {activePersonnelTab}
                            </h4>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Send an invite link to bring someone new onto the platform and this project.
                        </p>

                        {/* Success State */}
                        {inviteLink && (
                            <div className="mb-4 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">Invitation Link Generated</span>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-600 dark:text-gray-300 truncate border border-gray-200 dark:border-gray-700">
                                        {inviteLink}
                                    </div>
                                    <button
                                        onClick={copyInviteLink}
                                        className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${linkCopied
                                                ? 'bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {linkCopied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                                    </button>
                                </div>
                                <button
                                    onClick={resetInvite}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
                                >
                                    <RefreshCw className="h-3 w-3" /> Send Another Invite
                                </button>
                            </div>
                        )}

                        {/* Email Form */}
                        {!inviteLink && (
                            <form onSubmit={handleInvite} className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setInviteError(null); }}
                                        placeholder={`Enter ${activePersonnelTab.toLowerCase()} email...`}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors ${inviteError ? 'border-red-300 focus:ring-red-500 dark:border-red-500/50' : 'border-gray-200 dark:border-gray-600 focus:ring-indigo-500'
                                            }`}
                                        required
                                    />
                                    {inviteError && (
                                        <p className="absolute -bottom-5 left-0 text-[10px] text-red-500 flex items-center">
                                            <AlertCircle className="h-3 w-3 mr-1" /> {inviteError}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={inviteLoading}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-70 flex items-center justify-center min-w-[120px] shadow-sm"
                                >
                                    {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Invite'}
                                </button>
                            </form>
                        )}

                        {activePersonnelTab === 'Contractor' && !inviteLink && (
                            <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500">
                                The invited contractor will register and be automatically added to this project.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Assigning Overlay */}
            {assigning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-3 border border-gray-200 dark:border-gray-700">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Assigning user...</p>
                    </div>
                </div>
            )}

            {/* User Picker Modal */}
            <UserPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleAssignUser}
                users={availableUsers}
                title={`Select ${activePersonnelTab}`}
                loading={loading}
                singleSelect={true}
                alreadyAssignedIds={
                    activePersonnelTab === 'Consultant' ? project.assignedConsultants?.map(c => c.id) || [] :
                        activePersonnelTab === 'Contractor' ? project.projectContractors?.map(c => c.id) || [] : []
                }
            />
        </div>
    );
}
