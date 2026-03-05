import { supabase } from '@/lib/supabase';
import { logRpcError } from '@/lib/debug';

// Contractor Management Service - Admin View

export type GeographicZone =
    | 'NORTH_WEST' | 'NORTH_EAST' | 'NORTH_CENTRAL'
    | 'SOUTH_WEST' | 'SOUTH_EAST' | 'SOUTH_SOUTH';

export type ContractorStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export interface AdminContractor {
    id: string;
    companyName: string;
    registrationNumber: string;
    email: string;
    phone: string;
    logo?: string;
    zone: GeographicZone;
    status: ContractorStatus;
    rating: number;
    totalReviews: number;
    projectCount: number;
    activeProjects: number;
    completedProjects: number;
    specializations: string[];
    lastActiveAt: string;
    joinedAt: string;
}

export const ZONE_LABELS: Record<GeographicZone, string> = {
    'NORTH_WEST': 'North-West',
    'NORTH_EAST': 'North-East',
    'NORTH_CENTRAL': 'North-Central',
    'SOUTH_WEST': 'South-West',
    'SOUTH_EAST': 'South-East',
    'SOUTH_SOUTH': 'South-South',
};

export interface ContractorMetrics {
    projectCount?: number;
    activeProjects?: number;
    completedProjects?: number;
    rating?: number;
    totalReviews?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapContractor = (p: any, cp: any, email: string, metrics?: ContractorMetrics): AdminContractor => {
    return {
        id: p.user_id || p.id,
        companyName: cp?.company_name || p.full_name || 'Unknown Company',
        registrationNumber: cp?.registration_number || 'Not provided',
        email: email || '',
        phone: p.phone || '',
        logo: p.avatar_url,
        zone: (cp?.zone as GeographicZone) || 'NORTH_CENTRAL',
        status: p.is_active ? 'ACTIVE' as ContractorStatus : 'PENDING' as ContractorStatus,
        rating: metrics?.rating ? Number(metrics.rating) : 0,
        totalReviews: metrics?.totalReviews ? Number(metrics.totalReviews) : 0,
        projectCount: metrics?.projectCount ? Number(metrics.projectCount) : 0,
        activeProjects: metrics?.activeProjects ? Number(metrics.activeProjects) : 0,
        completedProjects: metrics?.completedProjects !== undefined ? Number(metrics.completedProjects) :
            (metrics?.projectCount ? Number(metrics.projectCount) - Number(metrics.activeProjects || 0) : 0),
        specializations: cp?.zone ? [cp.zone.replace('_', ' ')] : [],
        lastActiveAt: p.updated_at || new Date().toISOString(),
        joinedAt: p.created_at || new Date().toISOString(),
    };
};

export interface ContractorStats {
    total: number;
    active: number;
    pending: number;
    suspended: number;
}

export const getContractorStats = (contractors: AdminContractor[]): ContractorStats => {
    return {
        total: contractors.length,
        active: contractors.filter(c => c.status === 'ACTIVE').length,
        pending: contractors.filter(c => c.status === 'PENDING').length,
        suspended: contractors.filter(c => c.status === 'SUSPENDED').length,
    };
};

export const getAdminContractors = async (): Promise<AdminContractor[]> => {
    // Try RPC first (includes real email from auth.users)
    const { data: rpcData, error: rpcErr } = await supabase.rpc('rpc_admin_list_contractors');

    if (!rpcErr && rpcData && Array.isArray(rpcData)) {
        return rpcData.map((r: any) => mapContractor( // eslint-disable-line @typescript-eslint/no-explicit-any
            { user_id: r.user_id, full_name: r.full_name, role: r.role, phone: r.phone, is_active: r.is_active, created_at: r.created_at },
            { company_name: r.company_name, registration_number: r.registration_number, zone: r.zone },
            r.email || '',
            {
                projectCount: r.project_count,
                activeProjects: r.active_projects,
                rating: r.average_rating,
                totalReviews: r.total_reviews
            }
        ));
    }

    // Fallback: direct queries (no email available)
    console.warn('rpc_admin_list_contractors unavailable, falling back:', rpcErr?.message);
    if (rpcErr) {
        window.alert(`RPC FAILED: ${rpcErr.message}. The system is falling back to historical data (which displays 0 projects). Please make sure the SQL migration was executed without errors in Supabase.`);
    }

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'CONTRACTOR')
        .order('created_at', { ascending: false });

    if (error) {
        logRpcError('getAdminContractors', error);
        return [];
    }

    if (!profiles || profiles.length === 0) return [];

    // Fetch extended contractor profiles
    const userIds = profiles.map(p => p.user_id);
    const { data: contractorProfiles } = await supabase
        .from('contractor_profiles')
        .select('*')
        .in('user_id', userIds);

    const cpMap = new Map((contractorProfiles || []).map(cp => [cp.user_id, cp]));

    return profiles.map(p => mapContractor(p, cpMap.get(p.user_id), ''));
};

export interface InviteContractorData {
    companyName: string;
    email: string;
    phone: string;
    zone: GeographicZone;
    specializations: string[];
    message?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const inviteContractor = async (_data: InviteContractorData): Promise<{ success: boolean }> => {

    // Real implementation: RPC call or edge function
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
};
