import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkStorage() {
    const { data: rootFolders, error } = await supabase.storage.from('submission-evidence').list();
    console.log("Root Folders:", rootFolders);

    if (rootFolders && rootFolders.length > 0) {
        for (const f of rootFolders) {
            if (f.name !== '.emptyFolderPlaceholder') {
                const { data: subFiles } = await supabase.storage.from('submission-evidence').list(f.name);
                console.log(`Contents of ${f.name}:`, subFiles);
            }
        }
    }
}
checkStorage();
