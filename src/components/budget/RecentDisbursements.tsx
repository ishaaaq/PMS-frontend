import { Filter } from 'lucide-react';
import { RECENT_DISBURSEMENTS } from '../../utils/mockData';

export default function RecentDisbursements() {
    return (
        <div className="glass-card rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <Filter className="h-4 w-4 text-gray-400" />
                </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {RECENT_DISBURSEMENTS.map(d => (
                    <div key={d.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                                {d.logo}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{d.project}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-tight">{d.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.amount}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${d.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                d.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                {d.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 uppercase tracking-widest border border-gray-100 dark:border-gray-700 rounded-xl transition-all">
                View Full Ledger
            </button>
        </div>
    );
}
