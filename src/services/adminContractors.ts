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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapContractor = (p: any): AdminContractor => {
    return {
        id: p.id,
        companyName: p.full_name || 'Unknown Company',
        registrationNumber: p.company_reg_number || 'PENDING',
        email: p.email || '',
        phone: p.phone_number || '',
        logo: p.avatar_url,
        zone: (p.zone as GeographicZone) || 'NORTH_CENTRAL',
        status: (p.status as ContractorStatus) || 'PENDING',
        rating: p.rating || 0,
        totalReviews: 0, // Requires reviews table
        projectCount: 0, // Requires projects count
        activeProjects: 0,
        completedProjects: 0,
        specializations: p.specialization ? [p.specialization] : [],
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
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'CONTRACTOR')
        .order('created_at', { ascending: false });

    if (error) {
        logRpcError('getAdminContractors', error);
        return [];
    }

    return (data || []).map(mapContractor);
};

export interface InviteContractorData {
    companyName: string;
    email: string;
    phone: string;
    zone: GeographicZone;
    specializations: string[];
    message?: string;
}

export const inviteContractor = async (data: InviteContractorData): Promise<{ success: boolean }> => {
    console.log('Inviting contractor:', data);
    // Real implementation: RPC call or edge function
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
};
