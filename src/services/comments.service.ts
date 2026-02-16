import { supabase } from '@/lib/supabase'

export const CommentsService = {
    async addProjectComment(projectId: string, body: string) {
        const { data, error } = await supabase.rpc(
            'rpc_add_project_comment',
            {
                p_project_id: projectId,
                p_body: body
            }
        )
        if (error) throw error
        return data
    },

    async getProjectComments(projectId: string) {
        const { data, error } = await supabase
            .from('project_comments')
            .select('*')
            .eq('project_id', projectId)

        if (error) throw error
        return data
    }
}
