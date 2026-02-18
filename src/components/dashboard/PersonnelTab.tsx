
import { useState } from 'react';
import { Users, Mail, Link as LinkIcon, UserPlus } from 'lucide-react';
import type { Project } from '../../services/projects';

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

    // Mock data - in real app, this would come from API
    // Populate from project data
    const consultants: Person[] = project.consultant && project.consultant !== 'Unassigned' ? [{
        id: 'consultant-1',
        name: project.consultant,
        email: 'consultant@ptdf.gov.ng', // proper email fetch requires schema change
        role: 'Lead Consultant'
    }] : [];

    const contractors: Person[] = project.contractor && project.contractor !== 'Unassigned' ? [{
        id: 'contractor-1',
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
                        Invite Collaborator
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Share this link with anyone you want to invite to this project. Only invited users can be part of this project.
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
                        <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                            <LinkIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Link</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                            <UserPlus className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Add</span>
                        </button>
                    </div>

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
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
