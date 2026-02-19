import { supabase } from '@/lib/supabase';
import { logRpcError } from '@/lib/debug';

export const ProjectStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    SUSPENDED: 'SUSPENDED',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export interface Project {
    id: string;
    title: string;
    description: string;
    lga: string;
    state: string;
    budgetTotal: number;
    approvedBudget: number;
    amountSpent: number;
    status: ProjectStatus;
    progress: number;
    contractor: string;
    contractorId?: string;
    consultant: string;
    consultantId?: string;
    assignedConsultants: { id: string; name: string; role: string }[];
    startDate: string;
    endDate: string;
    gallery: string[];
    department: string;
    projectContractors?: { id: string; name: string; role: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProject = (p: any): Project => {
    // Parse location if it's stored as "State, LGA" string
    let state = p.state || '';
    let lga = p.lga || '';

    // If location is stored as a single string field, try to parse
    if (!state && !lga && p.location) {
        const parts = p.location.split(',').map((s: string) => s.trim());
        if (parts.length >= 2) {
            state = parts[0];
            lga = parts[1];
        } else {
            state = p.location;
        }
    }

    // Determine status from DB or default
    const status = (p.status?.toUpperCase() as ProjectStatus) || ProjectStatus.DRAFT;

    // Extract consultant from project_consultants join table
    if (p.project_consultants) {
        console.log('mapProject: HAS project_consultants', p.project_consultants);
    } else {
        console.log('mapProject: NO project_consultants property found (likely raw fetch)');
    }

    const assignedConsultants = (p.project_consultants || []).map((pc: any) => ({
        id: pc.consultant_user_id,
        name: pc.profiles?.full_name || 'Unassigned Consultant',
        role: 'Consultant'
    }));

    const assignedConsultantObj = p.project_consultants?.[0];
    const consultantName = assignedConsultantObj?.profiles?.full_name || 'Unassigned';
    const consultantId = assignedConsultantObj?.consultant_user_id;

    // Map project owners/contractors from pool
    const projectContractors = (p.project_contractors || []).map((pc: any) => ({
        id: pc.contractor_user_id,
        name: pc.profiles?.full_name || 'Unassigned Contractor',
        role: 'Contractor'
    }));

    // Contractor fetching might differ, staying with previous logic or similar if table exists
    // If project_contractors existed, we'd do same. But strictly sticking to consultant fix.
    // Preserving old logic for contractor just in case, but noting it might be empty if column doesn't exist.
    const contractorName = projectContractors.length > 0 ? projectContractors[0].name : 'Unassigned';
    const contractorId = projectContractors.length > 0 ? projectContractors[0].id : undefined;

    return {
        id: p.id,
        title: p.title,
        description: p.description || '',
        lga,
        state,
        budgetTotal: Number(p.total_budget || 0),
        approvedBudget: Number(p.approved_budget || p.total_budget || 0),
        amountSpent: Number(p.amount_spent || 0),
        status,
        progress: Number(p.progress || 0),
        contractor: contractorName,
        consultant: consultantName,
        consultantId: consultantId,
        assignedConsultants,
        projectContractors,
        startDate: p.start_date || new Date().toISOString().split('T')[0],
        endDate: p.end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gallery: p.gallery || [],
        department: p.department || 'Project',
    };
};

export const getProjects = async (): Promise<Project[]> => {
    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            project_consultants (
                consultant_user_id,
                profiles:consultant_user_id ( full_name )
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        // Fallback or retry logic if needed, but for now we expect this relationship to exist
        // given the RPC implementation.
        // We warn but don't strictly fallback to raw if we believe this schema is correct now.
        if (error.code === '42703' || error.code === 'PGRST200') {
            console.warn('Relation fetch failed, falling back to raw', error);
            const { data: simpleData } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
            return (simpleData || []).map(mapProject);
        }
        logRpcError('getProjects', error);
        return [];
    }

    return (data || []).map(mapProject);
};

export const getProject = async (id: string): Promise<Project | undefined> => {
    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            project_consultants (
                consultant_user_id,
                profiles:consultant_user_id ( full_name )
            ),
            project_contractors (
                contractor_user_id,
                profiles:contractor_user_id ( full_name )
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('getProject: Primary fetch failed (likely RLS or Join issue). Falling back to raw.', error);
        logRpcError('getProject', error);
        // Fallback read
        const { data: simpleData } = await supabase.from('projects').select('*').eq('id', id).single();
        return simpleData ? mapProject(simpleData) : undefined;
    }

    return mapProject(data);
};
