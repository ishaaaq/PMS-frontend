
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS, ProjectStatus } from '../services/projects';
import { ArrowLeft, Save, Plus, Trash2, DollarSign, Target, AlertTriangle } from 'lucide-react';

interface Milestone {
    id: string;
    title: string;
    percentage: number;
    budget: number;
    dueDate: string;
}

export default function CreateProjectPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Minimal form state management
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        state: '',
        lga: '',
        budgetTotal: '',
        contractor: '',
        consultant: '',
        startDate: '',
        endDate: '',
        complianceStandard: 'ISO-9001',
        kpiTarget: '95'
    });

    const [milestones, setMilestones] = useState<Milestone[]>([
        { id: '1', title: 'Site Mobilization', percentage: 10, budget: 0, dueDate: '' }
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addMilestone = () => {
        setMilestones([...milestones, {
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            percentage: 0,
            budget: 0,
            dueDate: ''
        }]);
    };

    const removeMilestone = (id: string) => {
        setMilestones(milestones.filter(m => m.id !== id));
    };

    const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
        setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const totalPercentage = milestones.reduce((sum, m) => sum + Number(m.percentage || 0), 0);
    const totalAllocatedBudget = milestones.reduce((sum, m) => sum + Number(m.budget || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (totalPercentage !== 100) {
            alert('Total milestone percentage must equal 100%');
            return;
        }

        setLoading(true);

        // Simulate API Call
        setTimeout(() => {
            MOCK_PROJECTS.unshift({
                id: Math.random().toString(36).substr(2, 9),
                ...formData,
                budgetTotal: Number(formData.budgetTotal),
                approvedBudget: Number(formData.budgetTotal),
                amountSpent: 0,
                status: ProjectStatus.INITIATED,
                progress: 0,
                gallery: [],
                department: 'Projects',
            });
            setLoading(false);
            navigate('/dashboard/projects');
        }, 1000);
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-400 hover:text-gray-500 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Create New Project
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 italic">Initiate a new PTDF funded site.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Basic Information */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
                            <Plus className="h-4 w-4 mr-2 text-indigo-500" /> Basic Information
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="e.g. Construction of ICT Center"
                                value={formData.title}
                                onChange={handleChange}
                                className="block w-full sm:text-sm border-gray-200 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all border"
                            />
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Detailed overview of project goals..."
                                value={formData.description}
                                onChange={handleChange}
                                className="block w-full sm:text-sm border-gray-200 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all border"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                placeholder="e.g. Kaduna"
                                value={formData.state}
                                onChange={handleChange}
                                className="block w-full sm:text-sm border-gray-200 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all border"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LGA</label>
                            <input
                                type="text"
                                name="lga"
                                placeholder="e.g. Zaria"
                                value={formData.lga}
                                onChange={handleChange}
                                className="block w-full sm:text-sm border-gray-200 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all border"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Assignments & KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
                                <Plus className="h-4 w-4 mr-2 text-blue-500" /> Stakeholders
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Consultant</label>
                                <input
                                    type="text"
                                    name="consultant"
                                    placeholder="Enter consultant name or email"
                                    value={formData.consultant}
                                    onChange={handleChange}
                                    className="block w-full sm:text-sm border-gray-200 rounded-lg p-3 bg-gray-50 border"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Contractor</label>
                                <input
                                    type="text"
                                    name="contractor"
                                    placeholder="Enter contractor name or email"
                                    value={formData.contractor}
                                    onChange={handleChange}
                                    className="block w-full sm:text-sm border-gray-200 rounded-lg p-3 bg-gray-50 border"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
                                <Target className="h-4 w-4 mr-2 text-red-500" /> Compliance & KPIs
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Compliance Standard</label>
                                <select
                                    name="complianceStandard"
                                    value={formData.complianceStandard}
                                    onChange={handleChange}
                                    className="block w-full sm:text-sm border-gray-200 rounded-lg p-3 bg-gray-50 border"
                                >
                                    <option value="ISO-9001">ISO-9001 (Quality)</option>
                                    <option value="ISO-45001">ISO-45001 (Safety)</option>
                                    <option value="PTDF-Custom">PTDF Site Standard v2</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Completion (%)</label>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        name="kpiTarget"
                                        value={formData.kpiTarget}
                                        onChange={handleChange}
                                        className="block w-full sm:text-sm border-gray-200 rounded-l-lg p-3 bg-gray-50 border"
                                    />
                                    <span className="bg-gray-100 px-4 py-3 border border-l-0 border-gray-200 rounded-r-lg text-sm text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Financials & Milestones */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-green-500" /> Budget & Milestones
                        </h3>
                        <div className="flex gap-4">
                            <div className="text-xs">
                                <span className="text-gray-400 font-bold uppercase">Total Budget:</span>
                                <span className="ml-2 font-bold text-gray-900">₦{Number(formData.budgetTotal).toLocaleString()}</span>
                            </div>
                            <div className={`text-xs ${totalPercentage > 100 ? 'text-red-500' : 'text-indigo-500'}`}>
                                <span className="font-bold uppercase">Allocated:</span>
                                <span className="ml-2 font-bold">{totalPercentage}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Project Budget (₦)</label>
                            <input
                                type="number"
                                name="budgetTotal"
                                placeholder="0.00"
                                value={formData.budgetTotal}
                                onChange={handleChange}
                                className="block w-full md:w-1/3 sm:text-lg font-bold border-gray-200 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all border"
                            />
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 font-medium">Define project milestones and their financial weightage.</p>

                            {milestones.map((milestone, idx) => (
                                <div key={milestone.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border border-gray-100 rounded-lg relative group">
                                    <div className="md:col-span-1 flex items-center justify-center pb-3">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 text-[10px] font-bold flex items-center justify-center text-gray-600">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Milestone Title</label>
                                        <input
                                            type="text"
                                            value={milestone.title}
                                            onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                            className="w-full text-sm border-gray-200 rounded-lg p-2 bg-gray-50 border"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Weight (%)</label>
                                        <input
                                            type="number"
                                            value={milestone.percentage}
                                            onChange={(e) => updateMilestone(milestone.id, 'percentage', e.target.value)}
                                            className="w-full text-sm border-gray-200 rounded-lg p-2 bg-gray-50 border"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Allocated (₦)</label>
                                        <input
                                            type="number"
                                            value={milestone.budget}
                                            onChange={(e) => updateMilestone(milestone.id, 'budget', e.target.value)}
                                            className="w-full text-sm border-gray-200 rounded-lg p-2 bg-gray-50 border font-bold text-green-700"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={milestone.dueDate}
                                            onChange={(e) => updateMilestone(milestone.id, 'dueDate', e.target.value)}
                                            className="w-full text-sm border-gray-200 rounded-lg p-2 bg-gray-50 border"
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-center pb-2">
                                        <button
                                            type="button"
                                            onClick={() => removeMilestone(milestone.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addMilestone}
                                className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:border-indigo-200 hover:text-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center justify-center"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Next Milestone
                            </button>
                        </div>
                    </div>

                    {totalAllocatedBudget > Number(formData.budgetTotal) && (
                        <div className="px-6 py-3 bg-red-50 flex items-center text-red-700 text-xs font-medium">
                            <AlertTriangle className="h-4 w-4 mr-2" /> Warning: Allocated milestone budget (₦{totalAllocatedBudget.toLocaleString()}) exceeds total project budget.
                        </div>
                    )}
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-between pb-10">
                    <p className="text-xs text-gray-400">* All fields are required to ensure compliance with PTDF monitoring protocols.</p>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bg-white py-3 px-8 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all text-sm"
                        >
                            Save Draft
                        </button>
                        <button
                            type="submit"
                            disabled={loading || totalPercentage > 100}
                            className="inline-flex justify-center py-3 px-10 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Initiating...' : 'Create Project'}
                            {!loading && <Save className="ml-2 h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
