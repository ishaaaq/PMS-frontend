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
        try {
            const { data, error } = await supabase
                .from('project_comments')
                .select(`
                    *,
                    author:author_user_id ( full_name, role )
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })

            if (error) {
                // Fallback: try without join
                console.warn('Comments with author join failed, trying simple fallback', error)
                const { data: simpleData } = await supabase
                    .from('project_comments')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: false })
                return simpleData || []
            }
            return data || []
        } catch (err) {
            console.error('getProjectComments unexpected error', err)
            return []
        }
    }
}
