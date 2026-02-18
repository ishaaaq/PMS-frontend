import { supabase } from '@/lib/supabase';
import { logRpcError } from '@/lib/debug';
export interface BudgetSummary {
    currency: string;
    totalAllocated: number;
    amountDisbursed: number;
    amountPending: number;
    lastDisbursementDate: string;
}

export type AssignmentStatus = 'IN_PROGRESS' | 'QUERIED' | 'PENDING_APPROVAL' | 'COMPLETED';

export interface Milestone {
    id: string;
    title: string;
    progress: number;
    status: AssignmentStatus;
    dueDate: string;
    amount: number;
}

export interface Assignment {
    id: string;
    projectId: string;
    projectTitle: string;
    location: string;
    milestones: Milestone[];
    overallProgress: number;
    status: AssignmentStatus;
    lastUpdated: string;
    // Properties for current/active milestone
    dueDate?: string;
    milestoneTitle?: string;
    currentProgress?: number;
    queryReason?: string;
}

export type NotificationType = 'QUERY' | 'PAYMENT' | 'SYSTEM' | 'APPROVAL';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    projectTitle?: string;
    timestamp: string;
    isRead: boolean;
}

export const MOCK_BUDGET: BudgetSummary = {
    currency: 'NGN',
    totalAllocated: 150000000,
    amountDisbursed: 75000000,
    amountPending: 15000000,
    lastDisbursementDate: '2025-01-15',
};

export const MOCK_ASSIGNMENTS: Assignment[] = [
    {
        id: '1',
        projectId: 'p1',
        projectTitle: 'Construction of ICT Center',
        location: 'Lagos Mainland, Lagos',
        overallProgress: 65,
        status: 'QUERIED',
        lastUpdated: '2025-01-20',
        milestones: [
            { id: 'm1', title: 'Mobilization & Site Clearing', progress: 100, status: 'COMPLETED', dueDate: '2025-01-15', amount: 30000000 },
            { id: 'm2', title: 'Foundation Works', progress: 65, status: 'QUERIED', dueDate: '2025-02-28', amount: 45000000 },
            { id: 'm3', title: 'Superstructure', progress: 0, status: 'IN_PROGRESS', dueDate: '2025-05-30', amount: 40000000 },
            { id: 'm4', title: 'Roofing & Finishes', progress: 0, status: 'IN_PROGRESS', dueDate: '2025-08-15', amount: 35000000 },
        ],
    },
    {
        id: '2',
        projectId: 'p2',
        projectTitle: 'Solar Power Installation',
        location: 'Kano Municipal, Kano',
        overallProgress: 40,
        status: 'IN_PROGRESS',
        lastUpdated: '2025-01-22',
        milestones: [
            { id: 'm5', title: 'Site Survey & Planning', progress: 100, status: 'COMPLETED', dueDate: '2025-01-10', amount: 5000000 },
            { id: 'm6', title: 'Equipment Procurement', progress: 100, status: 'PENDING_APPROVAL', dueDate: '2025-01-30', amount: 50000000 },
            { id: 'm7', title: 'Installation & Testing', progress: 0, status: 'IN_PROGRESS', dueDate: '2025-04-15', amount: 30000000 },
        ],
    },
    {
        id: '3',
        projectId: 'p3',
        projectTitle: 'Bridge Rehabilitation',
        location: 'Enugu South, Enugu',
        overallProgress: 100,
        status: 'COMPLETED',
        lastUpdated: '2024-12-01',
        milestones: [
            { id: 'm8', title: 'Structural Assessment', progress: 100, status: 'COMPLETED', dueDate: '2024-09-01', amount: 10000000 },
            { id: 'm9', title: 'Repair Works', progress: 100, status: 'COMPLETED', dueDate: '2024-11-15', amount: 35000000 },
        ],
    },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        type: 'QUERY',
        title: 'Query on Foundation Works',
        message: 'Consultant requested additional photos of reinforcement work. Please update your submission.',
        projectTitle: 'Construction of ICT Center',
        timestamp: '2025-01-23T10:30:00Z',
        isRead: false,
    },
    {
        id: 'n2',
        type: 'PAYMENT',
        title: 'Payment Disbursed',
        message: 'You have received a payment of ₦30,000,000 for Mobilization & Site Clearing.',
        projectTitle: 'Construction of ICT Center',
        timestamp: '2025-01-18T14:00:00Z',
        isRead: true,
    },
    {
        id: 'n3',
        type: 'APPROVAL',
        title: 'Milestone Approved',
        message: 'Site Survey & Planning milestone has been verified and approved by the consultant.',
        projectTitle: 'Solar Power Installation',
        timestamp: '2025-01-12T09:15:00Z',
        isRead: true,
    },
    {
        id: 'n4',
        type: 'SYSTEM',
        title: 'New Project Assigned',
        message: 'You have been assigned to a new project: Bridge Rehabilitation in Enugu.',
        timestamp: '2024-08-20T08:00:00Z',
        isRead: true,
    },
    {
        id: 'n5',
        type: 'QUERY',
        title: 'Materials Log Missing',
        message: 'Please submit the materials usage log for the Equipment Procurement phase.',
        projectTitle: 'Solar Power Installation',
        timestamp: '2025-01-22T16:45:00Z',
        isRead: false,
    },
];

// Monthly earnings data for chart
export const MOCK_MONTHLY_EARNINGS = [
    { month: 'Aug', amount: 0 },
    { month: 'Sep', amount: 10000000 },
    { month: 'Oct', amount: 15000000 },
    { month: 'Nov', amount: 20000000 },
    { month: 'Dec', amount: 0 },
    { month: 'Jan', amount: 30000000 },
];

export const getContractorBudget = async (): Promise<BudgetSummary> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_BUDGET), 300));
};

export const getContractorAssignments = async (): Promise<Assignment[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get all section assignments for this contractor
    const { data, error } = await supabase
        .from('section_assignments')
        .select(`
            section_id,
            sections (
                id, name, project_id,
                projects ( id, title, location, status )
            )
        `)
        .eq('contractor_user_id', user.id);

    if (error) {
        logRpcError('getContractorAssignments', error);
        return [];
    }

    // For each section, get its milestones
    const projectMap = new Map<string, Assignment>();

    for (const row of data || []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sec = row.sections as any;
        if (!sec) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proj = sec.projects as any;
        if (!proj) continue;

        const projectId = proj.id as string;

        if (!projectMap.has(projectId)) {
            projectMap.set(projectId, {
                id: projectId,
                projectId,
                projectTitle: proj.title,
                location: proj.location || '',
                milestones: [],
                overallProgress: 0,
                status: proj.status === 'COMPLETED' ? 'COMPLETED' : proj.status === 'ACTIVE' ? 'IN_PROGRESS' : 'IN_PROGRESS',
                lastUpdated: new Date().toISOString(),
            });
        }
    }

    // Fetch milestones for each section
    const sectionIds = (data || []).map(r => r.section_id);
    if (sectionIds.length > 0) {
        const { data: smData, error: smError } = await supabase
            .from('section_milestones')
            .select('section_id, milestone_id, milestones ( id, title, status, due_date, budget )')
            .in('section_id', sectionIds);

        if (smError) {
            logRpcError('section_milestones.contractor', smError);
        }

        // Map section_id → project_id using the data we already have
        const sectionToProject = new Map<string, string>();
        for (const row of data || []) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sec = row.sections as any;
            if (sec?.projects) sectionToProject.set(row.section_id, sec.projects.id);
        }

        for (const sm of smData || []) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ms = sm.milestones as any;
            if (!ms) continue;
            const projId = sectionToProject.get(sm.section_id);
            if (!projId) continue;
            const assignment = projectMap.get(projId);
            if (!assignment) continue;

            assignment.milestones.push({
                id: ms.id,
                title: ms.title,
                progress: ms.status === 'COMPLETED' ? 100 : ms.status === 'IN_PROGRESS' ? 50 : 0,
                status: ms.status as AssignmentStatus,
                dueDate: ms.due_date,
                amount: Number(ms.budget),
            });
        }
    }

    // Calculate overall progress for each project
    for (const assignment of projectMap.values()) {
        if (assignment.milestones.length > 0) {
            const completed = assignment.milestones.filter(m => m.status === 'COMPLETED').length;
            assignment.overallProgress = Math.round((completed / assignment.milestones.length) * 100);
        }
        // Check for queried milestones
        const queried = assignment.milestones.find(m => m.status === 'QUERIED');
        if (queried) {
            assignment.status = 'QUERIED';
            assignment.milestoneTitle = queried.title;
            assignment.queryReason = 'Consultant has flagged this milestone for review.';
        }
    }

    return Array.from(projectMap.values());
};

export const getContractorNotifications = async (): Promise<Notification[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_NOTIFICATIONS), 300));
};

export const getMonthlyEarnings = async (): Promise<typeof MOCK_MONTHLY_EARNINGS> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_MONTHLY_EARNINGS), 200));
};

// Contractor Profile Types
export interface Certification {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    status: 'VALID' | 'EXPIRING' | 'EXPIRED';
}

export interface PerformanceMetric {
    label: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: string;
}

export interface ProjectPortfolioItem {
    id: string;
    title: string;
    location: string;
    completedDate: string;
    value: number;
    rating: number;
}

export interface ContractorProfile {
    id: string;
    companyName: string;
    registrationNumber: string;
    email: string;
    phone: string;
    address: string;
    logo?: string;
    description: string;
    establishedYear: number;
    employeeCount: number;
    specializations: string[];
    performanceMetrics: PerformanceMetric[];
    certifications: Certification[];
    portfolio: ProjectPortfolioItem[];
    overallRating: number;
    totalProjectsCompleted: number;
    totalContractValue: number;
}

export const MOCK_CONTRACTOR_PROFILE: ContractorProfile = {
    id: 'c1',
    companyName: 'BuildRight Construction Ltd.',
    registrationNumber: 'RC-2019-456789',
    email: 'info@buildright.ng',
    phone: '+234 803 456 7890',
    address: '15 Marina Road, Lagos Island, Lagos State',
    description: 'Leading construction company specializing in institutional buildings, solar installations, and infrastructure rehabilitation projects across Nigeria.',
    establishedYear: 2012,
    employeeCount: 85,
    specializations: ['Civil Engineering', 'Renewable Energy', 'Infrastructure', 'Building Construction'],
    performanceMetrics: [
        { label: 'On-Time Delivery', value: 94, unit: '%', trend: 'up', change: '+3%' },
        { label: 'Quality Score', value: 4.7, unit: '/5', trend: 'up', change: '+0.2' },
        { label: 'Avg Response Time', value: 2.3, unit: 'hrs', trend: 'down', change: '-0.5' },
        { label: 'Client Satisfaction', value: 96, unit: '%', trend: 'stable', change: '0%' },
    ],
    certifications: [
        { id: 'cert1', name: 'ISO 9001:2015', issuer: 'Standards Organisation of Nigeria', issueDate: '2023-03-15', expiryDate: '2026-03-14', status: 'VALID' },
        { id: 'cert2', name: 'COREN Registration', issuer: 'Council for Regulation of Engineering', issueDate: '2020-01-10', expiryDate: '2025-01-09', status: 'VALID' },
        { id: 'cert3', name: 'Health & Safety Certificate', issuer: 'Federal Ministry of Labour', issueDate: '2024-06-01', expiryDate: '2025-05-31', status: 'EXPIRING' },
    ],
    portfolio: [
        { id: 'p1', title: 'University Library Complex', location: 'Abuja', completedDate: '2024-08-15', value: 450000000, rating: 5 },
        { id: 'p2', title: 'Solar Farm Installation', location: 'Kaduna', completedDate: '2024-03-20', value: 180000000, rating: 4.5 },
        { id: 'p3', title: 'Highway Bridge Rehabilitation', location: 'Enugu', completedDate: '2023-11-10', value: 320000000, rating: 5 },
    ],
    overallRating: 4.8,
    totalProjectsCompleted: 23,
    totalContractValue: 2850000000,
};

export const getContractorProfile = async (): Promise<ContractorProfile> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CONTRACTOR_PROFILE), 300));
};

// Document Repository Types
export type DocumentType = 'CONTRACT' | 'DRAWING' | 'SPECIFICATION' | 'REPORT' | 'INVOICE' | 'CERTIFICATE' | 'OTHER';

export interface ProjectDocument {
    id: string;
    name: string;
    type: DocumentType;
    fileType: 'pdf' | 'doc' | 'xls' | 'dwg' | 'jpg' | 'png';
    size: number; // in bytes
    uploadedAt: string;
    uploadedBy: string;
    projectId: string;
    projectTitle: string;
    description?: string;
    version: string;
}

export const MOCK_DOCUMENTS: ProjectDocument[] = [
    // ICT Center Project
    { id: 'd1', name: 'Contract Agreement - ICT Center', type: 'CONTRACT', fileType: 'pdf', size: 2540000, uploadedAt: '2024-11-15', uploadedBy: 'PTDF Admin', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '1.0' },
    { id: 'd2', name: 'Architectural Drawings - Foundation', type: 'DRAWING', fileType: 'dwg', size: 15800000, uploadedAt: '2024-11-20', uploadedBy: 'Consultant', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '2.1' },
    { id: 'd3', name: 'Structural Specifications', type: 'SPECIFICATION', fileType: 'pdf', size: 4200000, uploadedAt: '2024-11-22', uploadedBy: 'Consultant', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '1.0' },
    { id: 'd4', name: 'Site Survey Report', type: 'REPORT', fileType: 'pdf', size: 8900000, uploadedAt: '2024-10-05', uploadedBy: 'Consultant', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '1.0' },
    { id: 'd5', name: 'Payment Certificate - Milestone 1', type: 'CERTIFICATE', fileType: 'pdf', size: 520000, uploadedAt: '2025-01-18', uploadedBy: 'PTDF Finance', projectId: 'p1', projectTitle: 'Construction of ICT Center', version: '1.0' },

    // Solar Power Project
    { id: 'd6', name: 'Contract Agreement - Solar Installation', type: 'CONTRACT', fileType: 'pdf', size: 1980000, uploadedAt: '2024-12-01', uploadedBy: 'PTDF Admin', projectId: 'p2', projectTitle: 'Solar Power Installation', version: '1.0' },
    { id: 'd7', name: 'Equipment Specifications', type: 'SPECIFICATION', fileType: 'pdf', size: 3400000, uploadedAt: '2024-12-10', uploadedBy: 'Consultant', projectId: 'p2', projectTitle: 'Solar Power Installation', version: '1.2' },
    { id: 'd8', name: 'Site Layout Plan', type: 'DRAWING', fileType: 'pdf', size: 6700000, uploadedAt: '2024-12-15', uploadedBy: 'Consultant', projectId: 'p2', projectTitle: 'Solar Power Installation', version: '1.0' },
    { id: 'd9', name: 'Proforma Invoice - Equipment', type: 'INVOICE', fileType: 'xls', size: 450000, uploadedAt: '2025-01-05', uploadedBy: 'Contractor', projectId: 'p2', projectTitle: 'Solar Power Installation', version: '1.0' },

    // Bridge Project
    { id: 'd10', name: 'Contract Agreement - Bridge Rehabilitation', type: 'CONTRACT', fileType: 'pdf', size: 2100000, uploadedAt: '2024-07-20', uploadedBy: 'PTDF Admin', projectId: 'p3', projectTitle: 'Bridge Rehabilitation', version: '1.0' },
    { id: 'd11', name: 'Completion Certificate', type: 'CERTIFICATE', fileType: 'pdf', size: 890000, uploadedAt: '2024-12-01', uploadedBy: 'Consultant', projectId: 'p3', projectTitle: 'Bridge Rehabilitation', version: '1.0' },
    { id: 'd12', name: 'Final Inspection Photos', type: 'OTHER', fileType: 'jpg', size: 12500000, uploadedAt: '2024-11-28', uploadedBy: 'Consultant', projectId: 'p3', projectTitle: 'Bridge Rehabilitation', description: 'Photo documentation of completed works', version: '1.0' },
];

export const getContractorDocuments = async (): Promise<ProjectDocument[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_DOCUMENTS), 350));
};
