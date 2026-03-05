import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkQuery() {
    // 1. Get all consultants
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('role', 'CONSULTANT');

    console.log("Consultants:", profiles);

    // 2. See if project_consultants has any rows
    const { data: pc, error: pcErr } = await supabase
        .from('project_consultants')
        .select('*');

    console.log("project_consultants records:", pc);

    // 3. See if section_assignments or sections has consultant assignments?
    // Wait, the ERD says project_consultants links consultants to projects.
}

checkQuery();
