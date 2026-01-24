import { Wallet } from 'lucide-react';
import type { BudgetSummary } from '../../services/contractor';

interface BudgetCardProps {
    budget: BudgetSummary;
    isLoading?: boolean;
}

export default function BudgetCard({ budget, isLoading = false }: BudgetCardProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
        );
    }

    const percentDisbursed = Math.min(Math.round((budget.amountDisbursed / budget.totalAllocated) * 100), 100);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-ptdf-secondary/30 p-6 relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Approved Budget Allocation</h3>
                    <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
                        {formatMoney(budget.totalAllocated)}
                    </p>
                </div>
                <div className="p-3 bg-ptdf-secondary/10 rounded-full">
                    <Wallet className="h-6 w-6 text-ptdf-secondary" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-ptdf-primary">Disbursed: {formatMoney(budget.amountDisbursed)}</span>
                    <span className="text-gray-500">{percentDisbursed}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-ptdf-primary h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentDisbursed}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Last disbursement: {budget.lastDisbursementDate}</span>
                    <span>Pending: {formatMoney(budget.amountPending)}</span>
                </div>
            </div>
        </div>
    );
}
