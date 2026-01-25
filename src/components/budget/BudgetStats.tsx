import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BUDGET_STATS } from '../../utils/mockData';

export default function BudgetStats() {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BUDGET_STATS.map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:translate-y-[-2px] transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${stat.type === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                            {stat.type === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {stat.change}
                        </span>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                        <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.amount}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
