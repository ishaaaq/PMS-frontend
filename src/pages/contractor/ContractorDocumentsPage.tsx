import { useEffect, useState } from 'react';
import { getContractorDocuments } from '../../services/contractor';
import type { ProjectDocument, DocumentType } from '../../services/contractor';
import {
    Search, FileText, FileSpreadsheet, FileImage, File,
    Download, Eye, Calendar, User, FolderOpen, Filter,
    ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

type FilterType = 'ALL' | DocumentType;

export default function ContractorDocumentsPage() {
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('ALL');
    const [filterProject, setFilterProject] = useState<string>('ALL');
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchDocuments = async () => {
            setIsLoading(true);
            try {
                const data = await getContractorDocuments();
                setDocuments(data);
                // Auto-expand all projects initially
                const projectIds = [...new Set(data.map(d => d.projectId))];
                setExpandedProjects(new Set(projectIds));
            } catch (error) {
                console.error('Failed to load documents', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
            case 'doc': return <FileText className="h-5 w-5 text-blue-500" />;
            case 'xls': return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
            case 'dwg': return <File className="h-5 w-5 text-purple-500" />;
            case 'jpg':
            case 'png': return <FileImage className="h-5 w-5 text-orange-500" />;
            default: return <File className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTypeColor = (type: DocumentType) => {
        switch (type) {
            case 'CONTRACT': return 'bg-blue-100 text-blue-700';
            case 'DRAWING': return 'bg-purple-100 text-purple-700';
            case 'SPECIFICATION': return 'bg-indigo-100 text-indigo-700';
            case 'REPORT': return 'bg-teal-100 text-teal-700';
            case 'INVOICE': return 'bg-green-100 text-green-700';
            case 'CERTIFICATE': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Get unique projects for filter
    const projects = [...new Set(documents.map(d => ({ id: d.projectId, title: d.projectTitle })))].filter((v, i, a) =>
        a.findIndex(t => t.id === v.id) === i
    );

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'ALL' || doc.type === filterType;
        const matchesProject = filterProject === 'ALL' || doc.projectId === filterProject;
        return matchesSearch && matchesType && matchesProject;
    });

    // Group by project
    const groupedByProject = filteredDocuments.reduce((acc, doc) => {
        if (!acc[doc.projectId]) {
            acc[doc.projectId] = { title: doc.projectTitle, documents: [] };
        }
        acc[doc.projectId].documents.push(doc);
        return acc;
    }, {} as Record<string, { title: string; documents: ProjectDocument[] }>);

    const toggleProject = (projectId: string) => {
        setExpandedProjects(prev => {
            const next = new Set(prev);
            if (next.has(projectId)) {
                next.delete(projectId);
            } else {
                next.add(projectId);
            }
            return next;
        });
    };

    const handleDownload = (doc: ProjectDocument) => {
        // In real app, this would trigger file download
        alert(`Downloading: ${doc.name}\nSize: ${formatFileSize(doc.size)}`);
    };

    const handlePreview = (doc: ProjectDocument) => {
        // In real app, this would open a preview modal/page
        alert(`Opening preview for: ${doc.name}`);
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-14 bg-gray-200 rounded-xl mb-4"></div>
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                <p className="text-sm text-gray-500 mt-1">Access contracts, drawings, specifications, and project files</p>
            </header>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as FilterType)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        >
                            <option value="ALL">All Types</option>
                            <option value="CONTRACT">Contracts</option>
                            <option value="DRAWING">Drawings</option>
                            <option value="SPECIFICATION">Specifications</option>
                            <option value="REPORT">Reports</option>
                            <option value="INVOICE">Invoices</option>
                            <option value="CERTIFICATE">Certificates</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Project Filter */}
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    >
                        <option value="ALL">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                    <p className="text-xs text-gray-500 uppercase font-medium">Total Files</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{documents.filter(d => d.type === 'CONTRACT').length}</p>
                    <p className="text-xs text-gray-500 uppercase font-medium">Contracts</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{documents.filter(d => d.type === 'DRAWING').length}</p>
                    <p className="text-xs text-gray-500 uppercase font-medium">Drawings</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{documents.filter(d => d.type === 'CERTIFICATE').length}</p>
                    <p className="text-xs text-gray-500 uppercase font-medium">Certificates</p>
                </div>
            </div>

            {/* Document List by Project */}
            <div className="space-y-4">
                {Object.entries(groupedByProject).length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                ) : (
                    Object.entries(groupedByProject).map(([projectId, { title, documents: docs }]) => {
                        const isExpanded = expandedProjects.has(projectId);
                        return (
                            <div key={projectId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Project Header */}
                                <button
                                    onClick={() => toggleProject(projectId)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <FolderOpen className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-gray-900">{title}</h3>
                                            <p className="text-xs text-gray-500">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>

                                {/* Documents List */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100">
                                        {docs.map((doc, idx) => (
                                            <div
                                                key={doc.id}
                                                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${idx !== docs.length - 1 ? 'border-b border-gray-100' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    {/* File Icon */}
                                                    <div className="p-2.5 bg-gray-100 rounded-lg flex-shrink-0">
                                                        {getFileIcon(doc.fileType)}
                                                    </div>

                                                    {/* File Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getTypeColor(doc.type)}`}>
                                                                {doc.type}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(doc.uploadedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {doc.uploadedBy}
                                                            </span>
                                                            <span className="uppercase font-mono">{doc.fileType}</span>
                                                            <span>{formatFileSize(doc.size)}</span>
                                                            <span className="text-gray-400">v{doc.version}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 ml-4">
                                                    <button
                                                        onClick={() => handlePreview(doc)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Preview"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(doc)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Help Text */}
            <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-indigo-900">Need access to additional documents?</p>
                    <p className="text-xs text-indigo-700 mt-1">
                        Contact your project consultant or the PTDF administrator to request access to restricted files.
                    </p>
                </div>
            </div>
        </div>
    );
}
