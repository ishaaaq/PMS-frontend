
import { supabase } from '@/lib/supabase';
import { logRpcError } from '@/lib/debug';

export const MilestoneStatus = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
} as const;

export type MilestoneStatus = typeof MilestoneStatus[keyof typeof MilestoneStatus];

export interface ApprovedSubmission {
    id: string;
    milestone: string;
    contractor: string;
    date: string;
    location: string;
    description: string;
    status: string;
    images?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documents?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    materialUsage?: any[];
}

export interface Milestone {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    amount: number;
    status: MilestoneStatus;
    dueDate: string;
    completedDate?: string;
    progress: number;
    // For Dashboard
    projectName?: string;
    contractorName?: string;
    contractor?: string;
    approvedSubmission?: ApprovedSubmission;
}

// Helper to map DB response to Milestone object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMilestone = (m: any): Milestone => {
    // Safety check for status
    const status = (Object.values(MilestoneStatus).includes(m.status)
        ? m.status
        : MilestoneStatus.NOT_STARTED) as MilestoneStatus;

    // Progress calculation
    let progress = 0;
    if (status === MilestoneStatus.COMPLETED) progress = 100;
    else if (status === MilestoneStatus.IN_PROGRESS) progress = 50;

    // Contractor Name Logic
    let contractorName = 'Unassigned';

    // 1. Try from approved submission
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const approvedSub = m.submissions?.find((s: any) => s.status === 'APPROVED');

    if (approvedSub?.profiles?.full_name) {
        contractorName = approvedSub.profiles.full_name;
    }
    // 2. Try from any submission (contractor who submitted)
    else if (m.submissions?.length > 0 && m.submissions[0].profiles?.full_name) {
        contractorName = m.submissions[0].profiles.full_name;
    }
    // 3. Try from section assignment
    else if (m.section_milestones?.length > 0) {
        const section = m.section_milestones[0].sections;
        if (section?.section_assignments?.length > 0) {
            const assign = section.section_assignments[0];
            if (assign.profiles?.full_name) {
                contractorName = assign.profiles.full_name;
            }
        }
    }

    // Approved Submission for Modal
    let approvedSubmission: ApprovedSubmission | undefined = undefined;
    if (approvedSub) {
        approvedSubmission = {
            id: approvedSub.id,
            milestone: m.title,
            contractor: contractorName,
            date: new Date(approvedSub.submitted_at).toLocaleDateString(),
            location: m.projects?.location || 'Unknown Location',
            description: approvedSub.work_description,
            status: 'approved'
            // Images and documents requested by Modal via ID
        };
    }

    return {
        id: m.id,
        projectId: m.project_id,
        title: m.title,
        description: m.description,
        amount: Number(m.budget) || 0,
        status,
        dueDate: m.due_date,
        progress,
        projectName: m.projects?.title,
        contractorName,
        contractor: contractorName,
        approvedSubmission
    };
};

export const getAllMilestones = async (): Promise<Milestone[]> => {
    const { data, error } = await supabase
        .from('milestones')
        .select(`
            *,
            projects (title, location),
            submissions (
                id, status, submitted_at, work_description,
                profiles (full_name)
            ),
            section_milestones (
                sections (
                    section_assignments (
                        profiles (full_name)
                    )
                )
            )
        `)
        .order('due_date', { ascending: true });

    if (error) {
        logRpcError('milestones.getAll', error);
        throw error;
    }

    return (data || []).map(mapMilestone);
};

export const getProjectMilestones = async (projectId: string): Promise<Milestone[]> => {
    const { data, error } = await supabase
        .from('milestones')
        .select(`
            *,
            projects (title, location),
            submissions (
                id, status, submitted_at, work_description,
                profiles (full_name)
            ),
            section_milestones (
                sections (
                    section_assignments (
                        profiles (full_name)
                    )
                )
            )
        `)
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

    if (error) {
        logRpcError('milestones.getProject', error);
        throw error;
    }

    return (data || []).map(mapMilestone);
};

export const MilestonesService = {
    getAllMilestones,
    getProjectMilestones
};
