import { supabase } from '@/lib/supabase'

export interface DashboardStats {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    activeConsultants: number
    pendingSubmissions: number
    completionRate: number
}

export interface TopContractor {
    name: string
    rating: number
    projectCount: number
}

export interface ZoneCluster {
    name: string
    projectCount: number
    progress: number
}

export interface RiskAlert {
    id: string
    projectTitle: string
    location: string
    intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    reason: string
    createdAt: string
    isResolved: boolean
}

export interface PerformanceSnapshot {
    month: number
    year: number
    plannedProgress: number
    actualProgress: number
}

export interface BudgetOverview {
    totalAllocated: number
    totalDisbursed: number
    totalSpent: number
    remainingBalance: number
    currency: string
}

export interface Disbursement {
    id: string
    projectTitle: string
    amount: number
    date: string
    status: string
    approvedBy: string
}

export const DashboardService = {
    async getStats(): Promise<DashboardStats> {
        try {
            const { data: projects } = await supabase
                .from('projects')
                .select('id, status')

            const total = projects?.length || 0
            const active = projects?.filter(p => p.status === 'ACTIVE').length || 0
            const completed = projects?.filter(p => p.status === 'COMPLETED').length || 0

            const { count: consultantCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'CONSULTANT')
                .eq('is_active', true)

            const { count: pendingCount } = await supabase
                .from('submissions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'PENDING_APPROVAL')

            return {
                totalProjects: total,
                activeProjects: active,
                completedProjects: completed,
                activeConsultants: consultantCount || 0,
                pendingSubmissions: pendingCount || 0,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            }
        } catch (err) {
            console.error('DashboardService.getStats error', err)
            return {
                totalProjects: 0, activeProjects: 0, completedProjects: 0,
                activeConsultants: 0, pendingSubmissions: 0, completionRate: 0,
            }
        }
    },

    async getTopContractors(): Promise<TopContractor[]> {
        try {
            const { data: contractors } = await supabase
                .from('profiles')
                .select('user_id, full_name, rating')
                .eq('role', 'CONTRACTOR')
                .eq('is_active', true)
                .order('rating', { ascending: false })
                .limit(5)

            if (!contractors || contractors.length === 0) return []

            const result: TopContractor[] = []
            for (const c of contractors) {
                const { count } = await supabase
                    .from('project_contractors')
                    .select('*', { count: 'exact', head: true })
                    .eq('contractor_user_id', c.user_id)

                result.push({
                    name: c.full_name || 'Unknown',
                    rating: Number(c.rating) || 0,
                    projectCount: count || 0,
                })
            }
            return result
        } catch (err) {
            console.error('DashboardService.getTopContractors error', err)
            return []
        }
    },

    async getZoneClusters(): Promise<ZoneCluster[]> {
        try {
            const { data: projects } = await supabase
                .from('projects')
                .select('location, progress, status')

            if (!projects || projects.length === 0) return []

            const zoneMap = new Map<string, { count: number; totalProgress: number }>()
            for (const p of projects) {
                const zone = p.location?.split(',')[0]?.trim() || 'Unknown'
                const existing = zoneMap.get(zone) || { count: 0, totalProgress: 0 }
                existing.count++
                existing.totalProgress += Number(p.progress || 0)
                zoneMap.set(zone, existing)
            }

            return Array.from(zoneMap.entries())
                .map(([name, data]) => ({
                    name,
                    projectCount: data.count,
                    progress: Math.round(data.totalProgress / data.count),
                }))
                .sort((a, b) => b.projectCount - a.projectCount)
                .slice(0, 6)
        } catch (err) {
            console.error('DashboardService.getZoneClusters error', err)
            return []
        }
    },

    async getRiskAlerts(): Promise<RiskAlert[]> {
        try {
            const { data, error } = await supabase
                .from('risk_alerts')
                .select(`
                    id, reason, intensity, location, is_resolved, created_at,
                    project:project_id ( title )
                `)
                .eq('is_resolved', false)
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) {
                console.warn('risk_alerts query failed, trying simple fallback:', error)
                const { data: simple } = await supabase
                    .from('risk_alerts')
                    .select('*')
                    .eq('is_resolved', false)
                    .order('created_at', { ascending: false })
                    .limit(10)
                return (simple || []).map((r: Record<string, unknown>) => ({
                    id: r.id as string,
                    projectTitle: 'Unknown Project',
                    location: (r.location as string) || '',
                    intensity: r.intensity as RiskAlert['intensity'],
                    reason: (r.reason as string) || '',
                    createdAt: r.created_at as string,
                    isResolved: r.is_resolved as boolean,
                }))
            }

            return (data || []).map((r: Record<string, unknown>) => {
                const project = r.project as { title?: string } | null
                return {
                    id: r.id as string,
                    projectTitle: project?.title || 'Unknown Project',
                    location: (r.location as string) || '',
                    intensity: r.intensity as RiskAlert['intensity'],
                    reason: (r.reason as string) || '',
                    createdAt: r.created_at as string,
                    isResolved: r.is_resolved as boolean,
                }
            })
        } catch (err) {
            console.error('DashboardService.getRiskAlerts error', err)
            return []
        }
    },

    async getPerformanceSnapshots(year?: number): Promise<PerformanceSnapshot[]> {
        try {
            const targetYear = year || new Date().getFullYear()
            const { data, error } = await supabase
                .from('performance_snapshots')
                .select('month, year, planned_progress, actual_progress')
                .eq('year', targetYear)
                .order('month', { ascending: true })

            if (error) {
                console.warn('performance_snapshots query failed:', error)
                return []
            }

            return (data || []).map(s => ({
                month: s.month,
                year: s.year,
                plannedProgress: Number(s.planned_progress),
                actualProgress: Number(s.actual_progress),
            }))
        } catch (err) {
            console.error('DashboardService.getPerformanceSnapshots error', err)
            return []
        }
    },

    async getBudgetOverview(): Promise<BudgetOverview> {
        try {
            const { data, error } = await supabase
                .from('budget_allocations')
                .select('allocated_amount, disbursed_amount, spent_amount')

            if (error) {
                console.warn('budget_allocations query failed:', error)
                return { totalAllocated: 0, totalDisbursed: 0, totalSpent: 0, remainingBalance: 0, currency: 'NGN' }
            }

            const totals = (data || []).reduce(
                (acc, row) => ({
                    allocated: acc.allocated + Number(row.allocated_amount || 0),
                    disbursed: acc.disbursed + Number(row.disbursed_amount || 0),
                    spent: acc.spent + Number(row.spent_amount || 0),
                }),
                { allocated: 0, disbursed: 0, spent: 0 }
            )

            return {
                totalAllocated: totals.allocated,
                totalDisbursed: totals.disbursed,
                totalSpent: totals.spent,
                remainingBalance: totals.allocated - totals.disbursed,
                currency: 'NGN',
            }
        } catch (err) {
            console.error('DashboardService.getBudgetOverview error', err)
            return { totalAllocated: 0, totalDisbursed: 0, totalSpent: 0, remainingBalance: 0, currency: 'NGN' }
        }
    },

    async getRecentDisbursements(): Promise<Disbursement[]> {
        try {
            const { data, error } = await supabase
                .from('disbursements')
                .select(`
                    id, amount, status, created_at,
                    project:project_id ( title ),
                    approver:approved_by ( full_name )
                `)
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) {
                console.warn('disbursements query failed, trying simple fallback:', error)
                const { data: simple } = await supabase
                    .from('disbursements')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10)
                return (simple || []).map((d: Record<string, unknown>) => ({
                    id: d.id as string,
                    projectTitle: 'Unknown',
                    amount: Number(d.amount),
                    date: d.created_at as string,
                    status: d.status as string,
                    approvedBy: 'System',
                }))
            }

            return (data || []).map((d: Record<string, unknown>) => {
                const project = d.project as { title?: string } | null
                const approver = d.approver as { full_name?: string } | null
                return {
                    id: d.id as string,
                    projectTitle: project?.title || 'Unknown',
                    amount: Number(d.amount),
                    date: d.created_at as string,
                    status: d.status as string,
                    approvedBy: approver?.full_name || 'System',
                }
            })
        } catch (err) {
            console.error('DashboardService.getRecentDisbursements error', err)
            return []
        }
    },
}
