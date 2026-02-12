import { FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import AuditLogModal from '../components/budget/AuditLogModal';
import DisbursementModal from '../components/budget/DisbursementModal';
import BudgetStats from '../components/budget/BudgetStats';
import ExpenditureChart from '../components/budget/ExpenditureChart';
import RecentDisbursements from '../components/budget/RecentDisbursements';

export default function BudgetPage() {
    const [showDisbursementModal, setShowDisbursementModal] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);

    return (
        <div className="space-y-8 relative">
            <AuditLogModal
                isOpen={showAuditModal}
                onClose={() => setShowAuditModal(false)}
            />

            <DisbursementModal
                isOpen={showDisbursementModal}
                onClose={() => setShowDisbursementModal(false)}
            />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Oversight</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Monitor fund allocation, disbursement, and utilization</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAuditModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Audit Log
                    </button>
                    {/* <button
                        onClick={() => setShowDisbursementModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-lg shadow-green-600/20 text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all active:scale-95"
                    >
                        Initiate Disbursement
                    </button> */}
                </div>
            </div>

            {/* Financial Stats Cards */}
            <BudgetStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expenditure Chart */}
                <ExpenditureChart />

                {/* Recent Disbursements */}
                <RecentDisbursements />
            </div>
        </div>
    );
}
