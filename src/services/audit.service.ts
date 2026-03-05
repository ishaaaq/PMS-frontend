import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
    id: string;
    action: string;
    actor_user_id: string;
    project_id?: string;
    section_id?: string;
    milestone_id?: string;
    submission_id?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

export class AuditService {
    /**
     * Fetches recent activity for a specific user.
     * @param userId The ID of the user whose activity to fetch.
     * @param limit The maximum number of records to return (default: 15).
     */
    static async getUserRecentActivity(userId: string, limit: number = 15): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase.rpc('rpc_get_user_recent_activity', {
            p_user_id: userId,
            p_limit: limit
        });

        if (error) {
            console.error('Error fetching user activity from audit_logs:', error);
            throw error;
        }

        return data || [];
    }
}
