import { generateRandomSeries } from '../../utils/mockData';
import { useState } from 'react';

export default function ExpenditureChart() {
    const [period, setPeriod] = useState('Last 6 Months');
    const [chartData, setChartData] = useState([50, 70, 45, 90, 65, 80]);

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPeriod(e.target.value);
        setChartData(generateRandomSeries(6, 40, 100));
    };

    return (
        <div className="lg:col-span-2 glass-card rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Disbursement vs Expenditure</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Comparative analysis over time</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={period}
                        onChange={handlePeriodChange}
                        className="text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:ring-ptdf-primary focus:border-ptdf-primary cursor-pointer"
                    >
                        <option>Last 6 Months</option>
                        <option>Year to Date</option>
                        <option>All Time</option>
                    </select>
                </div>
            </div>

            <div className="h-64 flex items-end gap-4 sm:gap-8 px-4 border-b border-gray-100 dark:border-gray-700 pb-1">
                {chartData.map((h, i) => (
                    <div key={i} className="flex-1 flex gap-2 sm:gap-4 items-end group relative transition-all duration-500 h-full">
                        <div className="w-full bg-green-500/10 dark:bg-green-500/20 rounded-t-lg transition-all duration-300 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30" style={{ height: `${h}%` }}></div>
                        <div className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-lg transition-all duration-300 relative" style={{ height: `${h * 0.7}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                                ₦{(h * 15).toLocaleString()}M
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-4">
                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
        </div>
    );
}
