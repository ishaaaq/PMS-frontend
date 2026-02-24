import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

// Submission status values as stored in the DB.
// PENDING_APPROVAL = needs consultant action (approve or query)
export const SUBMISSION_STATUS = {
    PENDING: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    QUERIED: 'QUERIED',
} as const

export type SubmissionStatus = typeof SUBMISSION_STATUS[keyof typeof SUBMISSION_STATUS]

export interface VerificationSubmission {
    id: string
    milestoneId: string
    milestone: string
    project: string
    projectId: string
    contractor: string
    submitted: string
    submittedRaw: string
    status: 'pending' | 'approved' | 'queried'
    location: string
    workDescription: string | null
    priority: 'high' | 'normal'
}

function mapStatus(dbStatus: string): 'pending' | 'approved' | 'queried' {
    if (dbStatus === SUBMISSION_STATUS.APPROVED) return 'approved'
    if (dbStatus === SUBMISSION_STATUS.QUERIED) return 'queried'
    return 'pending'
}

/**
 * Single source of truth for the consultant verification queue.
 *
 * RLS on `submissions` ensures the consultant only sees submissions
 * for projects they are assigned to — no extra client-side filter needed.
 *
 * For contractor names: profiles RLS blocks consultants from reading
 * other users' profiles directly. We use the existing SECURITY DEFINER
 * RPC `rpc_get_project_contractors` (from 06_fix_profiles_rls.sql) to
 * resolve contractor names per-project after the initial fetch.
 *
 * @param opts.status  Optionally filter to a specific DB status string.
 * @param opts.projectId  Optionally restrict to one project.
 */
export const SubmissionsVerificationService = {
    async getConsultantVerificationQueue(opts: {
        status?: SubmissionStatus
        projectId?: string
    } = {}): Promise<VerificationSubmission[]> {
        try {
            // Step 1: Fetch submissions with milestone+project joins.
            // These joins work because consultant RLS allows reading
            // milestones and projects. The contractor FK join to profiles
            // is OMITTED because profiles RLS blocks it.
            let query = supabase
                .from('submissions')
                .select(`
                    id,
                    status,
                    submitted_at,
                    work_description,
                    milestone_id,
                    contractor_user_id,
                    milestone:milestone_id (
                        id,
                        title,
                        due_date,
                        project_id,
                        project:project_id ( id, title, location )
                    )
                `)
                .order('submitted_at', { ascending: false })

            if (opts.status) {
                query = query.eq('status', opts.status)
            }

            const { data, error } = await query

            if (error) {
                logRpcError('submissions.getConsultantVerificationQueue', error)
                return []
            }

            if (!data || data.length === 0) return []

            // Step 2: Resolve contractor names via SECURITY DEFINER RPC.
            // Collect unique project IDs, then call rpc_get_project_contractors
            // for each project to build a contractor_user_id → name map.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const projectIds = [...new Set(data.map((item: any) => {
                const m = item.milestone
                return m?.project?.id || m?.project_id
            }).filter(Boolean))]

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const contractorNameMap: Record<string, string> = {}

            // Fetch contractor names for each project in parallel
            await Promise.all(projectIds.map(async (pid: string) => {
                try {
                    const { data: contractors } = await supabase.rpc(
                        'rpc_get_project_contractors',
                        { p_project_id: pid }
                    )
                    if (contractors) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        for (const c of contractors as any[]) {
                            contractorNameMap[c.contractor_user_id] = c.full_name || 'Unknown'
                        }
                    }
                } catch {
                    // If RPC fails for a project, contractor names stay unknown
                    console.warn(`Failed to fetch contractors for project ${pid}`)
                }
            }))

            // Step 3: Map rows to VerificationSubmission, injecting contractor names
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let result = data.map((item: any) => {
                const milestone = item.milestone
                const project = milestone?.project

                return {
                    id: item.id,
                    milestoneId: item.milestone_id,
                    milestone: milestone?.title || 'Unknown Milestone',
                    project: project?.title || 'Unknown Project',
                    projectId: project?.id || '',
                    contractor: contractorNameMap[item.contractor_user_id] || 'Unknown Contractor',
                    submitted: item.submitted_at
                        ? new Date(item.submitted_at).toLocaleDateString()
                        : '—',
                    submittedRaw: item.submitted_at,
                    status: mapStatus(item.status),
                    location: project?.location || '—',
                    workDescription: item.work_description || null,
                    priority: 'normal' as const,
                }
            })

            // Optionally filter by project on the client side (post-join)
            if (opts.projectId) {
                result = result.filter(s => s.projectId === opts.projectId)
            }

            return result
        } catch (err) {
            console.error('SubmissionsVerificationService.getConsultantVerificationQueue error', err)
            return []
        }
    },

    async approveSubmission(submissionId: string): Promise<void> {
        const { error } = await supabase.rpc('rpc_approve_submission', {
            p_submission_id: submissionId,
        })
        if (error) {
            logRpcError('rpc_approve_submission', error)
            throw error
        }
    },

    async querySubmission(submissionId: string, note: string): Promise<void> {
        const { error } = await supabase.rpc('rpc_query_submission', {
            p_submission_id: submissionId,
            p_query_note: note,
        })
        if (error) {
            logRpcError('rpc_query_submission', error)
            throw error
        }
    },
}
