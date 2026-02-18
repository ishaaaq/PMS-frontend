import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

export const NotificationsService = {
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
    }
}
