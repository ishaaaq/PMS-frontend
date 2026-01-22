
import { FileText, Download, PieChart, BarChart3, Clock } from 'lucide-react';

export default function ReportsPage() {
    const reportTemplates = [
        { title: 'Project Status Summary', description: 'Consolidated report of all active and completed projects.', lastGenerated: '2 days ago', type: 'PDF' },
        { title: 'Financial Disbursement Audit', description: 'Detailed breakdown of all fund movements per milestone.', lastGenerated: '5 days ago', type: 'Excel' },
        { title: 'Consultant Performance Log', description: 'Nationwide performance rating for all assigned consultants.', lastGenerated: '1 week ago', type: 'PDF' },
        { title: 'Materials Usage Analysis', description: 'Tracking material consumption across multiple sites.', lastGenerated: 'Never', type: 'Excel' },
    ];

    return (
        <div className="space-y-8">
            <div className="md:flex md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Executive Reporting</h2>
                    <p className="mt-1 text-sm text-gray-500 text-nowrap">AI-assisted and template-based reporting engine.</p>
                </div>
                <div className="mt-4 flex gap-3 md:mt-0">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95">
                        Generate Custom Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Reports', value: '42', icon: FileText, color: 'text-blue-500' },
                    { label: 'Monthly Growth', value: '+12%', icon: BarChart3, color: 'text-green-500' },
                    { label: 'Pending Reviews', value: '3', icon: Clock, color: 'text-yellow-500' },
                    { label: 'Cloud Storage', value: '82%', icon: PieChart, color: 'text-purple-500' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Report Templates</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {reportTemplates.map(template => (
                        <div key={template.title} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    <FileText className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{template.title}</h4>
                                    <p className="text-sm text-gray-500 max-w-md">{template.description}</p>
                                    <div className="mt-2 flex items-center gap-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center">
                                            <Clock className="h-3 w-3 mr-1" /> Last: {template.lastGenerated}
                                        </span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${template.type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {template.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-indigo-600 border border-gray-200 rounded-lg hover:border-indigo-100 transition-all">
                                    <Download className="h-5 w-5" />
                                </button>
                                <button className="px-4 py-2 border border-transparent rounded-lg text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-all">
                                    Configure
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nationwide snapshot */}
            <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                        <PieChart className="h-6 w-6 mr-2" />
                        Nationwide Completion Snapshot
                    </h3>
                    <p className="text-indigo-200 text-sm max-w-md mb-6">Real-time aggregation of project data from all 6 geopolitical zones.</p>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                        {['NC', 'NE', 'NW', 'SE', 'SS', 'SW'].map(zone => (
                            <div key={zone} className="text-center">
                                <div className="text-2xl font-black mb-1">{Math.floor(Math.random() * 40) + 60}%</div>
                                <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{zone} Zone</div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-800/50 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
