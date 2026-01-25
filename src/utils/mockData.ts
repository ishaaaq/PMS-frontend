import { CreditCard, PieChart, TrendingUp, Calendar, FileText, BarChart3, Clock } from 'lucide-react';

/**
 * Generates an array of random numbers within a range.
 */
export const generateRandomSeries = (length: number, min: number, max: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

export const BUDGET_STATS = [
    { label: 'Total Allocated', amount: '₦14.2B', change: '+2.4%', type: 'up' as const, icon: PieChart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Disbursed', amount: '₦8.1B', change: '+12.1%', type: 'up' as const, icon: CreditCard, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Actual Expenditure', amount: '₦6.5B', change: '+5.4%', type: 'up' as const, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Remaining Balance', amount: '₦6.1B', change: '-1.4%', type: 'down' as const, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

export const RECENT_DISBURSEMENTS = [
    { id: 1, project: 'Lagos ICT Hub', amount: '₦45,000,000', date: 'Jan 20, 2026', status: 'Completed', logo: 'JB', user: 'System Admin' },
    { id: 2, project: 'Kaduna School Renovation', amount: '₦12,500,000', date: 'Jan 18, 2026', status: 'Pending', logo: 'SW', user: 'Fin. Controller' },
    { id: 3, project: 'Enugu Road Construction', amount: '₦88,200,000', date: 'Jan 15, 2026', status: 'Completed', logo: 'RC', user: 'System Admin' },
    { id: 4, project: 'Scholarship Fund Batch A', amount: '₦150,000,000', date: 'Jan 12, 2026', status: 'Processing', logo: 'SF', user: 'Bursary' },
    { id: 5, project: 'Facility Maintenance', amount: '₦5,400,000', date: 'Jan 10, 2026', status: 'Completed', logo: 'FM', user: 'Ops Manager' },
];

export const REPORT_TEMPLATES = [
    { id: 1, title: 'Project Status Summary', description: 'Consolidated report of all active and completed projects.', lastGenerated: '2 days ago', type: 'PDF', size: '2.4 MB' },
    { id: 2, title: 'Financial Disbursement Audit', description: 'Detailed breakdown of all fund movements per milestone.', lastGenerated: '5 days ago', type: 'Excel', size: '1.1 MB' },
    { id: 3, title: 'Consultant Performance Log', description: 'Nationwide performance rating for all assigned consultants.', lastGenerated: '1 week ago', type: 'PDF', size: '850 KB' },
    { id: 4, title: 'Materials Usage Analysis', description: 'Tracking material consumption across multiple sites.', lastGenerated: 'Never', type: 'Excel', size: 'Pending' },
    { id: 5, title: 'Risk Assessment Matrix', description: 'High-level overview of critical risks per geopolitical zone.', lastGenerated: 'Just now', type: 'PDF', size: '4.2 MB' },
];

export const REPORT_STATS = [
    { label: 'Total Reports', value: '42', icon: FileText, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Data Growth', value: '+12%', icon: BarChart3, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Pending Reviews', value: '3', icon: Clock, color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Storage Used', value: '82%', icon: PieChart, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

export const CONSULTANT_RATINGS = [
    { name: 'Quantum Solutions', rating: 98, count: 12 },
    { name: 'BuildRight Ltd', rating: 85, count: 8 },
    { name: 'Metro Consultants', rating: 72, count: 15 },
    { name: 'Apex Engineering', rating: 64, count: 5 },
    { name: 'Global Tech', rating: 45, count: 3 },
];

export const FINANCIAL_CHART_DATA = [40, 60, 45, 80, 55, 90, 70, 85];


export const generateAuditLog = (offset: number) => {
    const timestamp = `2026-01-2${5 - offset} 14:3${offset}`;
    const isEven = offset % 2 === 0;
    return {
        timestamp,
        user: { initials: 'IA', name: 'Ishaq A.' },
        action: isEven ? 'Disbursement Approval' : 'Budget Re-allocation',
        details: isEven ? 'Approved funds for Kaduna Solar Project milestone 2' : 'Moved ₦12M from Reserve to Emergency Fund',
        status: 'Success'
    };
};

export const DETAILED_USERS = {
    '1': {
        id: '1',
        name: 'Ishaq Abdullahi',
        email: 'i.abdullahi@ptdf.gov.ng',
        role: 'ADMIN',
        status: 'Active',
        avatar: 'IA',
        phone: '+234 803 123 4567',
        department: 'Project Monitoring',
        location: 'Abuja Head Office',
        joinDate: 'Oct 12, 2023',
        lastLogin: 'Just now',
        mfaEnabled: true,
        permissions: ['View All Projects', 'Approve Budget', 'Manage Users', 'Export Reports', 'System Settings'],
        recentActivity: [
            { id: 101, action: 'User Login', text: 'Logged in from IP 192.168.1.1', time: 'Just now', icon: 'LogIn' },
            { id: 102, action: 'Budget Approval', text: 'Approved disbursement for #KV-2024-001', time: '2 hours ago', icon: 'CheckCircle' },
            { id: 103, action: 'Report Export', text: 'Downloaded "Q4 Financial Summary.pdf"', time: 'Yesterday', icon: 'Download' },
            { id: 104, action: 'User Invite', text: 'Invited "Emmanuel Sani" as Consultant', time: '3 days ago', icon: 'UserPlus' }
        ]
    },
    '2': {
        id: '2',
        name: 'Amina Bello',
        email: 'a.bello@consulting.com',
        role: 'CONSULTANT',
        status: 'Active',
        avatar: 'AB',
        phone: '+234 809 987 6543',
        department: 'External Consultants',
        location: 'Kaduna Zonal Office',
        joinDate: 'Jan 15, 2024',
        lastLogin: '2 hours ago',
        mfaEnabled: true,
        permissions: ['View Assigned Projects', 'Submit Reports', 'View Budget', 'Upload Documents'],
        recentActivity: [
            { id: 201, action: 'Report Submission', text: 'Submitted Milestone 3 Report for #KD-SCH-002', time: '2 hours ago', icon: 'FileText' },
            { id: 202, action: 'User Login', text: 'Logged in from IP 10.0.0.45', time: '2 hours ago', icon: 'LogIn' },
            { id: 203, action: 'Document Upload', text: 'Uploaded "Site Inspection Photos.zip"', time: 'Yesterday', icon: 'Upload' }
        ]
    }
    // ... we can fallback to generic data for others
};
