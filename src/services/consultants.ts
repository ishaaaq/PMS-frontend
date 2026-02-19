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
const mapConsultant = (p: any): Consultant => {
    // In a real app, strict typing for `p` (PostgREST result) is better
    return {
        id: p.user_id || p.id,
        name: p.full_name || 'Unknown Consultant',
        email: p.email || '',
        phone: p.phone_number || '',
        company: p.company_name || 'PTDF Consulting',
        department: p.department || 'Infrastructure',
        region: p.zone || 'North Central', // map zone to region if needed
        activeProjects: 0, // Requires separate count query or view
        completedProjects: 0, // Requires separate count query
        rating: p.rating || 0,
        specialization: p.specialization || 'General',
        joinedDate: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: (p.status as 'Active' | 'Inactive' | 'On Leave') || 'Active'
    };
};

// Service functions
export async function getConsultants(): Promise<Consultant[]> {
    // Fetch users with role 'CONSULTANT' from profiles
    // We assume 'profiles' has role column.
    // If not, we might need to join auth.users (not possible from client) or check metadata.
    // But usually profiles has role.
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'CONSULTANT')
        .order('created_at', { ascending: false });

    if (error) {
        logRpcError('getConsultants', error);
        return [];
    }

    const consultants = (data || []).map(mapConsultant);

    // Ideally we would fetch project counts here. 
    // For MVP, we'll leave them as 0 or implement a separate count query later if critical.
    return consultants;
}

export async function getConsultant(id: string): Promise<Consultant | undefined> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .eq('role', 'CONSULTANT')
        .single();

    if (error) {
        logRpcError('getConsultant', error);
        return undefined;
    }

    return mapConsultant(data);
}

export async function inviteConsultant(email: string): Promise<{ success: boolean; message: string }> {
    // In Supabase, this typically involves calling an Edge Function or RPC 
    // to use admin auth API to invite user by email.
    // For now, we'll keep it as a simulation or basic RPC call if implemented.
    // We'll return mock success to not block UI, as invitation flow is complex (SMTP setup etc).

    console.log('Inviting consultant:', email);
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
