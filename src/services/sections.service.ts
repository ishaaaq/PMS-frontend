import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

export const SectionsService = {
  async createSection(projectId: string, name: string, description: string, milestoneIds: string[]) {
    const { data, error } = await supabase.rpc(
      'rpc_create_section',
      {
        p_project_id: projectId,
        p_name: name,
        p_description: description,
        p_milestone_ids: milestoneIds
      }
    )
    if (error) {
      logRpcError('rpc_create_section', error)
      throw error
    }
    return data
  },

  async assignContractor(sectionId: string, contractorId: string) {
    const { error } = await supabase.rpc(
      'rpc_assign_contractor_to_section',
      {
        p_section_id: sectionId,
        p_contractor_user_id: contractorId
      }
    )
    if (error) {
      logRpcError('rpc_assign_contractor_to_section', error)
      throw error
    }
  },

  async getProjectSections(projectId: string) {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('project_id', projectId)

    if (error) {
      logRpcError('sections.select', error)
      throw error
    }
    return data
  }
}
