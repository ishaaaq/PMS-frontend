import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, PieChart, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { DashboardService, type BudgetOverview } from '../../services/dashboard.service';

function formatCurrency(amount: number): string {
    if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(1)}M`;
    return `₦${amount.toLocaleString()}`;
}

export default function BudgetStats() {
    const [budget, setBudget] = useState<BudgetOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        DashboardService.getBudgetOverview()
            .then(data => setBudget(data))
            .catch(err => console.error('BudgetStats load error:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>)}
            </div>
        );
    }

    const stats = [
        { label: 'Total Allocated', amount: formatCurrency(budget?.totalAllocated || 0), change: '', type: 'up' as const, icon: PieChart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Total Disbursed', amount: formatCurrency(budget?.totalDisbursed || 0), change: '', type: 'up' as const, icon: CreditCard, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Actual Expenditure', amount: formatCurrency(budget?.totalSpent || 0), change: '', type: 'up' as const, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Remaining Balance', amount: formatCurrency(budget?.remainingBalance || 0), change: '', type: 'down' as const, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:translate-y-[-2px] transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        {stat.change && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${stat.type === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                {stat.type === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                {stat.change}
                            </span>
                        )}
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
