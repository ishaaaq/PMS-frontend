import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function debugConsultants() {
    // 1. Get ALL project_consultants
    const { data: pc } = await supabase.from('project_consultants').select('*');
    console.log("ALL project_consultants records:", pc);

    // 2. Get section_assignments
    const { data: sa } = await supabase.from('section_assignments').select('*');
    if (sa && sa.length > 0) {
        console.log(`Found ${sa.length} section_assignments.`);
        const consultantAssignments = sa.filter(a => a.consultant_user_id !== null);
        console.log("section_assignments with a consultant_user_id:", consultantAssignments);
    }
}

debugConsultants();
