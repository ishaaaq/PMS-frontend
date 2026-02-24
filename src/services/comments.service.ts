import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

export const CommentsService = {
    async addProjectComment(projectId: string, body: string) {
        const { data, error } = await supabase.rpc(
            'rpc_add_project_comment',
            {
                p_project_id: projectId,
                p_body: body
            }
        )
        if (error) {
            logRpcError('rpc_add_project_comment', error)
            throw error
        }
        return data
    },

    /**
     * Fetch project comments with author display names.
     *
     * Primary path: SECURITY DEFINER RPC that joins profiles server-side
     * (bypasses profiles RLS so consultants can see other users' names).
     *
     * Fallback: direct PostgREST query with FK join — works for admin
     * (whose RLS allows reading all profiles) but returns null author
     * for consultant/contractor roles.
     */
    async getProjectComments(projectId: string) {
        // --- Primary: RPC (works for ALL roles) ---
        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
                'rpc_get_project_comments_with_authors',
                { p_project_id: projectId }
            )

            if (!rpcError && rpcData) {
                // Map flat RPC rows → shape expected by CommentsSection UI:
                //   { id, body, created_at, author: { full_name, role } }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return rpcData.map((row: any) => ({
                    id: row.comment_id,
                    body: row.body,
                    created_at: row.created_at,
                    author: {
                        full_name: row.author_full_name,
                        role: row.author_role,
                    },
                }))
            }

            // RPC not deployed yet or returned error — fall through to direct query
            if (rpcError) {
                console.warn('rpc_get_project_comments_with_authors failed, falling back to direct query', rpcError)
            }
        } catch (err) {
            console.warn('RPC call failed, falling back to direct query', err)
        }

        // --- Fallback: direct PostgREST query (works for admin only) ---
        try {
            const { data, error } = await supabase
                .from('project_comments')
                .select(`
                    *,
                    author:author_user_id ( full_name, role )
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })

            if (error) {
                console.warn('Comments direct query with join failed', error)
                const { data: simpleData } = await supabase
                    .from('project_comments')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: false })
                return simpleData || []
            }
            return data || []
        } catch (err) {
            console.error('getProjectComments unexpected error', err)
            return []
        }
    }
}
