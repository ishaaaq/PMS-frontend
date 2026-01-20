
export const MilestoneStatus = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    VERIFIED: 'VERIFIED',
    PAID: 'PAID',
} as const;

export type MilestoneStatus = typeof MilestoneStatus[keyof typeof MilestoneStatus];

export interface Milestone {
    id: string;
    projectId: string;
    title: string;
    description: string;
    amount: number;
    status: MilestoneStatus;
    dueDate: string;
    completedDate?: string;
    progress: number;
}

export const MOCK_MILESTONES: Milestone[] = [
    {
        id: '1',
        projectId: '1',
        title: 'Mobilization & Site Clearing',
        description: 'Initial mobilization of equipment to site and clearing of vegetation.',
        amount: 30000000,
        status: MilestoneStatus.PAID,
        dueDate: '2025-01-20',
        completedDate: '2025-01-18',
        progress: 100
    },
    {
        id: '2',
        projectId: '1',
        title: 'Foundation Works',
        description: 'Excavation, enforcement, and casting of foundation.',
        amount: 45000000,
        status: MilestoneStatus.IN_PROGRESS,
        dueDate: '2025-03-15',
        progress: 65
    },
    {
        id: '3',
        projectId: '1',
        title: 'Superstructure (Ground to First Floor)',
        description: 'Block work and columns for ground floor.',
        amount: 40000000,
        status: MilestoneStatus.PENDING,
        dueDate: '2025-05-30',
        progress: 0
    },
    {
        id: '4',
        projectId: '1',
        title: 'Roofing & Finishes',
        description: 'Roofing structure, sheets, and initial internal finishes.',
        amount: 35000000,
        status: MilestoneStatus.PENDING,
        dueDate: '2025-08-15',
        progress: 0
    }
];

export const getProjectMilestones = async (projectId: string): Promise<Milestone[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_MILESTONES.filter(m => m.projectId === projectId || m.projectId === '1')); // Return logic slightly hacked for demo to always show '1' data
        }, 600);
    });
};
