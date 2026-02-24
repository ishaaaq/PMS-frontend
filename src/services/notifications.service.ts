import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

export interface SentNotification {
    id: string
    title: string
    message: string
    created_at: string
    section_id: string
    sectionName?: string
    projectTitle?: string
    recipientCount: number
}

export const NotificationsService = {
    /**
     * Send a notification to all contractors assigned to a section.
     * Uses rpc_send_section_notification (SECURITY DEFINER).
     */
    async sendNotification(sectionId: string, title: string, message: string) {
        const { data, error } = await supabase.rpc(
            'rpc_send_section_notification',
            {
                p_section_id: sectionId,
                p_title: title,
                p_message: message
            }
        )
        if (error) {
            logRpcError('rpc_send_section_notification', error)
            throw error
        }
        return data
    },

    /**
     * Fetch notifications previously sent by the current consultant.
     * RLS on notifications: consultant can read if is_project_consultant(section_project_id(section_id)).
     * Joins sections → projects for display names, and counts deliveries.
     */
    async getConsultantSentNotifications(): Promise<SentNotification[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    id,
                    title,
                    message,
                    created_at,
                    section_id,
                    created_by_user_id,
                    sections (
                        id,
                        name,
                        project_id,
                        projects ( id, title )
                    ),
                    notification_deliveries ( notification_id )
                `)
                .eq('created_by_user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                logRpcError('notifications.getSentNotifications', error)
                return []
            }

            if (!data) return []

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((row: any) => ({
                id: row.id,
                title: row.title,
                message: row.message,
                created_at: row.created_at,
                section_id: row.section_id,
                sectionName: row.sections?.name || undefined,
                projectTitle: row.sections?.projects?.title || undefined,
                recipientCount: Array.isArray(row.notification_deliveries)
                    ? row.notification_deliveries.length
                    : 0,
            }))
        } catch (err) {
            console.error('getConsultantSentNotifications error', err)
            return []
        }
    },

    /**
     * Fetch all projects the consultant is assigned to.
     * RLS on project_consultants: consultant_user_id = auth.uid().
     */
    async getConsultantProjects(): Promise<{ id: string; title: string }[]> {
        try {
            const { data, error } = await supabase
                .from('project_consultants')
                .select(`
                    project_id,
                    projects:project_id ( id, title )
                `)

            if (error) {
                logRpcError('project_consultants.select', error)
                return []
            }

            if (!data) return []

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((row: any) => ({
                id: row.projects?.id || row.project_id,
                title: row.projects?.title || 'Unknown Project',
            }))
        } catch (err) {
            console.error('getConsultantProjects error', err)
            return []
        }
    },

    /**
     * Fetch sections for a project with contractor assignment counts.
     * RLS on sections: is_project_consultant(project_id).
     */
    async getProjectSectionsWithContractors(projectId: string): Promise<{
        id: string
        name: string
        contractorCount: number
    }[]> {
        try {
            const { data, error } = await supabase
                .from('sections')
                .select(`
                    id,
                    name,
                    section_assignments ( contractor_user_id )
                `)
                .eq('project_id', projectId)

            if (error) {
                logRpcError('sections.withContractors', error)
                return []
            }

            if (!data) return []

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((row: any) => ({
                id: row.id,
                name: row.name,
                contractorCount: Array.isArray(row.section_assignments)
                    ? row.section_assignments.length
                    : 0,
            }))
        } catch (err) {
            console.error('getProjectSectionsWithContractors error', err)
            return []
        }
    },
}
