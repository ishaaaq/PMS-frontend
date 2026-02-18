import { supabase } from '@/lib/supabase'
import { logRpcError } from '@/lib/debug'

const BUCKET = 'submission-evidence'

export const StorageService = {
    /**
     * Upload a single evidence file to Supabase Storage.
     * Path: project/{projectId}/milestone/{milestoneId}/submission/{submissionId}/{filename}
     * Returns the storage path (not a URL).
     */
    async uploadEvidence(
        projectId: string,
        milestoneId: string,
        submissionId: string,
        file: File
    ): Promise<string> {
        const path = `project/${projectId}/milestone/${milestoneId}/submission/${submissionId}/${file.name}`
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
     * Get a signed URL for a storage path with a 60-second expiry.
     */
    async getSignedUrl(path: string, expiresIn = 60): Promise<string> {
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(path, expiresIn)
        if (error) {
            logRpcError('storage.createSignedUrl', error)
            throw error
        }
        return data.signedUrl
    }
}
