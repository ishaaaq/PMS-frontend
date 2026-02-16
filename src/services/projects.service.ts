import { supabase } from '@/lib/supabase'

export const ProjectsService = {
    async createProject(payload: Record<string, unknown>) {
        const { data, error } = await supabase.rpc(
            'rpc_create_project',
            { payload }
        )
        if (error) throw error
        return data
    },

    async assignConsultant(projectId: string, consultantId: string) {
        const { error } = await supabase.rpc(
            'rpc_assign_consultant_to_project',
            {
                p_project_id: projectId,
                p_consultant_user_id: consultantId
            }
        )
        if (error) throw error
    },

    async getMyProjects() {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
        if (error) throw error
        return data
    }
}
