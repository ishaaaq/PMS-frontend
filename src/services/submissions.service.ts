import { supabase } from '@/lib/supabase'

export const SubmissionsService = {
    async createSubmission(milestoneId: string, description: string) {
        const { data, error } = await supabase.rpc(
            'rpc_create_submission',
            {
                p_milestone_id: milestoneId,
                p_work_description: description
            }
        )
        if (error) throw error
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
        if (error) throw error
    },

    async approveSubmission(submissionId: string) {
        const { error } = await supabase.rpc(
            'rpc_approve_submission',
            {
                p_submission_id: submissionId
            }
        )
        if (error) throw error
    },

    async getMilestoneSubmissions(milestoneId: string) {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('milestone_id', milestoneId)

        if (error) throw error
        return data
    }
}
