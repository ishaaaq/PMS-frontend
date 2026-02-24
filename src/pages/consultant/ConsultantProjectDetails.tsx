import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Calendar,
    Briefcase,
    Plus,
    UserPlus,
    MoreVertical,
    DollarSign,
    AlertTriangle,
    FileText,
    ChevronLeft,
    CheckCircle,
    Clock,
    AlertCircle,
    MessageSquare,
    Send,
    Loader2
} from 'lucide-react';
import AssignSectionModal from '../../components/consultant/AssignSectionModal';
import { SectionsService } from '../../services/sections.service';
import { supabase } from '@/lib/supabase';
import { ProjectsService } from '../../services/projects.service';
import { SubmissionsService } from '../../services/submissions.service';
import { CommentsService } from '../../services/comments.service';

// ---------- types for fetched data ----------
interface ProjectRow {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    total_budget: number;
    currency: string;
    status: string;
    created_at: string;
}

interface SectionRow {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    section_assignments: any[];
}

interface MilestoneRow {
    id: string;
    title: string;
    description: string | null;
    sort_order: number;
    due_date: string;
    budget: number;
    status: string;
}

interface ContractorInfo {
    id: string;
    name: string;
    sectionName: string;
}

interface SubmissionRow {
    id: string;
    status: string;
    submitted_at: string;
    work_description: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    milestone?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contractor?: any;
}

interface CommentRow {
    id: string;
    body: string;
    created_at: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    author?: any;
}

const SUBMISSION_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    PENDING_APPROVAL: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', label: 'Pending Approval' },
    APPROVED: { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', label: 'Approved' },
    QUERIED: { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', label: 'Queried' },
    REJECTED: { color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400', label: 'Rejected' },
}

// ---------- component ----------
export default function ConsultantProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('sections');
    const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
    const [assignSectionId, setAssignSectionId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    // Real data state
    const [project, setProject] = useState<ProjectRow | null>(null);
    const [sections, setSections] = useState<SectionRow[]>([]);
    const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
    const [sectionMilestoneMap, setSectionMilestoneMap] = useState<Record<string, string[]>>({});
    const [contractors, setContractors] = useState<ContractorInfo[]>([]);

    // Submissions tab state (loaded lazily when tab is first activated)
    const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [submissionsLoaded, setSubmissionsLoaded] = useState(false);

    // Comments tab state
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    const [commentDraft, setCommentDraft] = useState('');
    const [postingComment, setPostingComment] = useState(false);
    const [commentError, setCommentError] = useState('');

    const fetchData = useCallback(async () => {
        if (!id) return;

        // --- 1. Project (required — bail if this fails) ---
        try {
            const { data: projData, error: projError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (projError) throw projError;
            setProject(projData as ProjectRow);
        } catch (err) {
            console.error('[ProjectDetails] project fetch failed:', err);
            setIsLoading(false);
            return; // can't render anything without the project
        }

        // --- 2. Sections ---
        try {
            const secData = await SectionsService.getProjectSectionsDetailed(id);
            setSections((secData || []) as SectionRow[]);
        } catch (err) {
            console.error('[ProjectDetails] sections fetch failed:', err);
        }

        // --- 3. Contractors (project pool via RPC) ---
        try {
            const poolData = await ProjectsService.getProjectContractors(id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ctrs: ContractorInfo[] = poolData.map((c: any) => ({
                id: c.id,
                name: c.name || 'Unknown',
                sectionName: 'Project Pool'
            }));
            setContractors(ctrs);
        } catch (err) {
            console.error('[ProjectDetails] contractors fetch failed:', err);
        }

        // --- 4. Milestones ---
        try {
            const msData = await SectionsService.getProjectMilestones(id);
            setMilestones((msData || []) as MilestoneRow[]);
        } catch (err) {
            console.error('[ProjectDetails] milestones fetch failed:', err);
        }

        // --- 5. Section ↔ milestone mapping ---
        try {
            const mapData = await SectionsService.getSectionMilestoneMap(id);
            const map: Record<string, string[]> = {};
            for (const row of mapData) {
                if (!map[row.section_id]) map[row.section_id] = [];
                map[row.section_id].push(row.milestone_id);
            }
            setSectionMilestoneMap(map);
        } catch (err) {
            console.error('[ProjectDetails] section-milestone map fetch failed:', err);
        }

        setIsLoading(false);
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Lazy-load submissions when the tab is activated
    useEffect(() => {
        if (activeTab !== 'submissions' || submissionsLoaded || !id) return;
        setSubmissionsLoading(true);
        SubmissionsService.getProjectSubmissions(id)
            .then(data => {
                setSubmissions((data || []) as SubmissionRow[]);
                setSubmissionsLoaded(true);
            })
            .catch(err => console.error('[ProjectDetails] submissions fetch:', err))
            .finally(() => setSubmissionsLoading(false));
    }, [activeTab, id, submissionsLoaded]);

    // Lazy-load comments when the tab is activated
    const loadComments = useCallback(async () => {
        if (!id) return;
        setCommentsLoading(true);
        try {
            const data = await CommentsService.getProjectComments(id);
            setComments((data || []) as CommentRow[]);
            setCommentsLoaded(true);
        } catch (err) {
            console.error('[ProjectDetails] comments fetch:', err);
        } finally {
            setCommentsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (activeTab !== 'comments' || commentsLoaded) return;
        void loadComments();
    }, [activeTab, commentsLoaded, loadComments]);

    const handlePostComment = async () => {
        if (!commentDraft.trim() || !id) return;
        setPostingComment(true);
        setCommentError('');
        try {
            await CommentsService.addProjectComment(id, commentDraft.trim());
            setCommentDraft('');
            setCommentsLoaded(false); // force refetch
            await loadComments();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to post comment';
            setCommentError(msg);
        } finally {
            setPostingComment(false);
        }
    };

    // Helpers
    const getMilestonesForSection = (sectionId: string) => {
        const ids = sectionMilestoneMap[sectionId] || [];
        return milestones.filter(m => ids.includes(m.id));
    };

    const assignedMilestoneIds = new Set(Object.values(sectionMilestoneMap).flat());
    const unassignedMilestones = milestones.filter(m => !assignedMilestoneIds.has(m.id));

    const getContractorForSection = (section: SectionRow) => {
        const assignment = section.section_assignments?.[0];
        if (!assignment) return null;
        const match = contractors.find(c => c.id === assignment.contractor_user_id);
        return match?.name || 'Unknown';
    };

    const completedCount = milestones.filter(m => m.status === 'COMPLETED').length;
    const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    const formatBudget = (amt: number) => `₦${Number(amt).toLocaleString()}`;
    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
                </div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="max-w-6xl mx-auto text-center py-20">
                <p className="text-gray-500 dark:text-gray-400">Project not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/dashboard/consultant/projects')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Projects
                </button>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {project.location && (
                                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {project.location}</span>
                            )}
                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {new Date(project.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                                {project.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <FileText className="h-4 w-4 mr-2" /> View Reports
                        </button>
                        <button
                            onClick={() => navigate(`/dashboard/consultant/projects/${id}/sections/new`)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create Section
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBudget(project.total_budget)}</p>
                </div>
                <div className="glass-card p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Project Progress</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressPercent}%</p>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contractors Active</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-2">
                            {contractors.map((c, i) => (
                                <div key={i} className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400" title={c.name}>
                                    {c.name.charAt(0)}
                                </div>
                            ))}
                        </div>
                        <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center">
                            <UserPlus className="h-3 w-3 mr-1" /> Invite
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px">
                        {['Sections', 'Milestones', 'Contractors', 'Submissions', 'Comments'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.toLowerCase()
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'sections' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Sections</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage work breakdown and contractor assignments.</p>
                            </div>

                            <div className="grid gap-4">
                                {sections.map((section) => {
                                    const contractor = getContractorForSection(section);
                                    const secMilestones = getMilestonesForSection(section.id);
                                    const secCompleted = secMilestones.filter(m => m.status === 'COMPLETED').length;
                                    const secProgress = secMilestones.length > 0 ? Math.round((secCompleted / secMilestones.length) * 100) : 0;

                                    return (
                                        <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 dark:text-white">{section.name}</h4>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${secProgress === 100 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                            secProgress === 0 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                                                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                            }`}>
                                                            {secProgress === 100 ? 'Completed' : secProgress === 0 ? 'Pending' : 'In Progress'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" /> {secMilestones.length} milestones</span>
                                                        <span className="flex items-center">
                                                            <Briefcase className="h-3 w-3 mr-1" />
                                                            {!contractor ? (
                                                                <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center">
                                                                    <AlertTriangle className="h-3 w-3 mr-1" /> Unassigned
                                                                </span>
                                                            ) : (
                                                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{contractor}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 hidden md:block">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-gray-500 dark:text-gray-400">Progress</span>
                                                            <span className="text-gray-700 dark:text-gray-300">{secProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${secProgress}%` }}></div>
                                                        </div>
                                                    </div>

                                                    {!contractor ? (
                                                        <button
                                                            onClick={() => { setAssignSectionId(section.id); setIsCreateSectionOpen(true); }}
                                                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700"
                                                        >
                                                            Assign Contractor
                                                        </button>
                                                    ) : (
                                                        <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            Manage
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'milestones' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Milestones</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Grouped by section assignment</p>
                            </div>

                            {/* Group milestones by section */}
                            {sections.map((section) => {
                                const sectionMilestones = getMilestonesForSection(section.id);
                                if (sectionMilestones.length === 0) return null;

                                return (
                                    <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-gray-900 dark:text-white">{section.name}</h4>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {sectionMilestones.length} milestone{sectionMilestones.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {sectionMilestones.map((milestone) => {
                                                const statusConfig = {
                                                    'COMPLETED': { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircle },
                                                    'IN_PROGRESS': { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Clock },
                                                    'PENDING_APPROVAL': { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: AlertCircle },
                                                    'QUERIED': { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: AlertTriangle }
                                                }[milestone.status] || { color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400', icon: Clock };

                                                const StatusIcon = statusConfig.icon;

                                                return (
                                                    <div key={milestone.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="font-medium text-gray-900 dark:text-white">{milestone.title}</p>
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 ${statusConfig.color}`}>
                                                                        <StatusIcon className="h-3 w-3" />
                                                                        {milestone.status.replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />Due: {milestone.due_date}</span>
                                                                    <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" />{formatBudget(milestone.budget)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Unassigned Milestones */}
                            {unassignedMilestones.length > 0 && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-3 border-b border-orange-200 dark:border-orange-900/50">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Unassigned Milestones
                                            </h4>
                                            <span className="text-xs text-orange-700 dark:text-orange-400">
                                                {unassignedMilestones.length} milestone{unassignedMilestones.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {unassignedMilestones.map((milestone) => {
                                            const statusConfig = {
                                                'COMPLETED': { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircle },
                                                'IN_PROGRESS': { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Clock },
                                                'PENDING_APPROVAL': { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: AlertCircle },
                                                'QUERIED': { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: AlertTriangle }
                                            }[milestone.status] || { color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400', icon: Clock };

                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <div key={milestone.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <p className="font-medium text-gray-900 dark:text-white">{milestone.title}</p>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 ${statusConfig.color}`}>
                                                                    <StatusIcon className="h-3 w-3" />
                                                                    {milestone.status.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />Due: {milestone.due_date}</span>
                                                                <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" />{formatBudget(milestone.budget)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'contractors' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Contractors</h3>
                                <button className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                                    <UserPlus className="h-4 w-4 mr-2" /> Invite Contractor
                                </button>
                            </div>
                            {contractors.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <p>No contractors assigned yet.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {contractors.map((contractor) => (
                                        <div key={contractor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-start bg-gray-50/50 dark:bg-gray-800/50">
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{contractor.name}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{contractor.sectionName}</p>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Submissions Tab ── */}
                    {activeTab === 'submissions' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submissions</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">All contractor submissions for this project</p>
                            </div>

                            {submissionsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
                                    <p>No submissions yet for this project.</p>
                                </div>
                            ) : (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Milestone</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contractor</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-transparent">
                                            {submissions.map((sub) => {
                                                const cfg = SUBMISSION_STATUS_CONFIG[sub.status] || { color: 'bg-gray-100 dark:bg-gray-700 text-gray-600', label: sub.status };
                                                const milestoneTitle = sub.milestone?.title || '—';
                                                const contractorName = sub.contractor?.full_name || '—';
                                                return (
                                                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{milestoneTitle}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{contractorName}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${cfg.color}`}>
                                                                {cfg.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(sub.submitted_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Comments Tab ── */}
                    {activeTab === 'comments' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                                    Project Comments
                                </h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
                            </div>

                            {/* Post a comment */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/30">
                                <textarea
                                    value={commentDraft}
                                    onChange={e => setCommentDraft(e.target.value)}
                                    placeholder="Add a comment about this project..."
                                    rows={3}
                                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                                {commentError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{commentError}</p>
                                )}
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handlePostComment}
                                        disabled={postingComment || !commentDraft.trim()}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Post Comment
                                    </button>
                                </div>
                            </div>

                            {/* Comments list */}
                            {commentsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
                                    <p>No comments yet. Be the first to comment.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {comments.map((comment) => {
                                        const authorName = comment.author?.full_name || 'Unknown';
                                        const authorRole = comment.author?.role || '';
                                        return (
                                            <div key={comment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                                                            {authorName.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{authorName}</span>
                                                        {authorRole && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase font-bold">
                                                                {authorRole}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(comment.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.body}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Assigning Contractors to Sections */}
            <AssignSectionModal
                isOpen={isCreateSectionOpen}
                onClose={() => { setIsCreateSectionOpen(false); setAssignSectionId(undefined); fetchData(); }}
                projectId={id}
                sectionId={assignSectionId}
                contractorName=""
            />
        </div>
    );
}
