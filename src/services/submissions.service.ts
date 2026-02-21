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

    async getProjectSubmissions(projectId: string) {
        try {
            // First get all milestone IDs for this project
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

            // Use PostgREST FK hint for disambiguation since submissions has
            // two FKs to profiles (contractor_user_id, reviewed_by_consultant_id)
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
                // Fallback: try without joins if FK hint names don't match
                console.warn('Submissions with joins failed, trying simple fallback', error)
                const { data: simpleData, error: simpleErr } = await supabase
                    .from('submissions')
                    .select('*')
                    .in('milestone_id', milestoneIds)
                    .order('submitted_at', { ascending: false })

                if (simpleErr) {
                    logRpcError('submissions.getProjectSubmissions.fallback', simpleErr)
                    return []
                }
                return simpleData || []
            }
            return data || []
        } catch (err) {
            console.error('getProjectSubmissions unexpected error', err)
            return []
        }
    }

}
