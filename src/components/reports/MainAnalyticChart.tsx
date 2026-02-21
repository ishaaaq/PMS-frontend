import { useState, useEffect } from 'react';
import { BarChart3, PieChart, FileText } from 'lucide-react';
import { DashboardService } from '../../services/dashboard.service';

interface MainAnalyticChartProps {
    activeTab: 'overview' | 'financial' | 'consultants';
    statsData: number[]; // Used for overview fallback
}

export default function MainAnalyticChart({ activeTab, statsData }: MainAnalyticChartProps) {
    const [financialData, setFinancialData] = useState<number[]>([]);
    const [consultants, setConsultants] = useState<{ name: string; rating: number }[]>([]);

    useEffect(() => {
        if (activeTab === 'financial') {
            DashboardService.getPerformanceSnapshots().then(data => {
                if (data.length > 0) {
                    setFinancialData(data.slice(-8).map(d => Math.max(d.actualProgress, 10)));
                }
            });
        }
        if (activeTab === 'consultants') {
            DashboardService.getTopContractors().then(data => {
                if (data.length > 0) {
                    setConsultants(data.map(d => ({ name: d.name, rating: d.rating * 20 }))); // Assume rating out of 5, convert to %
                } else {
                    setConsultants([]);
                }
            });
        }
    }, [activeTab]);

    return (
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-gray-200 dark:border-gray-700 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {activeTab === 'overview' && <><BarChart3 className="h-5 w-5 text-indigo-500" /> Project Completion by Zone</>}
                    {activeTab === 'financial' && <><PieChart className="h-5 w-5 text-green-500" /> Disbursement Velocity Trends</>}
                    {activeTab === 'consultants' && <><FileText className="h-5 w-5 text-blue-500" /> Consultant Efficiency Ratings</>}
                </h3>
                <div className="flex gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                    {activeTab === 'overview' && (
                        <>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Active</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" /> Planned</span>
                        </>
                    )}
                    {activeTab === 'financial' && (
                        <>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Disbursed</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Utilization</span>
                        </>
                    )}
                </div>
            </div>

            {/* OVERVIEW CHART - VERTICAL BARS */}
            {activeTab === 'overview' && (
                <div className="flex-1 flex items-end justify-between gap-4 px-2 relative border-b border-gray-100 dark:border-gray-700">
                    {statsData.length === 0 || statsData.every(v => v === 0) ? (
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-400 dark:text-gray-500 pb-8">
                            No project completion data available
                        </div>
                    ) : (
                        statsData.map((h, i) => (
                            <div key={i} className="group relative flex-1 h-full flex items-end">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {h}% Completion
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-t-lg relative h-[250px] overflow-hidden">
                                    <div
                                        className="absolute bottom-0 w-full bg-indigo-500 group-hover:bg-indigo-400 transition-all duration-700 ease-out"
                                        style={{ height: `${h}%` }}
                                    />
                                    {/* Striped pattern overlay */}
                                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,#000_25%,#000_50%,transparent_50%,transparent_75%,#000_75%,#000_100%)] bg-[length:10px_10px]" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* FINANCIAL CHART - CURVED LINE / AREA MOCKUP */}
            {activeTab === 'financial' && (
                <div className="flex-1 relative flex items-end h-[250px] w-full px-4">
                    {financialData.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-400 dark:text-gray-500 pb-8 border-b border-gray-200 dark:border-gray-700 w-full ml-8">
                            No financial performance trends available
                        </div>
                    ) : (
                        <>
                            {/* Simulated Axis Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 font-mono pointer-events-none pb-6">
                                <span>₦500M</span>
                                <span>₦250M</span>
                                <span>₦0</span>
                            </div>
                            <div className="ml-8 w-full h-full relative border-l border-b border-gray-200 dark:border-gray-700">
                                {/* Simulated Line Path via bars for now to remain pure CSS/Tailwind compatible easily without SVG complexities */}
                                <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-between px-2 pt-4">
                                    {financialData.map((val, i) => (
                                        <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group">
                                            <div className="w-2 h-2 rounded-full bg-green-500 z-10 mb-[-4px] ring-4 ring-white dark:ring-gray-800 transition-all group-hover:scale-150" />
                                            <div
                                                className="w-full bg-gradient-to-t from-green-500/20 to-transparent transition-all duration-500"
                                                style={{ height: `${val}%` }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {/* Connected Line Simulation (simple border-top on adjacent divs) could be complex, sticking to Area-like visual */}
                                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none">
                                    <path
                                        d="M0 250 L 50 150 L 100 100 L 150 140 L 200 60 L 250 120 L 300 40 L 350 80 L 400 50 L 450 10"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="3"
                                        className="drop-shadow-lg opacity-20"
                                    />
                                </svg>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* CONSULTANT CHART - HORIZONTAL BARS */}
            {activeTab === 'consultants' && (
                <div className="flex-1 flex flex-col justify-center space-y-5 px-2">
                    {consultants.map((c, i) => (
                        <div key={c.name} className="relative group">
                            <div className="flex justify-between text-xs font-bold mb-1 items-end">
                                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-500">#{i + 1}</span>
                                    {c.name}
                                </span>
                                <span className="text-gray-500">{Math.round(c.rating)}% Range</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${c.rating > 90 ? 'bg-emerald-500' : c.rating > 70 ? 'bg-blue-500' : 'bg-orange-500'
                                        }`}
                                    style={{ width: `${c.rating}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {consultants.length === 0 && <p className="text-center text-gray-500 text-sm py-8">No consultants data available</p>}
                </div>
            )}

            <div className="flex justify-between mt-6 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100 dark:border-gray-800 pt-4">
                {activeTab === 'overview' && ['North-W', 'North-E', 'North-C', 'South-W', 'South-S', 'South-E'].map(z => <span key={z}>{z}</span>)}
                {activeTab === 'financial' && ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map(m => <span key={m}>{m}</span>)}
                {activeTab === 'consultants' && <span>Performance Index Ranking</span>}
            </div>
        </div>
    );
}
