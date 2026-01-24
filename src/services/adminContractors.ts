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

export const MOCK_ADMIN_CONTRACTORS: AdminContractor[] = [
    {
        id: 'c1',
        companyName: 'BuildRight Construction Ltd.',
        registrationNumber: 'RC-2019-456789',
        email: 'info@buildright.ng',
        phone: '+234 803 456 7890',
        zone: 'SOUTH_WEST',
        status: 'ACTIVE',
        rating: 4.8,
        totalReviews: 23,
        projectCount: 8,
        activeProjects: 3,
        completedProjects: 5,
        specializations: ['Civil Engineering', 'Building Construction'],
        lastActiveAt: '2026-01-23T14:30:00Z',
        joinedAt: '2022-03-15',
    },
    {
        id: 'c2',
        companyName: 'Delta Engineering Services',
        registrationNumber: 'RC-2018-123456',
        email: 'contact@deltaeng.ng',
        phone: '+234 805 123 4567',
        zone: 'SOUTH_SOUTH',
        status: 'ACTIVE',
        rating: 4.5,
        totalReviews: 18,
        projectCount: 6,
        activeProjects: 2,
        completedProjects: 4,
        specializations: ['Infrastructure', 'Road Construction'],
        lastActiveAt: '2026-01-22T09:15:00Z',
        joinedAt: '2021-08-20',
    },
    {
        id: 'c3',
        companyName: 'Northern Star Builders',
        registrationNumber: 'RC-2020-789012',
        email: 'info@northernstar.ng',
        phone: '+234 802 789 0123',
        zone: 'NORTH_CENTRAL',
        status: 'ACTIVE',
        rating: 4.2,
        totalReviews: 12,
        projectCount: 4,
        activeProjects: 2,
        completedProjects: 2,
        specializations: ['Renewable Energy', 'Solar Installation'],
        lastActiveAt: '2026-01-21T16:45:00Z',
        joinedAt: '2023-01-10',
    },
    {
        id: 'c4',
        companyName: 'Kano Infrastructure Group',
        registrationNumber: 'RC-2017-345678',
        email: 'hello@kanoinfra.ng',
        phone: '+234 809 345 6789',
        zone: 'NORTH_WEST',
        status: 'PENDING',
        rating: 0,
        totalReviews: 0,
        projectCount: 0,
        activeProjects: 0,
        completedProjects: 0,
        specializations: ['Bridge Construction', 'Highway Engineering'],
        lastActiveAt: '2026-01-20T11:00:00Z',
        joinedAt: '2026-01-18',
    },
    {
        id: 'c5',
        companyName: 'Enugu Power Solutions',
        registrationNumber: 'RC-2019-567890',
        email: 'power@enugusolutions.ng',
        phone: '+234 806 567 8901',
        zone: 'SOUTH_EAST',
        status: 'ACTIVE',
        rating: 4.9,
        totalReviews: 31,
        projectCount: 12,
        activeProjects: 4,
        completedProjects: 8,
        specializations: ['Electrical Engineering', 'Power Systems'],
        lastActiveAt: '2026-01-23T08:20:00Z',
        joinedAt: '2020-05-22',
    },
    {
        id: 'c6',
        companyName: 'Abuja Construction Co.',
        registrationNumber: 'RC-2016-234567',
        email: 'info@abujaconstruction.ng',
        phone: '+234 807 234 5678',
        zone: 'NORTH_CENTRAL',
        status: 'SUSPENDED',
        rating: 2.8,
        totalReviews: 8,
        projectCount: 3,
        activeProjects: 0,
        completedProjects: 2,
        specializations: ['Building Construction'],
        lastActiveAt: '2025-12-15T10:00:00Z',
        joinedAt: '2019-11-30',
    },
    {
        id: 'c7',
        companyName: 'Lagos Marine Works',
        registrationNumber: 'RC-2018-901234',
        email: 'marine@lagosworks.ng',
        phone: '+234 801 901 2345',
        zone: 'SOUTH_WEST',
        status: 'ACTIVE',
        rating: 4.6,
        totalReviews: 15,
        projectCount: 5,
        activeProjects: 1,
        completedProjects: 4,
        specializations: ['Marine Engineering', 'Port Construction'],
        lastActiveAt: '2026-01-22T14:10:00Z',
        joinedAt: '2021-02-14',
    },
    {
        id: 'c8',
        companyName: 'Maiduguri Builders Ltd.',
        registrationNumber: 'RC-2021-456123',
        email: 'contact@maidbuilders.ng',
        phone: '+234 804 456 1234',
        zone: 'NORTH_EAST',
        status: 'PENDING',
        rating: 0,
        totalReviews: 0,
        projectCount: 0,
        activeProjects: 0,
        completedProjects: 0,
        specializations: ['Civil Engineering', 'Water Supply'],
        lastActiveAt: '2026-01-19T09:30:00Z',
        joinedAt: '2026-01-15',
    },
    {
        id: 'c9',
        companyName: 'Calabar Green Energy',
        registrationNumber: 'RC-2020-678901',
        email: 'green@calabarenergy.ng',
        phone: '+234 808 678 9012',
        zone: 'SOUTH_SOUTH',
        status: 'ACTIVE',
        rating: 4.4,
        totalReviews: 9,
        projectCount: 3,
        activeProjects: 1,
        completedProjects: 2,
        specializations: ['Renewable Energy', 'Environmental Engineering'],
        lastActiveAt: '2026-01-23T11:45:00Z',
        joinedAt: '2022-07-08',
    },
    {
        id: 'c10',
        companyName: 'Kaduna Steel Structures',
        registrationNumber: 'RC-2019-012345',
        email: 'info@kadunasteel.ng',
        phone: '+234 803 012 3456',
        zone: 'NORTH_WEST',
        status: 'ACTIVE',
        rating: 4.1,
        totalReviews: 14,
        projectCount: 6,
        activeProjects: 2,
        completedProjects: 4,
        specializations: ['Steel Construction', 'Industrial Buildings'],
        lastActiveAt: '2026-01-21T15:20:00Z',
        joinedAt: '2021-09-12',
    },
];

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
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_ADMIN_CONTRACTORS), 400));
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
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
};
