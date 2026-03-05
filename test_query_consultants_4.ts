import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkProjects() {
    const { data: p, error: pErr } = await supabase.from('projects').select('id, title, status, milestones(id, title, status)');
    console.log("Projects and Milestones:");
    console.log(JSON.stringify(p, null, 2));

    const { data: c, error: cErr } = await supabase.rpc('rpc_admin_list_consultants');
    console.log("List Consultants Data:");
    console.log(JSON.stringify(c, null, 2));
}

checkProjects();
