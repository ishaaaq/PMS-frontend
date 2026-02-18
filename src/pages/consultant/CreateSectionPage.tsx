import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    Briefcase,
    Plus,
    Trash2,
    DollarSign,
    CheckCircle,
    ListChecks,
    AlertTriangle
} from 'lucide-react';
import { SectionsService } from '../../services/sections.service';
import { supabase } from '@/lib/supabase';

export default function CreateSectionPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Project ID

    // Form State
    const [contractorMode, setContractorMode] = useState<'existing' | 'invite'>('existing');
    const [selectedContractor, setSelectedContractor] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [contractors, setContractors] = useState<{ id: string; full_name: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [sections, setSections] = useState([
        { title: '', budget: '', startDate: '', endDate: '', description: '', milestoneIds: [] as string[] }
    ]);

    // Mock project milestones (in real app, fetch from API)
    const projectMilestones = [
        { id: 'm1', title: 'Site Clearing', status: 'COMPLETED', amount: '₦5,000,000' },
        { id: 'm2', title: 'Foundation Excavation', status: 'COMPLETED', amount: '₦10,000,000' },
        { id: 'm3', title: 'Foundation Pouring', status: 'PENDING_APPROVAL', amount: '₦10,000,000' },
        { id: 'm4', title: 'Column Installation', status: 'IN_PROGRESS', amount: '₦15,000,000' },
        { id: 'm5', title: 'Beam Construction', status: 'IN_PROGRESS', amount: '₦18,000,000' },
        { id: 'm6', title: 'Floor Slab Casting', status: 'QUERIED', amount: '₦12,000,000' },
        { id: 'm7', title: 'Electrical Panel Installation', status: 'IN_PROGRESS', amount: '₦8,000,000' },
        { id: 'm8', title: 'Network Cabling', status: 'IN_PROGRESS', amount: '₦7,000,000' },
    ];

    // Fetch contractors from Supabase
    useEffect(() => {
        supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'contractor')
            .then(({ data }) => {
                if (data) setContractors(data as { id: string; full_name: string }[]);
            });
    }, []);

    const handleAddSection = () => {
        setSections([...sections, { title: '', budget: '', startDate: '', endDate: '', description: '', milestoneIds: [] }]);
    };

    const handleRemoveSection = (index: number) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
    };

    const handleChange = (index: number, field: string, value: string | string[]) => {
        const newSections = [...sections];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newSections[index] as any)[field] = value;
        setSections(newSections);
    };

    const handleMilestoneToggle = (sectionIndex: number, milestoneId: string) => {
        const newSections = [...sections];
        const section = newSections[sectionIndex];

        if (section.milestoneIds.includes(milestoneId)) {
            // Remove milestone
            section.milestoneIds = section.milestoneIds.filter(id => id !== milestoneId);
        } else {
            // Add milestone
            section.milestoneIds = [...section.milestoneIds, milestoneId];
        }

        setSections(newSections);
    };

    // Check if milestone is assigned to another section
    const isMilestoneAssigned = (milestoneId: string, currentSectionIndex: number) => {
        return sections.some((section, index) =>
            index !== currentSectionIndex && section.milestoneIds.includes(milestoneId)
        );
    };

    // Get which section a milestone is assigned to
    const getAssignedSectionName = (milestoneId: string, currentSectionIndex: number) => {
        const sectionIndex = sections.findIndex((section, index) =>
            index !== currentSectionIndex && section.milestoneIds.includes(milestoneId)
        );
        if (sectionIndex >= 0) {
            return sections[sectionIndex].title || `Section ${sectionIndex + 1}`;
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setError(null);
        setSubmitting(true);
        try {
            for (const section of sections) {
                const sectionId = await SectionsService.createSection(
                    id,
                    section.title,
                    section.description,
                    section.milestoneIds
                );
                // Assign contractor if one is selected (UUID from dropdown)
                if (contractorMode === 'existing' && selectedContractor && sectionId) {
                    await SectionsService.assignContractor(String(sectionId), selectedContractor);
                }
            }
            navigate(`/dashboard/consultant/projects/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create sections. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Project
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Project Sections</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Define milestones and assign specific work sections to contractors.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Contractor Assignment Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            Contractor Assignment
                        </h3>
                    </div>

                    <div className="p-6">
                        <div className="max-w-xl">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Assign these sections to:</label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div
                                    onClick={() => setContractorMode('existing')}
                                    className={`cursor-pointer rounded-lg border p-4 flex items-start gap-3 transition-all ${contractorMode === 'existing'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${contractorMode === 'existing' ? 'border-indigo-600' : 'border-gray-400'
                                        }`}>
                                        {contractorMode === 'existing' && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">Existing Contractor</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Choose from project contractors</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setContractorMode('invite')}
                                    className={`cursor-pointer rounded-lg border p-4 flex items-start gap-3 transition-all ${contractorMode === 'invite'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${contractorMode === 'invite' ? 'border-indigo-600' : 'border-gray-400'
                                        }`}>
                                        {contractorMode === 'invite' && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">Invite New</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Send an email invitation</p>
                                    </div>
                                </div>
                            </div>

                            {contractorMode === 'existing' ? (
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Select Contractor</label>
                                    <select
                                        className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2.5"
                                        value={selectedContractor}
                                        onChange={(e) => setSelectedContractor(e.target.value)}
                                    >
                                        <option value="">Select a contractor...</option>
                                        {contractors.map(c => (
                                            <option key={c.id} value={c.id}>{c.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Contractor Email</label>
                                    <input
                                        type="email"
                                        placeholder="enter.email@example.com"
                                        className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2.5"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sections List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Definition of Sections</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {sections.length} Section{sections.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {sections.map((section, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative group transition-all hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md">
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Section {index + 1}
                                    </h4>
                                    {sections.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSection(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Remove Section"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Section Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Foundation & Site Clearing"
                                            value={section.title}
                                            onChange={(e) => handleChange(index, 'title', e.target.value)}
                                            className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white py-2.5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description & Requirements</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Describe the work required for this section..."
                                            value={section.description}
                                            onChange={(e) => handleChange(index, 'description', e.target.value)}
                                            className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white py-2.5"
                                        />
                                    </div>

                                    {/* Milestone Assignment */}
                                    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                            <ListChecks className="h-4 w-4" />
                                            Assign Milestones to this Section
                                        </label>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600">
                                            {projectMilestones.length > 0 ? (
                                                <div className="space-y-2">
                                                    {projectMilestones.map((milestone) => {
                                                        const isAssigned = isMilestoneAssigned(milestone.id, index);
                                                        const assignedTo = isAssigned ? getAssignedSectionName(milestone.id, index) : '';
                                                        const isChecked = section.milestoneIds.includes(milestone.id);

                                                        return (
                                                            <label
                                                                key={milestone.id}
                                                                className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${isAssigned ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-gray-800'
                                                                    } ${isChecked ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    disabled={isAssigned}
                                                                    onChange={() => handleMilestoneToggle(index, milestone.id)}
                                                                    className="mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{milestone.title}</p>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{milestone.amount}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${milestone.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                                            milestone.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                                                                milestone.status === 'QUERIED' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                                                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                                            }`}>
                                                                            {milestone.status.replace('_', ' ')}
                                                                        </span>
                                                                        {isAssigned && (
                                                                            <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                                                                                (Assigned to {assignedTo})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No milestones available</p>
                                            )}
                                        </div>
                                        {section.milestoneIds.length > 0 && (
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                                                {section.milestoneIds.length} milestone{section.milestoneIds.length !== 1 ? 's' : ''} assigned to this section
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Budget Allocation</label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                placeholder="0.00"
                                                value={section.budget}
                                                onChange={(e) => handleChange(index, 'budget', e.target.value)}
                                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 border-gray-300 dark:border-gray-600 rounded-lg sm:text-sm bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white py-2.5"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    required
                                                    value={section.startDate}
                                                    onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 dark:border-gray-600 rounded-lg sm:text-sm bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white py-2.5"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    required
                                                    value={section.endDate}
                                                    onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 dark:border-gray-600 rounded-lg sm:text-sm bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white py-2.5"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAddSection}
                        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex flex-col items-center justify-center gap-2 group bg-gray-50/50 dark:bg-gray-800/30"
                    >
                        <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            <Plus className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-sm">Add Another Section</span>
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                    >
                        <CheckCircle className="h-4 w-4" />
                        {submitting ? 'Creating...' : 'Create & Assign Sections'}
                    </button>
                </div>

            </form>
        </div>
    );
}
