import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkOldStorage() {
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('Available Buckets:', buckets?.map(b => b.name));

    if (buckets) {
        for (const bucket of buckets) {
            const { data: files } = await supabase.storage.from(bucket.name).list();
            console.log('Root Folders in bucket ' + bucket.name + ':', files && files.length > 0 ? files.map(f => f.name) : 'None');
        }
    }
}
checkOldStorage();
