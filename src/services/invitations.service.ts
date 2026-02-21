import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'
import type { UserRole } from '../contexts/AuthContext';

export interface Invitation {
    id: string;
    invitee_email: string;
    role: UserRole;
    project_id?: string;
    section_id?: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
}
export const InvitationsService = {
    async createInvitation(email: string, role: string, projectId?: string, sectionId?: string) {
        const { data, error } = await supabase.rpc(
            'rpc_create_invitation',
            {
                p_invitee_email: email,
                p_role: role,
                p_project_id: projectId ?? null,
                p_section_id: sectionId ?? null
            }
        )
        if (error) {
            logRpcError('rpc_create_invitation', error)
            throw error
        }
        return data
    },

    async getPendingInvitation(invitationId: string): Promise<Invitation> {
        const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('id', invitationId)
            .eq('status', 'PENDING')
            .single()

        if (error || !data) {
            throw new Error('This invitation is invalid, expired, or has already been accepted.')
        }

        return data as Invitation
    },

    async acceptInvitationWithDetails(params: {
        invitationId: string
        authUserId: string
        fullName: string
        phone: string
        role: UserRole
        contractorData?: { companyName: string; registrationNumber: string; zone: string }
        consultantData?: { specialization: string; department: string; region: string }
    }): Promise<void> {
        const { error } = await supabase.rpc('rpc_accept_invitation_with_details', {
            p_invitation_id: params.invitationId,
            p_auth_user_id: params.authUserId,
            p_full_name: params.fullName,
            p_phone: params.phone,

            p_company_name: params.contractorData?.companyName || null,
            p_registration_number: params.contractorData?.registrationNumber || null,
            p_zone: params.contractorData?.zone || null,

            p_specialization: params.consultantData?.specialization || null,
            p_department: params.consultantData?.department || null,
            p_region: params.consultantData?.region || null
        })

        if (error) {
            logRpcError('rpc_accept_invitation_with_details', error)
            throw new Error(error.message || 'Verification failed. Please try again.')
        }
    }
}
