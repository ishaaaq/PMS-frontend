import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

export const ProjectsService = {
    async createProject(payload: Record<string, unknown>) {
        const { data, error } = await supabase.rpc(
            'rpc_create_project',
            { payload }
        )
        if (error) {
            logRpcError('rpc_create_project', error)
            throw error
        }
        return data
    },

    async assignConsultant(projectId: string, consultantId: string) {
        if (!projectId || !consultantId) {
            console.error('assignConsultant called with missing args:', { projectId, consultantId });
            throw new Error('Project ID and Consultant ID are required');
        }
        const { error } = await supabase.rpc(
            'rpc_assign_consultant_to_project',
            {
                p_project_id: projectId,
                p_consultant_user_id: consultantId
            }
        )
        if (error) {
            logRpcError('rpc_assign_consultant_to_project', error)
            throw error
        }
    },

    async addContractorToProject(projectId: string, contractorId: string) {
        if (!projectId || !contractorId) {
            console.error('addContractorToProject called with missing args:', { projectId, contractorId });
            throw new Error('Project ID and Contractor ID are required');
        }
        const { error } = await supabase.rpc(
            'rpc_add_contractor_to_project',
            {
                p_project_id: projectId,
                p_contractor_user_id: contractorId
            }
        )
        if (error) {
            logRpcError('rpc_add_contractor_to_project', error)
            throw error
        }
    },

    async getMyProjects() {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
        if (error) {
            logRpcError('projects.select', error)
            throw error
        }
        return data
    }
}
