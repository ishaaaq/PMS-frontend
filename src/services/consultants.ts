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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapConsultant = (p: any, cp: any, email: string): Consultant => {
    return {
        id: p.user_id || p.id,
        name: p.full_name || 'Unknown Consultant',
        email: email || '',
        phone: p.phone || '',
        company: 'PTDF',
        department: cp?.department || 'Not provided',
        region: cp?.region || 'Not provided',
        activeProjects: 0,
        completedProjects: 0,
        rating: 0,
        specialization: cp?.specialization || 'Not provided',
        joinedDate: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: p.is_active === false ? 'Inactive' : 'Active'
    };
};

// Service functions
export async function getConsultants(): Promise<Consultant[]> {
    // Try RPC first (includes real email from auth.users + extended profile)
    const { data: rpcData, error: rpcErr } = await supabase.rpc('rpc_admin_list_consultants');

    if (!rpcErr && rpcData && Array.isArray(rpcData)) {
        return rpcData.map((r: any) => mapConsultant( // eslint-disable-line @typescript-eslint/no-explicit-any
            { user_id: r.user_id, full_name: r.full_name, role: r.role, phone: r.phone, is_active: r.is_active, created_at: r.created_at },
            { specialization: r.specialization, department: r.department, region: r.region },
            r.email || ''
        ));
    }

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

    return profiles.map(p => mapConsultant(p, cpMap.get(p.user_id), ''));
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

    return mapConsultant(profile, cp, email);
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
