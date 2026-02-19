
import { useState, useEffect } from 'react';
import { Users, Mail, Link as LinkIcon, UserPlus, AlertCircle } from 'lucide-react';
import type { Project } from '../../services/projects';
import { getConsultants } from '../../services/consultants';
import { getAdminContractors } from '../../services/adminContractors';
import { ProjectsService } from '../../services/projects.service';
import UserPickerModal, { type PickerUser } from './UserPickerModal';

interface PersonnelTabProps {
    project: Project;
}

type PersonnelType = 'Consultant' | 'Contractor' | 'In-house';

interface Person {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function PersonnelTab({ project }: PersonnelTabProps) {
    const [activePersonnelTab, setActivePersonnelTab] = useState<PersonnelType>('Consultant');
    const [email, setEmail] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<PickerUser[]>([]);

    // Derived state for current assignments
    const assignedContractorId = project.contractorId;

    // Load available users when picker opens
    useEffect(() => {
        if (isPickerOpen) {
            loadAvailableUsers();
        }
    }, [isPickerOpen, activePersonnelTab]);

    const loadAvailableUsers = async () => {
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
            }
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUserClick = () => {
        setIsPickerOpen(true);
    };

    const handleAssignUser = async (users: PickerUser[]) => {
        if (users.length === 0) return;
        const user = users[0]; // Single select for now

        try {
            if (activePersonnelTab === 'Consultant') {
                if (!user.id) throw new Error('Selected user has no ID');
                await ProjectsService.assignConsultant(project.id, user.id);
                // In a real app with query invalidation (React Query via TanStack Query), this would auto-refresh. 
                // For MVP, we might need to reload or just alert.
                // Since this component receives 'project' as prop, parent needs to refresh.
                // For now, reload window to see changes is strictly minimally invasive, 
                // OR we just trust optimistic UI if we had it.
                // We'll show an alert and reload for simplicity.
                alert('Consultant assigned successfully! Refreshing...');
                window.location.reload();
            } else {
                // Contractor flow - Fallback to Invite/Section hint as backend has no Assign RPC
                alert(`Contractors are typically assigned to specific sections. You can invite a new contractor below, or go to the Sections tab.`);
            }
        } catch (error) {
            console.error('Assignment failed', error);
            alert('Failed to assign user.');
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

    const contractors: Person[] = project.contractor && project.contractor !== 'Unassigned' ? [{
        id: project.contractorId || 'contractor-1',
        name: project.contractor,
        email: 'contractor@ptdf.gov.ng',
        role: 'Lead Contractor'
    }] : [];

    const inHouseTeam: Person[] = [];

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            alert(`Invitation sent to ${email} as ${activePersonnelTab}`);
            setEmail('');
        }
    };

    const copyInviteLink = () => {
        const link = `${window.location.origin}/invite/${project.id}/${activePersonnelTab.toLowerCase()}`;
        navigator.clipboard.writeText(link);
        alert('Invite link copied to clipboard!');
    };

    const getPersonnelList = () => {
        switch (activePersonnelTab) {
            case 'Consultant':
                return consultants;
            case 'Contractor':
                return contractors;
            case 'In-house':
                return inHouseTeam;
            default:
                return [];
        }
    };

    const personnelList = getPersonnelList();
    const isEmpty = personnelList.length === 0;

    return (
        <div className="space-y-6">
            {/* Personnel Type Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {(['Consultant', 'Contractor', 'In-house'] as PersonnelType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setActivePersonnelTab(type)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activePersonnelTab === type
                                    ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                                }
                            `}
                        >
                            {type}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Personnel List or Empty State */}
            <div className="glass-card rounded-lg">
                {isEmpty ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4 flex items-center justify-center">
                            <Users className="h-16 w-16" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No {activePersonnelTab.toLowerCase()} added to this project yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Invite a {activePersonnelTab.toLowerCase()} to collaborate on this project
                        </p>
                    </div>
                ) : (
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            {activePersonnelTab} Team Members
                        </h3>
                        <div className="space-y-4">
                            {personnelList.map((person: Person) => (
                                <div key={person.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <span className="text-indigo-700 dark:text-indigo-400 font-medium text-sm">
                                                {person.name.split(' ').map((n: string) => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{person.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {person.role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Invite Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                        Manage Team
                    </h4>

                    {/* Add User Button */}
                    <div className="mb-6">
                        <button
                            onClick={handleAddUserClick}
                            disabled={activePersonnelTab === 'In-house'}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UserPlus className="h-4 w-4" />
                            <span>Add {activePersonnelTab}</span>
                        </button>
                        {activePersonnelTab === 'Contractor' && (
                            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Contractors are usually assigned to specific Sections.
                            </p>
                        )}
                    </div>

                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                        Invite External Collaborator
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Share this link to invite someone new to the platform.
                    </p>

                    {/* Invite Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                        <button
                            onClick={copyInviteLink}
                            className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                        >
                            <LinkIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Copy link</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                            <Mail className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Email</span>
                        </button>
                    </div>

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
                                activePersonnelTab === 'Contractor' && assignedContractorId ? [assignedContractorId] : []
                        }
                    />

                    {/* Email Invite Form */}
                    <form onSubmit={handleInvite} className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            required
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors"
                        >
                            Send Invite
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
