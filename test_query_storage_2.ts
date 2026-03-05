import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkStorage() {
    const { data: subs } = await supabase.from('submissions').select('id, milestone_id').order('submitted_at', { ascending: true }).limit(5);
    console.log('Oldest Submissions:', subs);

    if (subs && subs.length > 0) {
        for (const sub of subs) {
            const { data: ms } = await supabase.from('milestones').select('project_id').eq('id', sub.milestone_id).single();
            if (ms) {
                const projectId = ms.project_id;

                // Check expected nested path
                const folderPath = 'project/' + projectId + '/milestone/' + sub.milestone_id + '/submission/' + sub.id;
                const { data: files } = await supabase.storage.from('submission-evidence').list(folderPath);
                console.log('Files in ' + folderPath + ':', files && files.length > 0 ? files.map(f => f.name) : 'None');

                // Check one level up (maybe older uploads didn't use submissionId)
                const olderPath = 'project/' + projectId + '/milestone/' + sub.milestone_id;
                const { data: olderFiles } = await supabase.storage.from('submission-evidence').list(olderPath);

                // Filter out folders
                const onlyFiles = olderFiles?.filter(f => !f.id && f.name !== '.emptyFolderPlaceholder') || [];
                console.log('Direct Files in ' + olderPath + ':', onlyFiles.length > 0 ? onlyFiles.map(f => f.name) : 'None');
            }
        }
    }
}
checkStorage();
