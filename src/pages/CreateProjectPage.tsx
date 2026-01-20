
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS, ProjectStatus } from '../services/projects';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateProjectPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Minimal form state management (could use React Hook Form for larger forms)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        state: '',
        lga: '',
        budgetTotal: '',
        contractor: '',
        consultant: '',
        startDate: '',
        endDate: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API Call
        setTimeout(() => {
            // Push to mock (in-memory only for demo)
            MOCK_PROJECTS.unshift({
                id: Math.random().toString(36).substr(2, 9),
                ...formData,
                budgetTotal: Number(formData.budgetTotal),
                approvedBudget: Number(formData.budgetTotal),
                amountSpent: 0,
                status: ProjectStatus.INITIATED,
                progress: 0,
                gallery: [],
                department: 'New Project',
            });
            setLoading(false);
            navigate('/dashboard/projects');
        }, 1000);
    };

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-400 hover:text-gray-500">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Create New Project
                    </h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white p-8 shadow rounded-lg">
                <div className="space-y-8 divide-y divide-gray-200">
                    <div>
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Define the basic details of the PTDF project.
                            </p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Project Title
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="title"
                                        id="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-ptdf-primary focus:border-ptdf-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-ptdf-primary focus:border-ptdf-primary block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                    State
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="state"
                                        id="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-ptdf-primary focus:border-ptdf-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="lga" className="block text-sm font-medium text-gray-700">
                                    LGA
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="lga"
                                        id="lga"
                                        value={formData.lga}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-ptdf-primary focus:border-ptdf-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="budgetTotal" className="block text-sm font-medium text-gray-700">
                                    Budget Allocation (₦)
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="number"
                                        name="budgetTotal"
                                        id="budgetTotal"
                                        value={formData.budgetTotal}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-ptdf-primary focus:border-ptdf-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Assignments</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Assign Contractor and Consultant.
                            </p>
                        </div>
                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label htmlFor="contractor" className="block text-sm font-medium text-gray-700">
                                    Contractor
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="contractor"
                                        id="contractor"
                                        value={formData.contractor}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-ptdf-primary focus:border-ptdf-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="consultant" className="block text-sm font-medium text-gray-700">
                                    Consultant
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="consultant"
                                        id="consultant"
                                        value={formData.consultant}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-ptdf-primary focus:border-ptdf-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ptdf-primary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-ptdf-primary hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ptdf-primary"
                        >
                            {loading ? 'Saving...' : 'Create Project'}
                            {!loading && <Save className="ml-2 -mr-1 h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
