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
        // Append a random suffix to prevent filename collisions and evidence tampering
        const suffix = crypto.randomUUID().slice(0, 8)
        const safeName = `${suffix}_${file.name}`
        const path = `project/${projectId}/milestone/${milestoneId}/submission/${submissionId}/${safeName}`
        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { upsert: false })
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
