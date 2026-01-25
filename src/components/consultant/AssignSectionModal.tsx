import { useState } from 'react';
import { X, Plus, Trash2, Briefcase } from 'lucide-react';

interface AssignSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
    contractorName?: string; // Optional now
}

export default function AssignSectionModal({ isOpen, onClose, projectId, contractorName }: AssignSectionModalProps) {
    const [contractorMode, setContractorMode] = useState<'existing' | 'invite'>(contractorName ? 'existing' : 'invite');
    const [selectedContractor, setSelectedContractor] = useState(contractorName || '');
    const [inviteEmail, setInviteEmail] = useState('');

    const [sections, setSections] = useState([
        { title: '', budget: '', startDate: '', endDate: '', description: '' }
    ]);

    if (!isOpen) return null;

    const handleAddSection = () => {
        setSections([...sections, { title: '', budget: '', startDate: '', endDate: '', description: '' }]);
    };

    const handleRemoveSection = (index: number) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
    };

    const handleChange = (index: number, field: string, value: string) => {
        const newSections = [...sections];
        (newSections[index] as any)[field] = value;
        setSections(newSections);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API call to assign sections
        console.log('Assigning sections to', contractorName, sections);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-indigo-600" />
                                    {contractorName ? 'Assign Project Section' : 'Create Section & Assign'}
                                </h3>
                                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Define milestones and assign to a contractor for Project ID: {projectId || 'N/A'}
                            </p>
                        </div>

                        <div className="px-4 py-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                            {/* Contractor Selection (if not provided) */}
                            {!contractorName && (
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To:</label>
                                    <div className="flex gap-4 mb-3">
                                        <label className="flex items-center text-sm">
                                            <input
                                                type="radio"
                                                name="contractorMode"
                                                checked={contractorMode === 'existing'}
                                                onChange={() => setContractorMode('existing')}
                                                className="mr-2"
                                            />
                                            Existing Project Contractor
                                        </label>
                                        <label className="flex items-center text-sm">
                                            <input
                                                type="radio"
                                                name="contractorMode"
                                                checked={contractorMode === 'invite'}
                                                onChange={() => setContractorMode('invite')}
                                                className="mr-2"
                                            />
                                            Invite New Contractor
                                        </label>
                                    </div>

                                    {contractorMode === 'existing' ? (
                                        <select
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={selectedContractor}
                                            onChange={(e) => setSelectedContractor(e.target.value)}
                                        >
                                            <option value="">Select a contractor...</option>
                                            <option value="BuildRight Construction">BuildRight Construction</option>
                                            <option value="GreenEnergy Solutions">GreenEnergy Solutions</option>
                                        </select>
                                    ) : (
                                        <div>
                                            <input
                                                type="email"
                                                placeholder="Enter contractor email address"
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">They will receive an invitation to join this project.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {sections.map((section, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                    {sections.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSection(index)}
                                            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}

                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Section {index + 1}</h4>

                                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                                        <div className="sm:col-span-6">
                                            <label className="block text-sm font-medium text-gray-700">Section Title / Milestone Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Foundation Layer"
                                                value={section.title}
                                                onChange={(e) => handleChange(index, 'title', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                rows={2}
                                                value={section.description}
                                                onChange={(e) => handleChange(index, 'description', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Budget Allocation</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">₦</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    required
                                                    value={section.budget}
                                                    onChange={(e) => handleChange(index, 'budget', e.target.value)}
                                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={section.startDate}
                                                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={section.endDate}
                                                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddSection}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another Section
                            </button>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Assign Sections
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
