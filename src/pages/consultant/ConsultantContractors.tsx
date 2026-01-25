import { useState } from 'react';
import { Search, Mail, Phone, MapPin, Star, MoreVertical, UserPlus, Briefcase } from 'lucide-react';
import AssignSectionModal from '../../components/consultant/AssignSectionModal';

export default function ConsultantContractors() {
    const [searchTerm, setSearchTerm] = useState('');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedContractor, setSelectedContractor] = useState<any>(null);

    // Mock data
    const contractors = [
        {
            id: '1',
            name: 'BuildRight Construction Ltd',
            email: 'contact@buildright.com',
            phone: '+234 801 234 5678',
            location: 'Lagos',
            specialization: 'Civil Engineering',
            rating: 4.8,
            assignedProjects: ['ICT Center Construction'],
            status: 'Active'
        },
        {
            id: '2',
            name: 'GreenEnergy Solutions',
            email: 'info@greenenergy.ng',
            phone: '+234 809 987 6543',
            location: 'Abuja',
            specialization: 'Renewable Energy',
            rating: 4.5,
            assignedProjects: ['Solar Mini-Grid'],
            status: 'Active'
        },
        {
            id: '3',
            name: 'LabTech Nigeria',
            email: 'sales@labtech.ng',
            phone: '+234 705 555 1234',
            location: 'Port Harcourt',
            specialization: 'Equipment Supply',
            rating: 4.9,
            assignedProjects: [],
            status: 'Available'
        }
    ];

    const filteredContractors = contractors.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openAssignModal = (contractor: any) => {
        setSelectedContractor(contractor);
        setAssignModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Contractors</h1>
                    <p className="text-gray-500 text-sm">Manage contractors assigned to your projects.</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search contractors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                        <UserPlus className="h-4 w-4" /> Invite Contractor
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredContractors.map((contractor) => (
                    <div key={contractor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                                    {contractor.name.substring(0, 2).toUpperCase()}
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1 truncate">{contractor.name}</h3>
                            <p className="text-sm text-indigo-600 font-medium mb-4">{contractor.specialization}</p>

                            <div className="space-y-2 text-sm text-gray-500 mb-6">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> {contractor.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> {contractor.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> {contractor.phone}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" /> {contractor.rating}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${contractor.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {contractor.status}
                                </span>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                            <button
                                onClick={() => openAssignModal(contractor)}
                                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                <Briefcase className="h-4 w-4" /> Assign Section
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AssignSectionModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                contractorName={selectedContractor?.name}
            />
        </div>
    );
}
