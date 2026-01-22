
import { useState } from 'react';
import { CheckSquare, X } from 'lucide-react';
import type { Milestone } from '../../services/milestones';

interface VerifyMilestoneModalProps {
    milestone: Milestone;
    onClose: () => void;
    onVerify: (data: { milestoneId: string; approved: boolean; comments: string }) => void;
}

export default function VerifyMilestoneModal({ milestone, onClose, onVerify }: VerifyMilestoneModalProps) {
    const [comments, setComments] = useState('');
    const [approved, setApproved] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify({
            milestoneId: milestone.id,
            approved,
            comments
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={onClose}>
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                            <CheckSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Verify Milestone
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-4">
                                    Verifying work for: <span className="font-semibold">{milestone.title}</span>
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Milestone Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Progress:</span>
                                                <span className="font-medium">{milestone.progress}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="font-medium">₦{milestone.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Due Date:</span>
                                                <span className="font-medium">{milestone.dueDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Verification Decision</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="verification"
                                                    checked={approved}
                                                    onChange={() => setApproved(true)}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Approve - Work meets requirements</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="verification"
                                                    checked={!approved}
                                                    onChange={() => setApproved(false)}
                                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Reject - Work needs revision</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Verification Comments</label>
                                        <textarea
                                            rows={3}
                                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            placeholder="Add your verification notes..."
                                            required
                                        />
                                    </div>

                                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="submit"
                                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${approved
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : 'bg-red-600 hover:bg-red-700'
                                                }`}
                                        >
                                            {approved ? 'Approve Milestone' : 'Request Revision'}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
