import { REPORT_STATS } from '../../utils/mockData';

export default function ReportStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_STATS.map((stat) => (
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
