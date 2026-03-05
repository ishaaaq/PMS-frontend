import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function debugConsultants() {
    // 2. Get section_assignments
    const { data: sa, error: saErr } = await supabase.from('section_assignments').select('*');
    console.log("section_assignments:", sa, "Error:", saErr);

    // 3. Get projects
    const { data: p, error: pErr } = await supabase.from('projects').select('*');
    console.log("projects:", p, "Error:", pErr);
}

debugConsultants();
