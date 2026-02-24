import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

export const SubmissionsService = {
    async createSubmission(milestoneId: string, description: string) {
        const { data, error } = await supabase.rpc(
            'rpc_create_submission',
            {
                p_milestone_id: milestoneId,
                p_work_description: description
            }
        )
        if (error) {
            logRpcError('rpc_create_submission', error)
            throw error
        }
        return data
    },

    async querySubmission(submissionId: string, note: string) {
        const { error } = await supabase.rpc(
            'rpc_query_submission',
            {
                p_submission_id: submissionId,
                p_query_note: note
            }
        )
        if (error) {
            logRpcError('rpc_query_submission', error)
            throw error
        }
    },

    async approveSubmission(submissionId: string) {
        const { error } = await supabase.rpc(
            'rpc_approve_submission',
            {
                p_submission_id: submissionId
            }
        )
        if (error) {
            logRpcError('rpc_approve_submission', error)
            throw error
        }
    },

    async getMilestoneSubmissions(milestoneId: string) {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('milestone_id', milestoneId)

        if (error) {
            logRpcError('submissions.select', error)
            throw error
        }
        return data
    },

    async getSubmissionEvidence(submissionId: string) {
        const { data, error } = await supabase
            .from('submission_evidence')
            .select('*')
            .eq('submission_id', submissionId)

        if (error) {
            logRpcError('submission_evidence.select', error)
            throw error
        }
        return data
    },

    async getSubmissionMaterials(submissionId: string) {
        const { data, error } = await supabase
            .from('submission_materials')
            .select('*')
            .eq('submission_id', submissionId)

        if (error) {
            logRpcError('submission_materials.select', error)
            throw error
        }
        return data
    },

    /**
     * Fetch all submissions for a project with contractor, reviewer, and milestone info.
     *
     * Primary path: SECURITY DEFINER RPC that joins profiles server-side
     * (bypasses profiles RLS so consultants can see contractor/reviewer names).
     *
     * Fallback: direct PostgREST query with FK hints — works for admin
     * (whose RLS allows reading all profiles).
     */
    async getProjectSubmissions(projectId: string) {
        // --- Primary: RPC (works for ALL roles) ---
        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
                'rpc_get_project_submissions_with_profiles',
                { p_project_id: projectId }
            )

            if (!rpcError && rpcData) {
                // Map flat RPC rows → shape expected by SubmissionHistoryTab UI:
                //   { id, status, submitted_at, work_description, query_note, reviewed_at,
                //     contractor: { full_name, role }, reviewer: { full_name },
                //     milestone: { id, title, due_date, budget } }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return rpcData.map((row: any) => ({
                    id: row.submission_id,
                    status: row.status,
                    submitted_at: row.submitted_at,
                    work_description: row.work_description,
                    query_note: row.query_note,
                    reviewed_at: row.reviewed_at,
                    milestone_id: row.milestone_id,
                    contractor_user_id: row.contractor_user_id,
                    contractor: {
                        full_name: row.contractor_full_name,
                        role: row.contractor_role,
                    },
                    reviewer: row.reviewer_full_name
                        ? { full_name: row.reviewer_full_name }
                        : null,
                    milestone: {
                        id: row.milestone_id,
                        title: row.milestone_title,
                        due_date: row.milestone_due_date,
                        budget: row.milestone_budget,
                    },
                }))
            }

            if (rpcError) {
                console.warn('rpc_get_project_submissions_with_profiles failed, falling back to direct query', rpcError)
            }
        } catch (err) {
            console.warn('RPC call failed, falling back to direct query', err)
        }

        // --- Fallback: direct PostgREST query (works for admin only) ---
        try {
            const { data: milestones, error: mErr } = await supabase
                .from('milestones')
                .select('id')
                .eq('project_id', projectId)

            if (mErr) {
                logRpcError('milestones.select for submissions', mErr)
                return []
            }

            if (!milestones || milestones.length === 0) return []

            const milestoneIds = milestones.map(m => m.id)

            const { data, error } = await supabase
                .from('submissions')
                .select(`
                    *,
                    contractor:profiles!submissions_contractor_user_id_fkey ( full_name, role ),
                    reviewer:profiles!submissions_reviewed_by_consultant_id_fkey ( full_name, role ),
                    milestone:milestones!submissions_milestone_id_fkey ( id, title, due_date, budget )
                `)
                .in('milestone_id', milestoneIds)
                .order('submitted_at', { ascending: false })

            if (error) {
                console.warn('Submissions direct query with joins failed', error)
                const { data: simpleData } = await supabase
                    .from('submissions')
                    .select('*')
                    .in('milestone_id', milestoneIds)
                    .order('submitted_at', { ascending: false })
                return simpleData || []
            }
            return data || []
        } catch (err) {
            console.error('getProjectSubmissions unexpected error', err)
            return []
        }
    }
}
