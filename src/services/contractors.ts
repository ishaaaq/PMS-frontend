
export interface Contractor {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    rating: number;
    projectsCompleted: number;
    activeProjects: number;
    assignedProjectId?: string;
    assignedProjectName?: string;
    status: 'active' | 'inactive' | 'pending';
    joinedDate: string;
    avatar?: string;
}

// Mock contractors data
export const MOCK_CONTRACTORS: Contractor[] = [
    {
        id: 'contractor-1',
        name: 'Adamu Construction Ltd',
        email: 'info@adamuconstruction.com',
        phone: '+234 803 456 7890',
        company: 'Adamu Construction Ltd',
        rating: 4.5,
        projectsCompleted: 12,
        activeProjects: 2,
        assignedProjectId: 'project-1',
        assignedProjectName: 'Lagos ICT Innovation Hub',
        status: 'active',
        joinedDate: '2024-03-15',
    },
    {
        id: 'contractor-2',
        name: 'BuildRight Nigeria',
        email: 'contact@buildright.ng',
        phone: '+234 805 123 4567',
        company: 'BuildRight Nigeria',
        rating: 4.2,
        projectsCompleted: 8,
        activeProjects: 1,
        assignedProjectId: 'project-2',
        assignedProjectName: 'Kaduna Skills Academy',
        status: 'active',
        joinedDate: '2024-05-20',
    },
    {
        id: 'contractor-3',
        name: 'Premier Builders',
        email: 'hello@premierbuilders.com',
        phone: '+234 809 876 5432',
        company: 'Premier Builders',
        rating: 3.8,
        projectsCompleted: 5,
        activeProjects: 1,
        assignedProjectId: 'project-3',
        assignedProjectName: 'Enugu Road Rehabilitation',
        status: 'active',
        joinedDate: '2024-07-10',
    },
    {
        id: 'contractor-4',
        name: 'Alpha Works Engineering',
        email: 'projects@alphaworks.ng',
        phone: '+234 802 345 6789',
        company: 'Alpha Works Engineering',
        rating: 4.8,
        projectsCompleted: 20,
        activeProjects: 3,
        assignedProjectId: 'project-1',
        assignedProjectName: 'Lagos ICT Innovation Hub',
        status: 'active',
        joinedDate: '2023-11-05',
    },
    {
        id: 'contractor-5',
        name: 'Swift Contractors',
        email: 'info@swiftcontractors.com',
        phone: '+234 807 654 3210',
        company: 'Swift Contractors',
        rating: 3.5,
        projectsCompleted: 3,
        activeProjects: 0,
        status: 'inactive',
        joinedDate: '2024-09-01',
    },
    {
        id: 'contractor-6',
        name: 'Unity Builders Co.',
        email: 'unity@builders.com',
        phone: '+234 801 222 3333',
        company: 'Unity Builders Co.',
        rating: 0,
        projectsCompleted: 0,
        activeProjects: 0,
        status: 'pending',
        joinedDate: '2025-01-10',
    },
];

export function getContractors(): Promise<Contractor[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_CONTRACTORS), 300);
    });
}

export function getContractor(id: string): Promise<Contractor | undefined> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const contractor = MOCK_CONTRACTORS.find(c => c.id === id);
            resolve(contractor);
        }, 200);
    });
}

export function getContractorsByProject(projectId: string): Promise<Contractor[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const contractors = MOCK_CONTRACTORS.filter(c => c.assignedProjectId === projectId);
            resolve(contractors);
        }, 300);
    });
}

export function getActiveContractors(): Promise<Contractor[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const contractors = MOCK_CONTRACTORS.filter(c => c.status === 'active');
            resolve(contractors);
        }, 300);
    });
}

