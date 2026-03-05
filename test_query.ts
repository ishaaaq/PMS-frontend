import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkQuery() {
    console.log("Calling section_assignments query...");
    const { data, error } = await supabase
        .from('section_assignments')
        .select(`
            section_id,
            section:sections(
                project:projects(*)
            )
        `)
        .limit(1);

    if (error) {
        console.error("Query Error:", error);
    } else {
        console.log("Data:", JSON.stringify(data, null, 2));
    }
}

checkQuery();
