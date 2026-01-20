
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultant, type Consultant } from '../services/consultants';
import { ArrowLeft, Mail, Phone, MapPin, Star, Briefcase, Calendar, Award } from 'lucide-react';

export default function ConsultantDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [consultant, setConsultant] = useState<Consultant | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Bio');

    useEffect(() => {
        if (id) {
            getConsultant(id).then((data) => {
                setConsultant(data);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading consultant details...</div>;
    }

    if (!consultant) {
        return <div className="p-8 text-center text-red-500">Consultant not found</div>;
    }

    const tabs = ['Bio', 'Projects', 'Analytics', 'Personnel'];

    return (
        <div className="p-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard/consultants')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Consultants
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Avatar */}
                            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-700 font-bold text-2xl">
                                    {consultant.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>

                            {/* Info */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{consultant.name}</h1>
                                <p className="text-gray-600 mt-1">{consultant.specialization}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${consultant.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        consultant.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {consultant.status}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-5 w-5 ${star <= Math.round(consultant.rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                        <span className="ml-2 text-sm font-medium text-gray-900">
                                            {consultant.rating.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm">
                                Edit Profile
                            </button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
                                Assign Project
                            </button>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900">{consultant.email}</p>
                            </div>
                        </div>
                        {consultant.phone && (
                            <div className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{consultant.phone}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Region</p>
                                <p className="text-sm font-medium text-gray-900">{consultant.region}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="border-t border-gray-200 px-6 py-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="flex items-center space-x-3">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-xs text-gray-500">Active Projects</p>
                                <p className="text-lg font-semibold text-gray-900">{consultant.activeProjects}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Award className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-xs text-gray-500">Completed Projects</p>
                                <p className="text-lg font-semibold text-gray-900">{consultant.completedProjects}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-xs text-gray-500">Joined</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(consultant.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Star className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-xs text-gray-500">Department</p>
                                <p className="text-lg font-semibold text-gray-900">{consultant.department}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                    ${activeTab === tab
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                                `}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'Bio' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                            <p className="mt-1 text-gray-900">{consultant.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Specialization</label>
                            <p className="mt-1 text-gray-900">{consultant.specialization}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Company</label>
                            <p className="mt-1 text-gray-900">{consultant.company}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Department</label>
                            <p className="mt-1 text-gray-900">{consultant.department}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Region</label>
                            <p className="mt-1 text-gray-900">{consultant.region}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Projects' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Projects</h3>
                    <p className="text-gray-500">Project list will be displayed here</p>
                </div>
            )}

            {activeTab === 'Analytics' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Analytics</h3>
                    <p className="text-gray-500">Analytics and performance metrics will be displayed here</p>
                </div>
            )}

            {activeTab === 'Personnel' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
                    <p className="text-gray-500">Team members working with this consultant will be displayed here</p>
                </div>
            )}
        </div>
    );
}
