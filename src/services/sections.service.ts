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
  },

  /** Sections with assigned contractor info (name, user_id) */
  async getProjectSectionsDetailed(projectId: string) {
    const { data, error } = await supabase
      .from('sections')
      .select(`
        id, name, description, created_at,
        section_assignments (
          contractor_user_id,
          profiles:contractor_user_id ( full_name )
        )
      `)
      .eq('project_id', projectId)

    if (error) {
      logRpcError('sections.detailed', error)
      throw error
    }
    return data
  },

  /** Map of section_id → milestone_id[] for a project */
  async getSectionMilestoneMap(projectId: string) {
    const { data, error } = await supabase
      .from('section_milestones')
      .select('section_id, milestone_id, sections!inner(project_id)')
      .eq('sections.project_id', projectId)

    if (error) {
      logRpcError('section_milestones.select', error)
      throw error
    }
    return data as { section_id: string; milestone_id: string }[]
  },

  /** All milestones for a project (ordered by sort_order) */
  async getProjectMilestones(projectId: string) {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order')

    if (error) {
      logRpcError('milestones.select', error)
      throw error
    }
    return data
  }
}
