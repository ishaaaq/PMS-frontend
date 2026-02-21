import { useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import ReportStats from '../components/reports/ReportStats';
import MainAnalyticChart from '../components/reports/MainAnalyticChart';
import ZoneSnapshot from '../components/reports/ZoneSnapshot';
import ReportList from '../components/reports/ReportList';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'consultants'>('overview');
    const [isGenerating, setIsGenerating] = useState(false);
    const [statsData, setStatsData] = useState([65, 40, 75, 55, 80, 60]); // Kept for zone snapshot pass-through

    const generateReport = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reporting</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Deep insights and downloadable reports for executive decision making</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={generateReport}
                        disabled={isGenerating}
                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-lg shadow-indigo-600/30 text-sm font-bold text-white transition-all active:scale-95 ${isGenerating ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="mr-2 h-4 w-4" /> Generate New Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <ReportStats />

            {/* Analytics Section with Tabs */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                    {['overview', 'financial', 'consultants'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as 'overview' | 'financial' | 'consultants')}
                            className={`pb-3 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === tab
                                ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab} Analytics
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Card - DYNAMIC BASED ON TAB */}
                    <MainAnalyticChart activeTab={activeTab} statsData={statsData} />

                    {/* Secondary Chart / Info */}
                    <ZoneSnapshot />
                </div>
            </div>

            {/* Reports List */}
            <ReportList />
        </div>
    );
}
