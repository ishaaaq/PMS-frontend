import React, { useState, useEffect } from 'react';
import { Briefcase, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { SectionsService } from '../../services/sections.service';
import { ProjectsService } from '../../services/projects.service';

interface AssignContractorModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
    sectionId?: string;
}

export default function AssignContractorModal({ isOpen, onClose, projectId, sectionId }: AssignContractorModalProps) {
    const [selectedContractor, setSelectedContractor] = useState('');
    const [contractors, setContractors] = useState<{ id: string; name: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loadingContractors, setLoadingContractors] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSelectedContractor('');
            setError(null);
            setSuccess(false);
            return;
        }

        const fetchContractors = async () => {
            if (!projectId) return;

            setLoadingContractors(true);
            try {
                const data = await ProjectsService.getProjectContractors(projectId);
                setContractors(data);
            } catch (err) {
                console.error("Error fetching contractors:", err);
                setError("Failed to load contractors for this project.");
            } finally {
                setLoadingContractors(false);
            }
        };

        fetchContractors();
    }, [isOpen, projectId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sectionId || !selectedContractor) {
            setError('Please select a contractor to assign.');
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            await SectionsService.assignContractor(sectionId, selectedContractor);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign contractor. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assign Contractor</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Select an existing project contractor for this section</p>
                    </div>
                </div>

                {success ? (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Assigned Successfully!</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">The contractor has been added to the section.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Contractor</label>

                            {loadingContractors ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                    Loading contractors...
                                </div>
                            ) : contractors.length === 0 ? (
                                <div className="flex items-center gap-2 text-sm text-orange-600 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    No contractors available in this project.
                                </div>
                            ) : (
                                <select
                                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    value={selectedContractor}
                                    onChange={(e) => { setSelectedContractor(e.target.value); setError(null); }}
                                    required
                                >
                                    <option value="" disabled>Choose a contractor...</option>
                                    {contractors.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            )}
                            {error && (
                                <p className="mt-2 text-xs text-red-500 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" /> {error}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !selectedContractor || loadingContractors || contractors.length === 0}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
