
import { DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Project } from '../../services/projects';

interface AnalyticsTabProps {
    project: Project;
}

export default function AnalyticsTab({ project }: AnalyticsTabProps) {
    // Calculate metrics
    const budgetUtilization = project.approvedBudget
        ? ((project.amountSpent || 0) / project.approvedBudget * 100).toFixed(1)
        : '0';

    const remainingBudget = (project.approvedBudget || 0) - (project.amountSpent || 0);
    const isOverBudget = remainingBudget < 0;

    // Mock data for demonstration
    const kpis = [
        {
            name: 'Budget Utilization',
            value: `${budgetUtilization}%`,
            icon: DollarSign,
            color: parseFloat(budgetUtilization) > 90 ? 'text-red-600' : 'text-green-600',
            bgColor: parseFloat(budgetUtilization) > 90 ? 'bg-red-100' : 'bg-green-100'
        },
        {
            name: 'Progress',
            value: `${project.progress}%`,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            name: 'Days Remaining',
            value: calculateDaysRemaining(project.endDate),
            icon: Clock,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            name: 'Milestones Completed',
            value: '3/5',
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        }
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Performance Indicators</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map((kpi) => (
                        <div key={kpi.name} className="bg-white rounded-lg shadow p-5">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 rounded-md p-3 ${kpi.bgColor}`}>
                                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-500">{kpi.name}</p>
                                    <p className={`text-2xl font-semibold ${kpi.color}`}>{kpi.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Breakdown</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Approved Budget</span>
                        <span className="text-lg font-semibold text-gray-900">₦{project.approvedBudget?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Amount Spent</span>
                        <span className="text-lg font-semibold text-gray-900">₦{project.amountSpent?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Remaining</span>
                        <span className={`text-lg font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            ₦{Math.abs(remainingBudget).toLocaleString()}
                            {isOverBudget && ' (Over Budget)'}
                        </span>
                    </div>

                    {/* Visual Budget Bar */}
                    <div className="pt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Budget Usage</span>
                            <span>{budgetUtilization}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full ${parseFloat(budgetUtilization) > 100 ? 'bg-red-600' :
                                    parseFloat(budgetUtilization) > 90 ? 'bg-yellow-500' :
                                        'bg-green-600'
                                    }`}
                                style={{ width: `${Math.min(parseFloat(budgetUtilization), 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Timeline</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Start Date</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{project.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Current Progress</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-sm text-gray-700">End Date</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{project.endDate}</span>
                    </div>
                </div>
            </div>

            {/* Risk Indicators */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Indicators</h3>
                <div className="space-y-3">
                    {isOverBudget && (
                        <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-900">Budget Overrun</p>
                                <p className="text-sm text-red-700">Project has exceeded approved budget by ₦{Math.abs(remainingBudget).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                    {parseFloat(budgetUtilization) > 90 && !isOverBudget && (
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">High Budget Utilization</p>
                                <p className="text-sm text-yellow-700">Budget usage is at {budgetUtilization}%. Monitor spending closely.</p>
                            </div>
                        </div>
                    )}
                    {project.progress < 50 && getDaysRemainingNumber(project.endDate) < 30 && getDaysRemainingNumber(project.endDate) >= 0 && (
                        <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                            <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-orange-900">Schedule Risk</p>
                                <p className="text-sm text-orange-700">Project progress ({project.progress}%) may not align with timeline.</p>
                            </div>
                        </div>
                    )}
                    {!isOverBudget && parseFloat(budgetUtilization) < 90 && project.progress >= 50 && (
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-green-900">On Track</p>
                                <p className="text-sm text-green-700">Project is progressing well within budget and timeline.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Milestone Completion Rate */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Milestone Completion Rate</h3>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">3 of 5 milestones completed</span>
                    <span className="text-sm font-semibold text-gray-900">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                    <div className="h-12 bg-green-500 rounded flex items-center justify-center text-white text-xs font-medium">M1</div>
                    <div className="h-12 bg-green-500 rounded flex items-center justify-center text-white text-xs font-medium">M2</div>
                    <div className="h-12 bg-green-500 rounded flex items-center justify-center text-white text-xs font-medium">M3</div>
                    <div className="h-12 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-medium">M4</div>
                    <div className="h-12 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs font-medium">M5</div>
                </div>
            </div>
        </div>
    );
}

function calculateDaysRemaining(endDate: string): string {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `${diffDays} days`;
}

function getDaysRemainingNumber(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
