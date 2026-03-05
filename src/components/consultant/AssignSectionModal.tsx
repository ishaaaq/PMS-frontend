import React, { useState, useEffect } from 'react';
import { Briefcase, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { SectionsService } from '../../services/sections.service';
import { supabase } from '@/lib/supabase';

interface AssignSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    projectId?: string;
    contractorName?: string;
    contractorId?: string;
}

export default function AssignSectionModal({ isOpen, onClose, onSuccess, projectId, contractorName, contractorId }: AssignSectionModalProps) {
    const [selectedSection, setSelectedSection] = useState('');
    const [sections, setSections] = useState<{ id: string; name: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSelectedSection('');
            setError(null);
            setSuccess(false);
            return;
        }

        const fetchSections = async () => {
            if (!projectId || projectId === 'All Projects') return;

            setLoadingSections(true);
            try {
                // Fetch sections for this project that aren't already assigned to a contractor
                const { data, error: pbError } = await supabase
                    .from('sections')
                    .select('id, name')
                    .eq('project_id', projectId);

                if (pbError) throw pbError;
                if (data) setSections(data);
            } catch (err) {
                console.error("Error fetching sections:", err);
                setError("Failed to load available sections.");
            } finally {
                setLoadingSections(false);
            }
        };

        fetchSections();
    }, [isOpen, projectId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectId || projectId === 'All Projects') {
            setError('No project selected. Please select a project first.');
            return;
        }

        if (!selectedSection) {
            setError('Please select a section to assign.');
            return;
        }

        if (!contractorId) {
            setError('Contractor information is missing.');
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            await SectionsService.assignContractor(selectedSection, contractorId);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign section. Please try again.');
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
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assign Section</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Assign {contractorName || 'this contractor'} to a section</p>
                    </div>
                </div>

                {success ? (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Assigned Successfully!</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">The section has been assigned to the contractor.</p>
                        </div>
                    </div>
                ) : !projectId || projectId === 'All Projects' ? (
                    <div className="py-6 text-center">
                        <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Please select a specific project from the dropdown filter before assigning sections.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-6 w-full py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            Got it
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Section</label>

                            {loadingSections ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                    Loading sections...
                                </div>
                            ) : sections.length === 0 ? (
                                <div className="flex items-center gap-2 text-sm text-orange-600 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    No sections available in this project.
                                </div>
                            ) : (
                                <select
                                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    value={selectedSection}
                                    onChange={(e) => { setSelectedSection(e.target.value); setError(null); }}
                                    required
                                >
                                    <option value="" disabled>Choose a section...</option>
                                    {sections.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
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
                                disabled={submitting || !selectedSection || loadingSections || sections.length === 0}
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
