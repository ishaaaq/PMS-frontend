import { useState, useEffect } from 'react';
import { FileText, BarChart3, Clock, PieChart } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ReportStats() {
    const [stats, setStats] = useState({ totalReports: 0, pendingReviews: 0, totalProjects: 0, approvedBudgets: 0 });

    useEffect(() => {
        async function fetchStats() {
            try {
                const { count: reportCount } = await supabase
                    .from('report_templates')
                    .select('*', { count: 'exact', head: true });

                const { count: pendingCount } = await supabase
                    .from('submissions')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'PENDING_APPROVAL');

                const { count: projectCount } = await supabase
                    .from('projects')
                    .select('*', { count: 'exact', head: true });

                const { data: budgetData } = await supabase
                    .from('budget_allocations')
                    .select('allocated_amount');

                const totalBudgets = budgetData ? budgetData.reduce((sum, item) => sum + Number(item.allocated_amount), 0) : 0;

                setStats({
                    totalReports: reportCount || 0,
                    pendingReviews: pendingCount || 0,
                    totalProjects: projectCount || 0,
                    approvedBudgets: totalBudgets
                });
            } catch (err) {
                console.error('ReportStats err:', err);
            }
        }
        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
        if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
        return `₦${amount.toLocaleString()}`;
    };

    const statCards = [
        { label: 'Total Reports', value: String(stats.totalReports), icon: FileText, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'All Projects', value: String(stats.totalProjects), icon: BarChart3, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Pending Reviews', value: String(stats.pendingReviews), icon: Clock, color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { label: 'Total DB Budget', value: formatCurrency(stats.approvedBudgets), icon: PieChart, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
                <div key={stat.label} className="glass-card p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300">
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
