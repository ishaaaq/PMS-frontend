import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkRPC() {
    console.log("Calling rpc_admin_list_contractors...");
    const { data, error } = await supabase.rpc('rpc_admin_list_contractors');

    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("RPC Data type:", typeof data);
        if (Array.isArray(data)) {
            console.log("First few contractors:");
            console.log(JSON.stringify(data.slice(0, 3), null, 2));
        } else {
            console.log("Data:", data);
        }
    }
}

checkRPC();
