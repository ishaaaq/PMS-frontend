import { useState, useEffect } from 'react';
import {
    X,
    CheckCircle,
    MessageSquare,
    FileText,
    Download,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    AlertTriangle
} from 'lucide-react';
import { SubmissionsService } from '../../services/submissions.service';
import { StorageService } from '../../services/storage.service';


interface MaterialUsage {
    item: string;
    quantity: string;
    expected: string;
}

interface DocumentFile {
    name: string;
    size: string;
    url?: string;
}

interface Milestone {
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    progress?: number;
}

interface VerifyMilestoneModalProps {
    milestone?: Milestone;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submission?: any;
    isOpen?: boolean;
    onClose: () => void;
    onVerify?: (data: { status: 'approved' | 'queried'; feedback: string; milestoneId?: string; approved?: boolean }) => void;
    readOnly?: boolean; // Hide action buttons for admin view
}

export default function VerifyMilestoneModal({ milestone, submission, isOpen, onClose, onVerify, readOnly = false }: VerifyMilestoneModalProps) {
    const [status, setStatus] = useState<'pending' | 'approved' | 'queried'>('pending');
    const [feedback, setFeedback] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);



    // State for data
    const [images, setImages] = useState<string[]>([]);
    const [documents, setDocuments] = useState<DocumentFile[]>([]);
    const [materialUsage, setMaterialUsage] = useState<MaterialUsage[]>([]);

    const submissionId = submission?.id || milestone?.id; // Fallback logic

    // Fetch Evidence & Materials
    useEffect(() => {
        if (!isOpen || !submissionId) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                // Fetch materials
                const materials = await SubmissionsService.getSubmissionMaterials(submissionId);
                if (materials) {
                    setMaterialUsage(materials.map(m => ({
                        item: m.material_name,
                        quantity: `${m.quantity} ${m.unit}`,
                        expected: 'N/A' // Not currently in DB
                    })));
                }

                // Fetch evidence
                const evidence = await SubmissionsService.getSubmissionEvidence(submissionId);
                const imgs: string[] = [];
                const docs: DocumentFile[] = [];

                if (evidence) {
                    for (const file of evidence) {
                        try {
                            const url = await StorageService.getSignedUrl(file.file_path);
                            if (file.file_type && file.file_type.startsWith('image/')) {
                                imgs.push(url);
                            } else {
                                docs.push({
                                    name: file.file_path.split('/').pop() || 'Document',
                                    size: formatSize(file.file_size || 0),
                                    url: url
                                });
                            }
                        } catch (e) {
                            console.error('Failed to sign URL for', file.file_path, e);
                        }
                    }
                }
                setImages(imgs);
                setDocuments(docs);
            } catch (err) {
                console.error('Failed to load submission data', err);
            } finally {
                setIsLoading(false);
            }
        };

        // If pre-populated data is provided directly in submission, use it (for preview).
        // Check for arrays with actual contents — empty arrays should NOT skip the real fetch.
        const hasImages = Array.isArray(submission?.images) && submission.images.length > 0;
        const hasDocs = Array.isArray(submission?.documents) && submission.documents.length > 0;
        if (hasImages || hasDocs) {
            setImages(submission.images || []);
            setDocuments(submission.documents || []);
            setMaterialUsage(submission.materialUsage || []);
            setIsLoading(false);
        } else {
            loadData();
        }
    }, [isOpen, submissionId, submission]);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Derived data for display
    const displayData = {
        milestone: submission?.milestone || milestone?.title || 'Unknown Milestone',
        description: submission?.description || submission?.work_description || submission?.workDescription || 'No description provided.',
        contractor: submission?.contractor || 'Unknown Contractor',
        date: submission?.date || submission?.submitted || new Date(submission?.submitted_at || submission?.submittedRaw || Date.now()).toLocaleDateString(),
        location: submission?.location || 'Unknown Location'
    };

    const handleApprove = async () => {
        if (!submissionId) return;
        setIsLoading(true);
        setActionError(null);
        try {
            await SubmissionsService.approveSubmission(submissionId);
            setStatus('approved');
            onVerify?.({ status: 'approved', feedback: '', milestoneId: milestone?.id, approved: true });
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to approve. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuery = async () => {
        if (!submissionId || !feedback.trim()) return;
        setIsLoading(true);
        setActionError(null);
        try {
            await SubmissionsService.querySubmission(submissionId, feedback);
            setStatus('queried');
            onVerify?.({ status: 'queried', feedback, milestoneId: milestone?.id });
            onClose();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to send query. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render nothing if not open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full sm:max-w-4xl mx-4 sm:mx-0">

                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                    <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                        Verify Submission
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {displayData.milestone} • {displayData.contractor}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row max-h-[80vh] md:h-[70vh]">

                        {/* Left Side: Evidence Viewer */}
                        <div className="w-full md:w-2/3 bg-gray-900 flex flex-col relative h-64 md:h-auto">
                            {/* Main Image */}
                            <div className="flex-1 flex items-center justify-center overflow-hidden relative group">
                                <img
                                    src={images[activeImage]}
                                    alt="Evidence"
                                    className="max-h-full max-w-full object-contain"
                                />

                                {/* Navigation Arrows */}
                                <button
                                    onClick={() => setActiveImage(prev => Math.max(0, prev - 1))}
                                    disabled={activeImage === 0}
                                    className="absolute left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 transition-opacity"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => setActiveImage(prev => Math.min(images.length - 1, prev + 1))}
                                    disabled={activeImage === images.length - 1}
                                    className="absolute right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 transition-opacity"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Thumbnails */}
                            <div className="h-20 bg-black/80 flex items-center gap-2 px-4 overflow-x-auto">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative h-16 w-24 flex-shrink-0 rounded border-2 overflow-hidden ${activeImage === idx ? 'border-indigo-500' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Details & Actions */}
                        <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-gray-800 md:border-l border-t md:border-t-0 border-gray-200 dark:border-gray-700 max-h-96 md:max-h-none">
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">

                                {/* Meta Data */}
                                <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                        <span>Submitted: {displayData.date}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                        <span>{displayData.location}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Progress Description</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {displayData.description}
                                    </p>
                                </div>

                                {/* Material Usage */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Material Usage</h4>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                                        {materialUsage.map((item: MaterialUsage, idx: number) => (
                                            <div key={idx} className="flex justify-between text-xs">
                                                <span className="text-gray-600 dark:text-gray-400">{item.item}</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-200">{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Documents */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Attached Documents</h4>
                                    <div className="space-y-2">
                                        {documents.map((doc: DocumentFile, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <div className="flex items-center overflow-hidden">
                                                    <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{doc.name}</span>
                                                </div>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Feedback Input (Only if querying) */}
                                {status === 'queried' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                                            Query Reason / Instructions
                                        </label>
                                        <textarea
                                            rows={4}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                            placeholder="Explain what needs to be corrected..."
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                        ></textarea>
                                    </div>
                                )}
                            </div>

                            {/* Sticky Footer Actions - Hidden in read-only mode */}
                            {!readOnly && (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    {actionError && (
                                        <div className="mb-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                            {actionError}
                                        </div>
                                    )}
                                    {status === 'approved' ? (
                                        <div className="flex items-center justify-center text-green-600 dark:text-green-400 font-bold p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Verified & Approved
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {status !== 'queried' ? (
                                                <>
                                                    <button
                                                        onClick={() => setStatus('queried')}
                                                        disabled={isLoading}
                                                        className="flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                                    >
                                                        <MessageSquare className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Query
                                                    </button>
                                                    <button
                                                        onClick={handleApprove}
                                                        disabled={isLoading}
                                                        className="flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        {isLoading ? 'Approving...' : 'Approve'}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setStatus('pending')}
                                                        disabled={isLoading}
                                                        className="flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleQuery}
                                                        disabled={!feedback || isLoading}
                                                        className="flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                                                    >
                                                        {isLoading ? 'Sending...' : 'Send Query'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
