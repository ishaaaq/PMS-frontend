import { supabase } from '@/lib/supabase';
import { logRpcError } from '@/lib/debug';
export interface BudgetSummary {
    currency: string;
    totalAllocated: number;
    amountDisbursed: number;
    amountPending: number;
    lastDisbursementDate: string;
}

export type AssignmentStatus = 'IN_PROGRESS' | 'QUERIED' | 'PENDING_APPROVAL' | 'COMPLETED';

export interface Milestone {
    id: string;
    title: string;
    progress: number;
    status: AssignmentStatus;
    dueDate: string;
    amount: number;
}

export interface Assignment {
    id: string;
    projectId: string;
    projectTitle: string;
    sectionTitle?: string; // New field for Section Name
    location: string;
    milestones: Milestone[];
    overallProgress: number;
    status: AssignmentStatus;
    lastUpdated: string;
    // Properties for current/active milestone
    dueDate?: string;
    milestoneTitle?: string;
    currentProgress?: number;
    queryReason?: string;
}

export type NotificationType = 'QUERY' | 'PAYMENT' | 'SYSTEM' | 'APPROVAL';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    projectTitle?: string;
    timestamp: string;
    isRead: boolean;
}

export const MOCK_BUDGET: BudgetSummary = {
    currency: 'NGN',
    totalAllocated: 150000000,
    amountDisbursed: 75000000,
    amountPending: 15000000,
    lastDisbursementDate: '2025-01-15',
};

export const MOCK_ASSIGNMENTS: Assignment[] = [
    {
        id: '1',
        projectId: 'p1',
        projectTitle: 'Construction of ICT Center',
        location: 'Lagos Mainland, Lagos',
        overallProgress: 65,
        status: 'QUERIED',
        lastUpdated: '2025-01-20',
        milestones: [
            { id: 'm1', title: 'Mobilization & Site Clearing', progress: 100, status: 'COMPLETED', dueDate: '2025-01-15', amount: 30000000 },
            { id: 'm2', title: 'Foundation Works', progress: 65, status: 'QUERIED', dueDate: '2025-02-28', amount: 45000000 },
            { id: 'm3', title: 'Superstructure', progress: 0, status: 'IN_PROGRESS', dueDate: '2025-05-30', amount: 40000000 },
            { id: 'm4', title: 'Roofing & Finishes', progress: 0, status: 'IN_PROGRESS', dueDate: '2025-08-15', amount: 35000000 },
        ],
    },
    {
        id: '2',
        projectId: 'p2',
        projectTitle: 'Solar Power Installation',
        location: 'Kano Municipal, Kano',
        overallProgress: 40,
        status: 'IN_PROGRESS',
        lastUpdated: '2025-01-22',
        milestones: [
            { id: 'm5', title: 'Site Survey & Planning', progress: 100, status: 'COMPLETED', dueDate: '2025-01-10', amount: 5000000 },
            { id: 'm6', title: 'Equipment Procurement', progress: 100, status: 'PENDING_APPROVAL', dueDate: '2025-01-30', amount: 50000000 },
            { id: 'm7', title: 'Installation & Testing', progress: 0, status: 'IN_PROGRESS', dueDate: '2025-04-15', amount: 30000000 },
        ],
    },
    {
        id: '3',
        projectId: 'p3',
        projectTitle: 'Bridge Rehabilitation',
        location: 'Enugu South, Enugu',
        overallProgress: 100,
        status: 'COMPLETED',
        lastUpdated: '2024-12-01',
        milestones: [
            { id: 'm8', title: 'Structural Assessment', progress: 100, status: 'COMPLETED', dueDate: '2024-09-01', amount: 10000000 },
            { id: 'm9', title: 'Repair Works', progress: 100, status: 'COMPLETED', dueDate: '2024-11-15', amount: 35000000 },
        ],
    },
];



// Monthly earnings data for chart
export const MOCK_MONTHLY_EARNINGS = [
    { month: 'Aug', amount: 0 },
    { month: 'Sep', amount: 10000000 },
    { month: 'Oct', amount: 15000000 },
    { month: 'Nov', amount: 20000000 },
    { month: 'Dec', amount: 0 },
    { month: 'Jan', amount: 30000000 },
];

export const getContractorBudget = async (): Promise<BudgetSummary> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_BUDGET), 300));
};

export const getContractorAssignments = async (): Promise<Assignment[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get all section assignments for this contractor (RLS handled)
    const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('section_assignments')
        .select(`
            section_id,
            sections (
                id, name, project_id,
                projects ( id, title, location, status )
            )
        `)
        .eq('contractor_user_id', user.id);

    if (assignmentsError) {
        logRpcError('section_assignments.select', assignmentsError);
        return [];
    }

    if (!assignmentsData || assignmentsData.length === 0) return [];

    // Verification / Debug Logging

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueSections = new Set(assignmentsData.map((a: any) => a.section_id));


    if (assignmentsData.length !== uniqueSections.size) {
        console.warn('[Assignments] Duplicates detected in raw fetch! Deduplicating...');
    }

    // Map section_id -> Assignment
    const sectionMap = new Map<string, Assignment>();
    const sectionIds: string[] = [];

    // 2. Build map and collect section IDs - ENSURING UNIQUENESS
    for (const row of assignmentsData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sec = row.sections as any;
        if (!sec) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proj = sec.projects as any;
        if (!proj) continue;

        const sectionId = sec.id;

        // Skip if already processed (Deduplication)
        if (sectionMap.has(sectionId)) continue;

        sectionIds.push(sectionId);
        sectionMap.set(sectionId, {
            id: sectionId, // ID is now Section ID
            projectId: proj.id,
            projectTitle: proj.title,
            sectionTitle: sec.name, // Added Section Title
            location: proj.location || 'Unknown Location',
            milestones: [],
            overallProgress: 0,
            status: 'IN_PROGRESS',
            lastUpdated: new Date().toISOString(),
        });
    }

    if (sectionIds.length === 0) return Array.from(sectionMap.values());

    // 3. Fetch milestones for these sections
    const { data: smData, error: smError } = await supabase
        .from('section_milestones')
        .select(`
            section_id,
            milestones (
                id, title, status, due_date, budget, description
            )
        `)
        .in('section_id', sectionIds); // sectionIds are unique here

    if (smError) {
        logRpcError('section_milestones.select', smError);
        return Array.from(sectionMap.values());
    }

    // 4. Fetch Submissions
    const milestoneIds: string[] = [];
    smData?.forEach(row => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((row.milestones as any)?.id) milestoneIds.push((row.milestones as any).id);
    });

    const submissionMap = new Map<string, string>(); // milestone_id -> status
    if (milestoneIds.length > 0) {
        const { data: subData } = await supabase
            .from('submissions')
            .select('milestone_id, status, submitted_at')
            .in('milestone_id', milestoneIds)
            .eq('contractor_user_id', user.id)
            .order('submitted_at', { ascending: false });

        if (subData) {
            for (const sub of subData) {
                if (!submissionMap.has(sub.milestone_id)) {
                    submissionMap.set(sub.milestone_id, sub.status);
                }
            }
        }
    }

    // 5. Map milestones to SECTIONS
    for (const row of smData || []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ms = row.milestones as any;
        if (!ms) continue;

        const assignment = sectionMap.get(row.section_id);
        if (!assignment) continue;

        // DETERMINE STATUS
        let displayStatus: AssignmentStatus = 'IN_PROGRESS';
        let progress = 0;

        if (ms.status === 'COMPLETED') {
            displayStatus = 'COMPLETED';
            progress = 100;
        } else {
            const subStatus = submissionMap.get(ms.id);
            if (subStatus === 'PENDING_APPROVAL') {
                displayStatus = 'PENDING_APPROVAL';
                progress = 75;
            } else if (subStatus === 'QUERIED') {
                displayStatus = 'QUERIED';
                progress = 50;
            } else {
                displayStatus = 'IN_PROGRESS';
                progress = ms.status === 'IN_PROGRESS' ? 50 : 0;
            }
        }

        assignment.milestones.push({
            id: ms.id,
            title: ms.title,
            progress,
            status: displayStatus,
            dueDate: ms.due_date,
            amount: Number(ms.budget || 0),
        });
    }

    // 6. Calculate aggregations
    for (const assignment of sectionMap.values()) {
        const total = assignment.milestones.length;
        if (total > 0) {
            const completed = assignment.milestones.filter(m => m.status === 'COMPLETED').length;
            assignment.overallProgress = Math.round((completed / total) * 100);
        } else {
            assignment.overallProgress = 0;
        }

        // Lift status to section level
        // Rule: QUERIED > PENDING_APPROVAL > COMPLETED > IN_PROGRESS
        const hasQueried = assignment.milestones.some(m => m.status === 'QUERIED');
        const hasPending = assignment.milestones.some(m => m.status === 'PENDING_APPROVAL');
        const allCompleted = total > 0 && assignment.milestones.every(m => m.status === 'COMPLETED');

        if (hasQueried) {
            assignment.status = 'QUERIED';
            const queriedMilestone = assignment.milestones.find(m => m.status === 'QUERIED');
            if (queriedMilestone) {
                assignment.milestoneTitle = queriedMilestone.title;
                assignment.queryReason = 'Consultant has requested changes. Please review.';
            }
        } else if (hasPending) {
            assignment.status = 'PENDING_APPROVAL';
        } else if (allCompleted) {
            assignment.status = 'COMPLETED';
        } else {
            assignment.status = 'IN_PROGRESS';
        }
    }

    return Array.from(sectionMap.values());
};

export const getContractorNotifications = async (): Promise<Notification[]> => {
    const results: Notification[] = [];

    // ── Source 1: Section notifications (consultant → contractor) ──
    // Uses SECURITY DEFINER RPC because RLS on the `notifications` table
    // only allows consultant reads (is_project_consultant). The RPC
    // joins notification_deliveries → notifications → sections → projects
    // server-side and returns flat rows with full content.
    try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
            'rpc_get_contractor_notifications'
        )

        if (!rpcError && rpcData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const row of rpcData as any[]) {
                results.push({
                    id: row.notification_id,
                    type: 'SYSTEM',
                    title: row.title || 'Notification',
                    message: row.message || '',
                    projectTitle: row.project_title || undefined,
                    timestamp: row.created_at || new Date().toISOString(),
                    isRead: row.is_read ?? false,
                })
            }
        } else if (rpcError) {
            console.warn('rpc_get_contractor_notifications failed, trying direct query', rpcError)

            // Fallback: direct query (will show "Notification" if notifications RLS blocks)
            const { data, error } = await supabase
                .from('notification_deliveries')
                .select(`
                    notification_id,
                    is_read,
                    notifications (
                        id, title, message, created_at,
                        sections ( id, project_id, projects ( id, title ) )
                    )
                `)
                .order('notification_id', { ascending: false })

            if (!error && data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                for (const row of data as any[]) {
                    const notif = row.notifications
                    results.push({
                        id: row.notification_id,
                        type: 'SYSTEM',
                        title: notif?.title || 'Notification',
                        message: notif?.message || '',
                        projectTitle: notif?.sections?.projects?.title || undefined,
                        timestamp: notif?.created_at || new Date().toISOString(),
                        isRead: row.is_read ?? false,
                    })
                }
            }
        }
    } catch (err) {
        console.warn('section notifications fetch error', err)
    }

    // ── Source 2: Submission status changes (APPROVED / QUERIED) ──
    // RLS "contractor_submissions": contractor_user_id = auth.uid()
    // These are synthesised into notification items because the DB
    // does not automatically create notification rows for status changes.
    try {
        const { data: subs, error: subErr } = await supabase
            .from('submissions')
            .select(`
                id,
                status,
                work_description,
                query_note,
                submitted_at,
                reviewed_at,
                milestone_id,
                milestones (
                    id,
                    title,
                    project_id,
                    projects ( id, title )
                )
            `)
            .in('status', ['APPROVED', 'QUERIED'])
            .order('reviewed_at', { ascending: false })

        if (!subErr && subs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const sub of subs as any[]) {
                const ms = sub.milestones
                const proj = ms?.projects
                const isApproved = sub.status === 'APPROVED'

                results.push({
                    id: `sub-${sub.id}`,
                    type: isApproved ? 'APPROVAL' : 'QUERY',
                    title: isApproved
                        ? `Milestone Approved: ${ms?.title || 'Unknown'}`
                        : `Submission Queried: ${ms?.title || 'Unknown'}`,
                    message: isApproved
                        ? `Your submission for "${ms?.title || 'a milestone'}" has been approved by the consultant.`
                        : (sub.query_note || `The consultant has raised a query on your submission for "${ms?.title || 'a milestone'}". Please review and resubmit.`),
                    projectTitle: proj?.title || undefined,
                    timestamp: sub.reviewed_at || sub.submitted_at || new Date().toISOString(),
                    isRead: true, // Historical status changes are treated as read
                })
            }
        } else if (subErr) {
            console.warn('submissions status query failed', subErr)
        }
    } catch (err) {
        console.warn('submissions fetch error', err)
    }

    // Sort all notifications newest-first
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return results
};

export const getMonthlyEarnings = async (): Promise<typeof MOCK_MONTHLY_EARNINGS> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_MONTHLY_EARNINGS), 200));
};

// Contractor Profile Types
export interface Certification {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    status: 'VALID' | 'EXPIRING' | 'EXPIRED';
}

export interface PerformanceMetric {
    label: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: string;
}

export interface ProjectPortfolioItem {
    id: string;
    title: string;
    location: string;
    completedDate: string;
    value: number;
    rating: number;
}

export interface ContractorProfile {
    id: string;
    companyName: string;
    registrationNumber: string;
    email: string;
    phone: string;
    address: string;
    logo?: string;
    description: string;
    establishedYear: number;
    employeeCount: number;
    specializations: string[];
    performanceMetrics: PerformanceMetric[];
    certifications: Certification[];
    portfolio: ProjectPortfolioItem[];
    overallRating: number;
    totalProjectsCompleted: number;
    totalContractValue: number;
}

export const MOCK_CONTRACTOR_PROFILE: ContractorProfile = {
    id: 'c1',
    companyName: 'BuildRight Construction Ltd.',
    registrationNumber: 'RC-2019-456789',
    email: 'info@buildright.ng',
    phone: '+234 803 456 7890',
    address: '15 Marina Road, Lagos Island, Lagos State',
    description: 'Leading construction company specializing in institutional buildings, solar installations, and infrastructure rehabilitation projects across Nigeria.',
    establishedYear: 2012,
    employeeCount: 85,
    specializations: ['Civil Engineering', 'Renewable Energy', 'Infrastructure', 'Building Construction'],
    performanceMetrics: [
        { label: 'On-Time Delivery', value: 94, unit: '%', trend: 'up', change: '+3%' },
        { label: 'Quality Score', value: 4.7, unit: '/5', trend: 'up', change: '+0.2' },
        { label: 'Avg Response Time', value: 2.3, unit: 'hrs', trend: 'down', change: '-0.5' },
        { label: 'Client Satisfaction', value: 96, unit: '%', trend: 'stable', change: '0%' },
    ],
    certifications: [
        { id: 'cert1', name: 'ISO 9001:2015', issuer: 'Standards Organisation of Nigeria', issueDate: '2023-03-15', expiryDate: '2026-03-14', status: 'VALID' },
        { id: 'cert2', name: 'COREN Registration', issuer: 'Council for Regulation of Engineering', issueDate: '2020-01-10', expiryDate: '2025-01-09', status: 'VALID' },
        { id: 'cert3', name: 'Health & Safety Certificate', issuer: 'Federal Ministry of Labour', issueDate: '2024-06-01', expiryDate: '2025-05-31', status: 'EXPIRING' },
    ],
    portfolio: [
        { id: 'p1', title: 'University Library Complex', location: 'Abuja', completedDate: '2024-08-15', value: 450000000, rating: 5 },
        { id: 'p2', title: 'Solar Farm Installation', location: 'Kaduna', completedDate: '2024-03-20', value: 180000000, rating: 4.5 },
        { id: 'p3', title: 'Highway Bridge Rehabilitation', location: 'Enugu', completedDate: '2023-11-10', value: 320000000, rating: 5 },
    ],
    overallRating: 4.8,
    totalProjectsCompleted: 23,
    totalContractValue: 2850000000,
};

export const getContractorProfile = async (): Promise<ContractorProfile> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CONTRACTOR_PROFILE), 300));
};

// Document Repository Types
export type DocumentType = 'CONTRACT' | 'DRAWING' | 'SPECIFICATION' | 'REPORT' | 'INVOICE' | 'CERTIFICATE' | 'OTHER';

export interface ProjectDocument {
    id: string;
    name: string;
    type: DocumentType;
    fileType: 'pdf' | 'doc' | 'xls' | 'dwg' | 'jpg' | 'png';
    size: number; // in bytes
    uploadedAt: string;
    uploadedBy: string;
    projectId: string;
    projectTitle: string;
    description?: string;
    version: string;
}

export const MOCK_DOCUMENTS: ProjectDocument[] = [
    // ICT Center Project
    { id: 'd1', name: 'Contract Agreement - ICT Center', type: 'CONTRACT', fileType: 'pdf', size: 2540000, uploadedAt: '2024-11-15', uploadedBy: 'PTDF Admin', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '1.0' },
    { id: 'd2', name: 'Architectural Drawings - Foundation', type: 'DRAWING', fileType: 'dwg', size: 15800000, uploadedAt: '2024-11-20', uploadedBy: 'Consultant', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '2.1' },
    { id: 'd3', name: 'Structural Specifications', type: 'SPECIFICATION', fileType: 'pdf', size: 4200000, uploadedAt: '2024-11-22', uploadedBy: 'Consultant', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '1.0' },
    { id: 'd4', name: 'Site Survey Report', type: 'REPORT', fileType: 'pdf', size: 8900000, uploadedAt: '2024-10-05', uploadedBy: 'Consultant', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '1.0' },
    { id: 'd5', name: 'Payment Certificate - Milestone 1', type: 'CERTIFICATE', fileType: 'pdf', size: 520000, uploadedAt: '2025-01-18', uploadedBy: 'PTDF Finance', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '1.0' },

    // Solar Power Project
    { id: 'd6', name: 'Contract Agreement - Solar Installation', type: 'CONTRACT', fileType: 'pdf', size: 1980000, uploadedAt: '2024-12-01', uploadedBy: 'PTDF Admin', projectId: 'p2', projectTitle: 'Solar Power Installation', version: '1.0' },
    { id: 'd7', name: 'Equipment Specifications', type: 'SPECIFICATION', fileType: 'pdf', size: 3400000, uploadedAt: '2024-12-10', uploadedBy: 'Consultant', projectId: 'p2', projectTitle: 'Solar Power Installation', version: '1.2' },
    { id: 'd8', name: 'Site Layout Plan', type: 'DRAWING', fileType: 'pdf', size: 6700000, uploadedAt: '2024-12-15', uploadedBy: 'Consultant', projectId: 'p2', projectTitle: 'Solar Power Installation', version: '1.0' },
    { id: 'd9', name: 'Proforma Invoice - Equipment', type: 'INVOICE', fileType: 'xls', size: 450000, uploadedAt: '2025-01-05', uploadedBy: 'Contractor', projectId: 'p2', projectTitle: 'Solar Power Installation', version: '1.0' },

    // Bridge Project
    { id: 'd10', name: 'Contract Agreement - Bridge Rehabilitation', type: 'CONTRACT', fileType: 'pdf', size: 2100000, uploadedAt: '2024-07-20', uploadedBy: 'PTDF Admin', projectId: 'p3', projectTitle: 'Bridge Rehabilitation', version: '1.0' },
    { id: 'd11', name: 'Completion Certificate', type: 'CERTIFICATE', fileType: 'pdf', size: 890000, uploadedAt: '2024-12-01', uploadedBy: 'Consultant', projectId: 'p3', projectTitle: 'Bridge Rehabilitation', version: '1.0' },
    { id: 'd12', name: 'Final Inspection Photos', type: 'OTHER', fileType: 'jpg', size: 12500000, uploadedAt: '2024-11-28', uploadedBy: 'Consultant', projectId: 'p3', projectTitle: 'Bridge Rehabilitation', description: 'Photo documentation of completed works', version: '1.0' },
];

export const getContractorDocuments = async (): Promise<ProjectDocument[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_DOCUMENTS), 350));
};
