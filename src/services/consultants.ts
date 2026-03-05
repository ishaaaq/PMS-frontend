import { supabase } from '@/lib/supabase';
import { logRpcError } from '@/lib/debug';

// Consultant types and interfaces
export interface Consultant {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    department?: string;
    region?: string;
    activeProjects: number;
    completedProjects: number;
    rating: number; // 1-5 stars
    specialization?: string;
    joinedDate: string;
    status: 'Active' | 'Inactive' | 'On Leave';
    assignedProjects?: { id: string; title: string; status: string; total_budget: number; created_at: string }[];
}

export interface ConsultantMetrics {
    projectCount?: number;
    activeProjects?: number;
    completedProjects?: number;
    rating?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapConsultant = (p: any, cp: any, email: string, metrics?: ConsultantMetrics): Consultant => {
    return {
        id: p.user_id || p.id,
        name: p.full_name || 'Unknown Consultant',
        email: email || '',
        phone: p.phone || '',
        company: 'PTDF',
        department: cp?.department || 'Not provided',
        region: cp?.region || 'Not provided',
        activeProjects: metrics?.activeProjects ? Number(metrics.activeProjects) : 0,
        completedProjects: metrics?.completedProjects !== undefined ? Number(metrics.completedProjects) :
            (metrics?.projectCount ? Number(metrics.projectCount) - Number(metrics.activeProjects || 0) : 0),
        rating: metrics?.rating ? Number(metrics.rating) : 0,
        specialization: cp?.specialization || 'Not provided',
        joinedDate: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: p.is_active === false ? 'Inactive' : 'Active'
    };
};

// Service functions
export async function getConsultants(): Promise<Consultant[]> {
    let consultants: Consultant[] = [];

    // Try RPC first (includes real email from auth.users + extended profile)
    const { data: rpcData, error: rpcErr } = await supabase.rpc('rpc_admin_list_consultants');

    if (!rpcErr && rpcData && Array.isArray(rpcData)) {
        consultants = rpcData.map((r: any) => mapConsultant( // eslint-disable-line @typescript-eslint/no-explicit-any
            { user_id: r.user_id, full_name: r.full_name, role: r.role, phone: r.phone, is_active: r.is_active, created_at: r.created_at },
            { specialization: r.specialization, department: r.department, region: r.region },
            r.email || '',
            {
                projectCount: r.project_count,
                activeProjects: r.active_projects,
                rating: r.average_rating
            }
        ));
    } else {
        // Fallback: direct queries
        console.warn('rpc_admin_list_consultants unavailable, falling back:', rpcErr?.message);
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'CONSULTANT')
            .order('created_at', { ascending: false });

        if (error) {
            logRpcError('getConsultants', error);
            return [];
        }

        if (!profiles || profiles.length === 0) return [];

        // Fetch extended consultant profiles
        const userIds = profiles.map(p => p.user_id);
        const { data: consultantProfiles } = await supabase
            .from('consultant_profiles')
            .select('*')
            .in('user_id', userIds);

        const cpMap = new Map((consultantProfiles || []).map(cp => [cp.user_id, cp]));
        consultants = profiles.map(p => mapConsultant(p, cpMap.get(p.user_id), ''));
    }

    // Fetch real project counts from project_consultants + projects
    if (consultants.length > 0) {
        const consultantIds = consultants.map(c => c.id);
        const { data: assignments } = await supabase
            .from('project_consultants')
            .select('consultant_user_id, projects!inner(status)')
            .in('consultant_user_id', consultantIds);

        if (assignments) {
            // Count active and completed per consultant
            const activeCounts = new Map<string, number>();
            const completedCounts = new Map<string, number>();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const a of assignments as any[]) {
                const uid = a.consultant_user_id;
                const status = a.projects?.status;
                if (status === 'ACTIVE' || status === 'DRAFT') {
                    activeCounts.set(uid, (activeCounts.get(uid) || 0) + 1);
                } else if (status === 'COMPLETED') {
                    completedCounts.set(uid, (completedCounts.get(uid) || 0) + 1);
                }
            }
            for (const c of consultants) {
                c.activeProjects = activeCounts.get(c.id) || 0;
                c.completedProjects = completedCounts.get(c.id) || 0;
            }
        }
    }

    return consultants;
}

export async function getConsultant(id: string): Promise<Consultant | undefined> {
    // Fetch profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .eq('role', 'CONSULTANT')
        .single();

    if (error) {
        logRpcError('getConsultant', error);
        return undefined;
    }

    // Fetch extended consultant profile
    const { data: cp } = await supabase
        .from('consultant_profiles')
        .select('*')
        .eq('user_id', id)
        .single();

    // Try to get email via the user detail RPC
    let email = '';
    const { data: rpcData, error: rpcErr } = await supabase.rpc('rpc_get_user_detail', { p_user_id: id });
    if (!rpcErr && rpcData) {
        email = rpcData.email || '';
    }

    const consultant = mapConsultant(profile, cp, email);

    // Fetch real project counts AND project list using RPC to bypass RLS blocks
    const { data: assignments } = await supabase
        .rpc('rpc_admin_consultant_projects', { p_consultant_user_id: id });

    if (assignments && assignments.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const typedAssignments = assignments as any[];
        consultant.activeProjects = typedAssignments.filter(a => a.status === 'ACTIVE' || a.status === 'DRAFT').length;
        consultant.completedProjects = typedAssignments.filter(a => a.status === 'COMPLETED').length;
        consultant.assignedProjects = typedAssignments.map(a => ({
            id: a.id,
            title: a.title || 'Untitled Project',
            status: a.status || 'UNKNOWN',
            total_budget: a.total_budget || 0,
            created_at: a.created_at || '',
        }));
    }

    return consultant;
}

export async function inviteConsultant(email: string): Promise<{ success: boolean; message: string }> {
    // In Supabase, this typically involves calling an Edge Function or RPC 
    // to use admin auth API to invite user by email.
    // For now, we'll keep it as a simulation or basic RPC call if implemented.
    // We'll return mock success to not block UI, as invitation flow is complex (SMTP setup etc).


    // Real implementation would be: 
    // await supabase.auth.admin.inviteUserByEmail(email) (only from server side)
    // or call an RPC that inserts into an invitations table.

    return {
        success: true,
        message: `Invitation sent to ${email} (Simulation)`
    };
}

export async function updateConsultantRating(consultantId: string, rating: number): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({ rating: rating })
        .eq('id', consultantId);

    if (error) {
        logRpcError('updateConsultantRating', error);
        throw error;
    }
}
