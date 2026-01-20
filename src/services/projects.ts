
export const ProjectStatus = {
    INITIATED: 'INITIATED',
    ONGOING: 'ONGOING',
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

export const MOCK_PROJECTS: Project[] = [
    {
        id: '1',
        title: 'Construction of ICT Center',
        description: 'Building a state-of-the-art ICT center for the University of Lagos. This initiative aims to create a modern learning environment for students in the area. We are looking for a contractor who can bring this vision to life, ensuring high-quality construction and adherence to safety standards. The project will include classrooms, a library, and recreational spaces, all designed to foster a positive educational experience.',
        lga: 'Lagos Mainland',
        state: 'Lagos',
        budgetTotal: 150000000,
        approvedBudget: 150000000,
        amountSpent: 45000000,
        status: ProjectStatus.ONGOING,
        progress: 45,
        contractor: 'BuildRight Construction Ltd',
        consultant: 'Prime Consultants',
        startDate: '2025-01-10',
        endDate: '2025-12-20',
        department: 'Project',
        gallery: [
            'https://images.unsplash.com/photo-1590644365607-1c5a2e9a3a70?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvbnN0cnVjdGlvbiUyMHNpdGV8ZW58MHx8MHx8fDA%3D',
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNvbnN0cnVjdGlvbnxlbnwwfHwwfHx8MA%3D%3D'
        ]
    },
    {
        id: '2',
        title: 'Solar Power Installation',
        description: 'Installation of 500KW Solar mini-grid.',
        lga: 'Kano Municipal',
        state: 'Kano',
        budgetTotal: 85000000,
        approvedBudget: 85000000,
        amountSpent: 5000000,
        status: ProjectStatus.INITIATED,
        progress: 0,
        contractor: 'GreenEnergy Solutions',
        consultant: 'TechnoServe Partners',
        startDate: '2025-02-01',
        endDate: '2025-08-01',
        department: 'Renewable Energy',
        gallery: []
    },
    {
        id: '3',
        title: 'Laboratory Equipment Supply',
        description: 'Supply and installation of chemistry lab equipment.',
        lga: 'Port Harcourt',
        state: 'Rivers',
        budgetTotal: 45000000,
        approvedBudget: 45000000,
        amountSpent: 45000000,
        status: ProjectStatus.COMPLETED,
        progress: 100,
        contractor: 'LabTech Nigeria',
        consultant: 'Prime Consultants',
        startDate: '2024-06-01',
        endDate: '2024-12-01',
        department: 'Education',
        gallery: [
            'https://images.unsplash.com/photo-1579165466741-7f35a4755657?w=500&auto=format&fit=crop&q=60'
        ]
    },
];

export const getProjects = async (): Promise<Project[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_PROJECTS), 800); // Simulate network delay
    });
};

export const getProject = async (id: string): Promise<Project | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_PROJECTS.find(p => p.id === id)), 500);
    });
};
