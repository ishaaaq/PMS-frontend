import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

export const CommentsService = {
    async addProjectComment(projectId: string, body: string) {
        const { data, error } = await supabase.rpc(
            'rpc_add_project_comment',
            {
                p_project_id: projectId,
                p_body: body
            }
        )
        if (error) {
            logRpcError('rpc_add_project_comment', error)
            throw error
        }
        return data
    },

    async getProjectComments(projectId: string) {
        const { data, error } = await supabase
            .from('project_comments')
            .select('*')
            .eq('project_id', projectId)

        if (error) {
            logRpcError('project_comments.select', error)
            throw error
        }
        return data
    }
}
