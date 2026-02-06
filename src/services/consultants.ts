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

// Mock data for consultants
const mockConsultants: Consultant[] = [
    {
        id: '1',
        name: 'Dr. Amina Bello',
        email: 'amina.bello@ptdf.gov.ng',
        phone: '+234 803 123 4567',
        company: 'PTDF Consulting',
        department: 'Infrastructure',
        region: 'North Central',
        activeProjects: 3,
        completedProjects: 12,
        rating: 4.8,
        specialization: 'Civil Engineering',
        joinedDate: '2023-01-15',
        status: 'Active'
    },
    {
        id: '2',
        name: 'Engr. Chukwuma Okafor',
        email: 'c.okafor@ptdf.gov.ng',
        phone: '+234 805 987 6543',
        company: 'PTDF Consulting',
        department: 'ICT',
        region: 'South East',
        activeProjects: 2,
        completedProjects: 8,
        rating: 4.5,
        specialization: 'Information Technology',
        joinedDate: '2023-03-20',
        status: 'Active'
    },
    {
        id: '3',
        name: 'Mrs. Fatima Yusuf',
        email: 'f.yusuf@ptdf.gov.ng',
        phone: '+234 807 456 7890',
        company: 'PTDF Consulting',
        department: 'Education',
        region: 'North West',
        activeProjects: 4,
        completedProjects: 15,
        rating: 4.9,
        specialization: 'Educational Infrastructure',
        joinedDate: '2022-11-10',
        status: 'Active'
    },
    {
        id: '4',
        name: 'Mr. Oluwaseun Adeyemi',
        email: 'o.adeyemi@ptdf.gov.ng',
        phone: '+234 809 234 5678',
        company: 'PTDF Consulting',
        department: 'Healthcare',
        region: 'South West',
        activeProjects: 1,
        completedProjects: 6,
        rating: 4.3,
        specialization: 'Medical Facilities',
        joinedDate: '2023-06-05',
        status: 'Active'
    },
    {
        id: '5',
        name: 'Arch. Ibrahim Mohammed',
        email: 'i.mohammed@ptdf.gov.ng',
        phone: '+234 802 345 6789',
        company: 'PTDF Consulting',
        department: 'Infrastructure',
        region: 'North East',
        activeProjects: 0,
        completedProjects: 10,
        rating: 4.6,
        specialization: 'Architecture & Design',
        joinedDate: '2023-02-28',
        status: 'On Leave'
    }
];

// Service functions
export async function getConsultants(): Promise<Consultant[]> {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockConsultants);
        }, 300);
    });
}

export async function getConsultant(id: string): Promise<Consultant | undefined> {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            const consultant = mockConsultants.find(c => c.id === id);
            resolve(consultant);
        }, 300);
    });
}

export async function inviteConsultant(email: string): Promise<{ success: boolean; message: string }> {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: `Invitation sent to ${email}`
            });
        }, 500);
    });
}

export async function updateConsultantRating(consultantId: string, rating: number): Promise<void> {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            const consultant = mockConsultants.find(c => c.id === consultantId);
            if (consultant) {
                consultant.rating = rating;
            }
            resolve();
        }, 300);
    });
}
