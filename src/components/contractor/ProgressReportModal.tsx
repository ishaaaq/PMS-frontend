import { useState, useCallback, useRef } from 'react';
import {
    X, Upload, Camera, FileText, CheckCircle, AlertTriangle,
    Plus, Trash2, Package, ImageIcon
} from 'lucide-react';
import type { Milestone } from '../../services/contractor';

interface MaterialEntry {
    id: string;
    name: string;
    quantity: string;
    unit: string;
}

interface ProgressReportModalProps {
    milestone: Milestone;
    projectTitle: string;
    isQueried?: boolean;
    onClose: () => void;
    onSubmit: (data: ProgressReportData) => void;
}

export interface ProgressReportData {
    milestoneId: string;
    progress: number;
    comments: string;
    files: File[];
    materials: MaterialEntry[];
}

export default function ProgressReportModal({
    milestone,
    projectTitle,
    isQueried = false,
    onClose,
    onSubmit
}: ProgressReportModalProps) {
    const [progress, setProgress] = useState(milestone.progress || 0);
    const [comments, setComments] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [materials, setMaterials] = useState<MaterialEntry[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const accentColor = isQueried ? 'red' : 'indigo';

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Material handlers
    const addMaterial = () => {
        setMaterials(prev => [...prev, {
            id: crypto.randomUUID(),
            name: '',
            quantity: '',
            unit: 'bags'
        }]);
    };

    const updateMaterial = (id: string, field: keyof MaterialEntry, value: string) => {
        setMaterials(prev => prev.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    const removeMaterial = (id: string) => {
        setMaterials(prev => prev.filter(m => m.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        onSubmit({
            milestoneId: milestone.id,
            progress,
            comments,
            files,
            materials
        });

        setIsSubmitting(false);
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
        return <FileText className="h-4 w-4" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className={`px-6 py-4 border-b ${isQueried ? 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-900/50' : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-900/50'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isQueried ? 'bg-red-100 dark:bg-red-900/50' : 'bg-indigo-100 dark:bg-indigo-900/50'}`}>
                                    {isQueried ? (
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    ) : (
                                        <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {isQueried ? 'Fix & Resubmit Report' : 'Update Progress'}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{milestone.title}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <span className="font-medium">Project:</span> {projectTitle}
                        </p>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
                        <div className="p-6 space-y-6">
                            {/* Query Alert */}
                            {isQueried && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800 dark:text-red-300">Consultant Query</p>
                                        <p className="text-xs text-red-600 dark:text-red-400/80 mt-1">
                                            This milestone was flagged by the consultant. Please provide additional evidence and update your progress report.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Progress Slider */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Completion Progress
                                </label>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
                                        <span className={`text-2xl font-bold ${progress === 100 ? 'text-green-600 dark:text-green-400' : `text-${accentColor}-600 dark:text-${accentColor}-400`}`}>
                                            {progress}%
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={progress}
                                        onChange={(e) => setProgress(Number(e.target.value))}
                                        className={`w-full h-3 rounded-full appearance-none cursor-pointer
                                            [&::-webkit-slider-thumb]:appearance-none
                                            [&::-webkit-slider-thumb]:h-6
                                            [&::-webkit-slider-thumb]:w-6
                                            [&::-webkit-slider-thumb]:rounded-full
                                            [&::-webkit-slider-thumb]:bg-white
                                            [&::-webkit-slider-thumb]:border-4
                                            [&::-webkit-slider-thumb]:border-${accentColor}-500
                                            [&::-webkit-slider-thumb]:shadow-lg
                                            [&::-webkit-slider-thumb]:cursor-pointer
                                            bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 dark:from-gray-600 dark:via-gray-600 dark:to-gray-600`}
                                        style={{
                                            background: `linear-gradient(to right, ${isQueried ? '#ef4444' : '#6366f1'} 0%, ${isQueried ? '#ef4444' : '#6366f1'} ${progress}%, ${isQueried ? '#fca5a5' : '#a5b4fc'} ${progress}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    {progress === 100 && (
                                        <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="font-medium">Milestone complete! Ready for approval.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Evidence Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Evidence Upload
                                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(Photos, Documents)</span>
                                </label>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                                        ${isDragging
                                            ? `border-${accentColor}-400 bg-${accentColor}-50 dark:bg-${accentColor}-900/20`
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className={`p-3 rounded-full mb-3 ${isDragging ? `bg-${accentColor}-100 dark:bg-${accentColor}-900/50` : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            <Camera className={`h-6 w-6 ${isDragging ? `text-${accentColor}-600 dark:text-${accentColor}-400` : 'text-gray-400 dark:text-gray-500'}`} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            PNG, JPG, PDF up to 10MB each
                                        </p>
                                    </div>
                                </div>

                                {/* File List */}
                                {files.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-2.5 group border border-gray-100 dark:border-gray-700"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                                                        {getFileIcon(file)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Material Usage */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Package className="h-4 w-4 text-gray-400" />
                                        Material Usage Log
                                        <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addMaterial}
                                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                                            ${isQueried
                                                ? 'text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                                                : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30'
                                            }`}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Material
                                    </button>
                                </div>

                                {materials.length === 0 ? (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No materials logged yet. Click "Add Material" to track usage.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {materials.map((material) => (
                                            <div key={material.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                                                <input
                                                    type="text"
                                                    placeholder="Material name"
                                                    value={material.name}
                                                    onChange={(e) => updateMaterial(material.id, 'name', e.target.value)}
                                                    className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={material.quantity}
                                                    onChange={(e) => updateMaterial(material.id, 'quantity', e.target.value)}
                                                    className="w-20 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                                <select
                                                    value={material.unit}
                                                    onChange={(e) => updateMaterial(material.id, 'unit', e.target.value)}
                                                    className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                >
                                                    <option value="bags">Bags</option>
                                                    <option value="tons">Tons</option>
                                                    <option value="pieces">Pieces</option>
                                                    <option value="meters">Meters</option>
                                                    <option value="liters">Liters</option>
                                                    <option value="units">Units</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMaterial(material.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Comments */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Work Description
                                </label>
                                <textarea
                                    rows={4}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder={isQueried
                                        ? "Describe changes made to address the consultant's feedback..."
                                        : "Describe the work completed during this reporting period..."
                                    }
                                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {files.length > 0 && (
                                    <span className="inline-flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                        {files.length} file(s) attached
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all shadow-lg
                                        ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                                        ${isQueried
                                            ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Submitting...
                                        </span>
                                    ) : isQueried ? (
                                        'Resubmit Report'
                                    ) : (
                                        'Submit Report'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
