import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function testSchema() {
    console.log("Testing project_contractors schema...");
    const { count: countContractors, error: err1 } = await supabase.from('project_contractors').select('*', { count: 'exact', head: true });
    console.log("Project Contractors Count:", countContractors, err1);

    const { count: countConsultants, error: err2 } = await supabase.from('project_consultants').select('*', { count: 'exact', head: true });
    console.log("Project Consultants Count:", countConsultants, err2);

    const { data: cols, error: err3 } = await supabase.from('project_contractors').select('*').limit(1);
    console.log("Cols contractors:", JSON.stringify(cols));

    const { data: proj, error: err4 } = await supabase.from('projects').select('id, title, status').limit(2);
    console.log("Projects:", proj);
}

testSchema();
