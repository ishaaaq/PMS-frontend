import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

const BUCKET = 'submission-evidence'

export const StorageService = {
    /**
     * Upload a single evidence file to Supabase Storage.
     * Path: project/{projectId}/milestone/{milestoneId}/submission/{submissionId}/{suffix}_{filename}
     * Returns the storage path (not a URL).
     */
    async uploadEvidence(
        projectId: string,
        milestoneId: string,
        submissionId: string,
        file: File
    ): Promise<string> {
        // Use a sanitized filename to ensure idempotency (prevent duplicates on retry)
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
        const path = `project/${projectId}/milestone/${milestoneId}/submission/${submissionId}/${safeName}`
        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { upsert: true })
        if (error) {
            logRpcError('storage.upload', error)
            throw error
        }
        return path
    },

    /**
     * Get a signed URL for a storage path with a 1-hour expiry.
     */
    async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(path, expiresIn)
        if (error) {
            logRpcError('storage.createSignedUrl', error)
            throw error
        }
        return data.signedUrl
    },

    /**
     * Get signed URLs for multiple storage paths in a single API call.
     * Returns an array of { path, signedUrl, error } in the same order as the input.
     */
    async getSignedUrls(paths: string[], expiresIn = 3600): Promise<{ path: string | null; signedUrl: string; error: string | null }[]> {
        if (paths.length === 0) return []
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .createSignedUrls(paths, expiresIn)
        if (error) {
            logRpcError('storage.createSignedUrls', error)
            return []
        }
        return data || []
    },

    /**
     * List all files in a storage folder. Returns the file names (relative to the folder).
     */
    async listFiles(folderPath: string): Promise<{ name: string; metadata?: Record<string, string> }[]> {
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .list(folderPath)
        if (error) {
            logRpcError('storage.list', error)
            return []
        }
        // Filter out folder placeholders (Supabase returns a ".emptyFolderPlaceholder" file)
        return (data || []).filter(f => f.name !== '.emptyFolderPlaceholder')
    }
}
