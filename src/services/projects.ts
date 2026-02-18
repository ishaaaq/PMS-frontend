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
    consultant: string;
    startDate: string;
    endDate: string;
    gallery: string[];
    department: string;
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

    return {
        id: p.id,
        title: p.title,
        description: p.description || '',
        lga,
        state,
        budgetTotal: Number(p.total_budget || 0),
        approvedBudget: Number(p.approved_budget || p.total_budget || 0), // Fallback if approved not separate
        amountSpent: Number(p.amount_spent || 0),
        status,
        progress: Number(p.progress || 0),
        contractor: p.contractor_profile?.full_name || 'Unassigned',
        consultant: p.consultant_profile?.full_name || 'Unassigned',
        startDate: p.start_date || new Date().toISOString().split('T')[0],
        endDate: p.end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gallery: p.gallery || [],
        department: p.department || 'Project',
    };
};

export const getProjects = async (): Promise<Project[]> => {
    // Basic fetch with profile joins for names.
    // If foreign keys are not set up as `contractor_id` -> `profiles.id`, 
    // the join syntax `contractor_profile:contractor_id ( full_name )` might fail.
    // We will attempt it, and handle errors if necessary.

    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            contractor_profile:contractor_user_id ( full_name ),
            consultant_profile:consultant_user_id ( full_name )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        // Fallback: If joined columns fail (e.g. invalid relationship name), try raw fetch
        // Checking for PostgREST error codes for undefined column/relation
        if (error.code === '42703' || error.code === 'PGRST200') {
            console.warn('Join failed, fetching raw projects', error.message);
            const { data: simpleData, error: simpleError } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (simpleError) {
                logRpcError('getProjects', simpleError);
                return [];
            }
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
            contractor_profile:contractor_user_id ( full_name ),
            consultant_profile:consultant_user_id ( full_name )
        `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === '42703' || error.code === 'PGRST200') {
            const { data: simpleData, error: simpleError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();
            if (simpleError) {
                logRpcError('getProject', simpleError);
                return undefined;
            }
            return simpleData ? mapProject(simpleData) : undefined;
        }
        logRpcError('getProject', error);
        return undefined;
    }

    return mapProject(data);
};
