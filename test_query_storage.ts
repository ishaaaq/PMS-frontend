import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkStorage() {
    // 1. Get recent submissions
    const { data: subs } = await supabase.from('submissions').select('id, milestone_id').order('submitted_at', { ascending: false }).limit(5);
    console.log("Recent Submissions:", subs);

    if (subs && subs.length > 0) {
        for (const sub of subs) {
            // Get project ID
            const { data: ms } = await supabase.from('milestones').select('project_id').eq('id', sub.milestone_id).single();
            if (ms) {
                const projectId = ms.project_id;
                const milestoneId = sub.milestone_id;
                const submissionId = sub.id;

                const folderPath = `project/${projectId}/milestone/${milestoneId}/submission/${submissionId}`;
                console.log(`Checking path: ${folderPath}`);

                const { data: files, error } = await supabase.storage.from('submission-evidence').list(folderPath);
                console.log(`Files in ${folderPath}:`, files?.length || 0, files);

                // Check one level up (maybe it's not nested in submission ID?)
                const parentPath = `project/${projectId}/milestone/${milestoneId}`;
                const { data: parentFiles } = await supabase.storage.from('submission-evidence').list(parentPath);
                console.log(`Files in ${parentPath}:`, parentFiles?.length || 0, parentFiles);
            }
        }
    }
}

checkStorage();
