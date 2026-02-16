import { supabase } from '@/lib/supabase'

export const InvitationsService = {
    async createInvitation(email: string, role: string, projectId: string, sectionId?: string) {
        const { data, error } = await supabase.rpc(
            'rpc_create_invitation',
            {
                p_invitee_email: email,
                p_role: role,
                p_project_id: projectId,
                p_section_id: sectionId ?? null
            }
        )
        if (error) throw error
        return data
    }
}
