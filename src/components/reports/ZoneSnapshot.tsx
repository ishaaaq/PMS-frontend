import { ArrowRight } from 'lucide-react';

export default function ZoneSnapshot() {
    return (
        <div className="glass-card rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Zone Snapshot</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Highest performing zone metrics</p>

                <div className="space-y-6">
                    {[
                        { label: 'Efficiency Score', val: '94.2%', color: 'text-green-600 dark:text-green-400' },
                        { label: 'Budget Utilization', val: '88.5%', color: 'text-blue-600 dark:text-blue-400' },
                        { label: 'Risk Index', val: 'Low (12)', color: 'text-indigo-600 dark:text-indigo-400' }
                    ].map(m => (
                        <div key={m.label}>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className="text-gray-600 dark:text-gray-300">{m.label}</span>
                                <span className={`font-bold ${m.color}`}>{m.val}</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-current opacity-70 rounded-full w-3/4" style={{ color: 'inherit' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full mt-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                Full Analysis <ArrowRight className="h-3 w-3" />
            </button>
        </div>
    );
}
