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



export const getContractorBudget = async (): Promise<BudgetSummary> => {
    // Derive budget from real milestone data for this contractor
    try {
        const assignments = await getContractorAssignments();
        const allMilestones = assignments.flatMap(a => a.milestones);
        const totalAllocated = allMilestones.reduce((sum, m) => sum + m.amount, 0);
        const completedAmount = allMilestones
            .filter(m => m.status === 'COMPLETED')
            .reduce((sum, m) => sum + m.amount, 0);
        const pendingAmount = allMilestones
            .filter(m => m.status === 'PENDING_APPROVAL')
            .reduce((sum, m) => sum + m.amount, 0);

        return {
            currency: 'NGN',
            totalAllocated,
            amountDisbursed: completedAmount,
            amountPending: pendingAmount,
            lastDisbursementDate: new Date().toISOString().split('T')[0],
        };
    } catch {
        return { currency: 'NGN', totalAllocated: 0, amountDisbursed: 0, amountPending: 0, lastDisbursementDate: '' };
    }
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

export const getMonthlyEarnings = async (): Promise<{ month: string; amount: number }[]> => {
    // Return empty — no mock data. This chart will show "No data yet".
    return [];
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

const EMPTY_PROFILE: ContractorProfile = {
    id: '',
    companyName: 'Your Company',
    registrationNumber: 'Not provided',
    email: '',
    phone: 'Not provided',
    address: 'Not provided',
    description: '',
    establishedYear: new Date().getFullYear(),
    employeeCount: 0,
    specializations: [],
    performanceMetrics: [],
    certifications: [],
    portfolio: [],
    overallRating: 0,
    totalProjectsCompleted: 0,
    totalContractValue: 0,
};

export const getContractorProfile = async (): Promise<ContractorProfile> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return EMPTY_PROFILE;

        // Fetch profile + contractor record (fixed: table is contractor_profiles, not contractors)
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        const { data: contractor } = await supabase
            .from('contractor_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Fetch certifications from new table
        const { data: certsData } = await supabase
            .from('contractor_certifications')
            .select('*')
            .eq('contractor_user_id', user.id)
            .order('expiry_date', { ascending: true });

        const certifications: Certification[] = (certsData || []).map((c: Record<string, unknown>) => ({
            id: c.id as string,
            name: c.name as string,
            issuer: c.issuer as string,
            issueDate: c.issue_date as string,
            expiryDate: c.expiry_date as string,
            status: c.status as 'VALID' | 'EXPIRING' | 'EXPIRED',
        }));

        // Fetch performance metrics from new table
        const { data: metricsData } = await supabase
            .from('contractor_performance_metrics')
            .select('*')
            .eq('contractor_user_id', user.id)
            .order('recorded_at', { ascending: false });

        const performanceMetrics: PerformanceMetric[] = (metricsData || []).map((m: Record<string, unknown>) => ({
            label: m.label as string,
            value: Number(m.value),
            unit: m.unit as string,
            trend: m.trend as 'up' | 'down' | 'stable',
            change: m.change as string,
        }));

        // Get real assignments for stats
        const assignments = await getContractorAssignments();
        const allMilestones = assignments.flatMap(a => a.milestones);
        const completedProjects = assignments.filter(a => a.status === 'COMPLETED').length;
        const totalValue = allMilestones.reduce((sum, m) => sum + m.amount, 0);

        return {
            id: user.id,
            companyName: contractor?.company_name || profile?.full_name || 'Your Company',
            registrationNumber: contractor?.registration_number || 'Not provided',
            email: profile?.email || user.email || '',
            phone: profile?.phone || 'Not provided',
            address: contractor?.zone ? `Zone: ${contractor.zone.replace('_', ' ')}` : 'Not provided',
            description: `Contractor registered on the PTDF Project Management System.`,
            establishedYear: new Date(profile?.created_at || Date.now()).getFullYear(),
            employeeCount: 0,
            specializations: contractor?.zone ? [contractor.zone.replace('_', ' ')] : [],
            performanceMetrics,
            certifications,
            portfolio: assignments.filter(a => a.status === 'COMPLETED').map(a => ({
                id: a.id,
                title: a.projectTitle,
                location: a.location,
                completedDate: a.lastUpdated,
                value: a.milestones.reduce((sum, m) => sum + m.amount, 0),
                rating: 5,
            })),
            overallRating: 0,
            totalProjectsCompleted: completedProjects,
            totalContractValue: totalValue,
        };
    } catch (err) {
        console.error('Failed to fetch contractor profile:', err);
        return EMPTY_PROFILE;
    }
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

export const getContractorDocuments = async (): Promise<ProjectDocument[]> => {
    // No mock data — documents will come from Supabase storage in a future update
    return [];
};
