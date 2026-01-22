
import { useState } from 'react';
import { Users, Mail, Link as LinkIcon, UserPlus } from 'lucide-react';
import type { Project } from '../../services/projects';

interface PersonnelTabProps {
    project: Project;
}

type PersonnelType = 'Consultant' | 'Contractor' | 'In-house';

export default function PersonnelTab({ project }: PersonnelTabProps) {
    const [activePersonnelTab, setActivePersonnelTab] = useState<PersonnelType>('Consultant');
    const [email, setEmail] = useState('');

    // Mock data - in real app, this would come from API
    const consultants: any[] = [];
    const contractors: any[] = [];
    const inHouseTeam: any[] = [];

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
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {(['Consultant', 'Contractor', 'In-house'] as PersonnelType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setActivePersonnelTab(type)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activePersonnelTab === type
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {type}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Personnel List or Empty State */}
            <div className="bg-white rounded-lg shadow">
                {isEmpty ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-24 w-24 text-gray-400 mb-4 flex items-center justify-center">
                            <Users className="h-16 w-16" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No {activePersonnelTab.toLowerCase()} added to this project yet
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Invite a {activePersonnelTab.toLowerCase()} to collaborate on this project
                        </p>
                    </div>
                ) : (
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {activePersonnelTab} Team Members
                        </h3>
                        <div className="space-y-4">
                            {personnelList.map((person: any) => (
                                <div key={person.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-indigo-700 font-medium text-sm">
                                                {person.name.split(' ').map((n: string) => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{person.name}</p>
                                            <p className="text-sm text-gray-500">{person.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {person.role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Invite Section */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <h4 className="text-base font-medium text-gray-900 mb-4">
                        Invite Collaborator
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                        Share this link with anyone you want to invite to this project. Only invited users can be part of this project.
                    </p>

                    {/* Invite Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                        <button
                            onClick={copyInviteLink}
                            className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-white transition-colors"
                        >
                            <LinkIcon className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-xs font-medium text-gray-700">Copy link</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-white transition-colors">
                            <Mail className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-xs font-medium text-gray-700">Email</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-white transition-colors">
                            <LinkIcon className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-xs font-medium text-gray-700">Link</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-white transition-colors">
                            <UserPlus className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-xs font-medium text-gray-700">Add</span>
                        </button>
                    </div>

                    {/* Email Invite Form */}
                    <form onSubmit={handleInvite} className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            required
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
