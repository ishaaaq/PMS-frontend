
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectsService } from '../services/projects.service';
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
    const [error, setError] = useState<string | null>(null);

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

    const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
        setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const totalPercentage = milestones.reduce((sum, m) => sum + Number(m.percentage || 0), 0);
    const totalAllocatedBudget = milestones.reduce((sum, m) => sum + Number(m.budget || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // --- Validation ---
        const errors: string[] = [];

        if (!formData.title.trim()) {
            errors.push('Project title is required.');
        }

        const totalBudget = Number(formData.budgetTotal);
        if (!formData.budgetTotal || isNaN(totalBudget) || totalBudget <= 0) {
            errors.push('Total budget must be a positive number.');
        }

        if (milestones.length === 0) {
            errors.push('At least one milestone is required.');
        }

        milestones.forEach((m, idx) => {
            const label = `Milestone ${idx + 1}`;
            if (!m.title.trim()) {
                errors.push(`${label}: Title is required.`);
            }
            if (!m.dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(m.dueDate)) {
                errors.push(`${label}: Due date is required (YYYY-MM-DD).`);
            }
            const mBudget = Number(m.budget);
            if (isNaN(mBudget) || mBudget < 0) {
                errors.push(`${label}: Budget must be a non-negative number.`);
            }
        });

        if (totalPercentage !== 100) {
            errors.push('Total milestone percentage must equal 100%.');
        }

        if (errors.length > 0) {
            setError(errors.join('\n'));
            return;
        }

        setLoading(true);
        try {
            await ProjectsService.createProject({
                title: formData.title.trim(),
                description: formData.description.trim() || '',
                location: `${formData.state}, ${formData.lga}`.trim(),
                total_budget: totalBudget,
                currency: "NGN",
                milestones: milestones.map((m, idx) => ({
                    title: m.title.trim(),
                    description: '',
                    sort_order: idx + 1,
                    budget: Number(m.budget),
                    due_date: m.dueDate,
                })),

            });
            navigate('/dashboard/projects');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                            Create New Project
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">Initiate a new PTDF funded site.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Basic Information */}
                <div className="glass-card shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center">
                            <Plus className="h-4 w-4 mr-2 text-indigo-500" /> Basic Information
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Project Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="e.g. Construction of ICT Center"
                                value={formData.title}
                                onChange={handleChange}
                                className="block w-full sm:text-sm border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all border"
                            />
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Project Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Detailed overview of project goals..."
                                value={formData.description}
                                onChange={handleChange}
                                className="block w-full sm:text-sm border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all border"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                placeholder="e.g. Kaduna"
                                value={formData.state}
                                onChange={handleChange}
                                className="block w-full sm:text-sm border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all border"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">LGA</label>
                            <input
                                type="text"
                                name="lga"
                                placeholder="e.g. Zaria"
                                value={formData.lga}
                                onChange={handleChange}
                                className="block w-full sm:text-sm border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all border"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Assignments & KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center">
                                <Plus className="h-4 w-4 mr-2 text-blue-500" /> Stakeholders
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Assign Consultant</label>
                                <input
                                    type="text"
                                    name="consultant"
                                    placeholder="Enter consultant name or email"
                                    value={formData.consultant}
                                    onChange={handleChange}
                                    className="block w-full sm:text-sm border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Assign Contractor</label>
                                <input
                                    type="text"
                                    name="contractor"
                                    placeholder="Enter contractor name or email"
                                    value={formData.contractor}
                                    onChange={handleChange}
                                    className="block w-full sm:text-sm border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center">
                                <Target className="h-4 w-4 mr-2 text-red-500" /> Compliance & KPIs
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Compliance Standard</label>
                                <select
                                    name="complianceStandard"
                                    value={formData.complianceStandard}
                                    onChange={handleChange}
                                    className="block w-full sm:text-sm border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="ISO-9001">ISO-9001 (Quality)</option>
                                    <option value="ISO-45001">ISO-45001 (Safety)</option>
                                    <option value="PTDF-Custom">PTDF Site Standard v2</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Target Completion (%)</label>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        name="kpiTarget"
                                        value={formData.kpiTarget}
                                        onChange={handleChange}
                                        className="block w-full sm:text-sm border-gray-200 dark:border-gray-600 rounded-l-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <span className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border border-l-0 border-gray-200 dark:border-gray-600 rounded-r-lg text-sm text-gray-500 dark:text-gray-300">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Financials & Milestones */}
                <div className="glass-card shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-green-500" /> Budget & Milestones
                        </h3>
                        <div className="flex gap-4">
                            <div className="text-xs">
                                <span className="text-gray-400 font-bold uppercase">Total Budget:</span>
                                <span className="ml-2 font-bold text-gray-900 dark:text-white">₦{Number(formData.budgetTotal).toLocaleString()}</span>
                            </div>
                            <div className={`text-xs ${totalPercentage > 100 ? 'text-red-500' : 'text-indigo-500 dark:text-indigo-400'}`}>
                                <span className="font-bold uppercase">Allocated:</span>
                                <span className="ml-2 font-bold">{totalPercentage}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Total Project Budget (₦)</label>
                            <input
                                type="number"
                                name="budgetTotal"
                                placeholder="0.00"
                                value={formData.budgetTotal}
                                onChange={handleChange}
                                className="block w-full md:w-1/3 sm:text-lg font-bold border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-green-500 transition-all border"
                            />
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Define project milestones and their financial weightage.</p>

                            {milestones.map((milestone, idx) => (
                                <div key={milestone.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border border-gray-100 dark:border-gray-700 rounded-lg relative group bg-white dark:bg-gray-800/50">
                                    <div className="md:col-span-1 flex items-center justify-center pb-3">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] font-bold flex items-center justify-center text-gray-600 dark:text-gray-300">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Milestone Title</label>
                                        <input
                                            type="text"
                                            value={milestone.title}
                                            onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                            className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Weight (%)</label>
                                        <input
                                            type="number"
                                            value={milestone.percentage}
                                            onChange={(e) => updateMilestone(milestone.id, 'percentage', e.target.value)}
                                            className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Allocated (₦)</label>
                                        <input
                                            type="number"
                                            value={milestone.budget}
                                            onChange={(e) => updateMilestone(milestone.id, 'budget', e.target.value)}
                                            className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-green-700 dark:text-green-400 font-bold border focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={milestone.dueDate}
                                            onChange={(e) => updateMilestone(milestone.id, 'dueDate', e.target.value)}
                                            className="w-full text-sm border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border focus:ring-2 focus:ring-indigo-500 dark:[color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-center pb-2">
                                        <button
                                            type="button"
                                            onClick={() => removeMilestone(milestone.id)}
                                            className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addMilestone}
                                className="w-full py-3 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-400 dark:text-gray-500 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:text-indigo-400 dark:hover:text-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Next Milestone
                            </button>
                        </div>
                    </div>

                    {totalAllocatedBudget > Number(formData.budgetTotal) && (
                        <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 flex items-center text-red-700 dark:text-red-400 text-xs font-medium">
                            <AlertTriangle className="h-4 w-4 mr-2" /> Warning: Allocated milestone budget (₦{totalAllocatedBudget.toLocaleString()}) exceeds total project budget.
                        </div>
                    )}
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-between pb-10">
                    <p className="text-xs text-gray-400 dark:text-gray-500">* All fields are required to ensure compliance with PTDF monitoring protocols.</p>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bg-white dark:bg-gray-800 py-3 px-8 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all text-sm"
                        >
                            Save Draft
                        </button>
                        <button
                            type="submit"
                            disabled={loading || totalPercentage > 100}
                            className="inline-flex justify-center py-3 px-10 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
