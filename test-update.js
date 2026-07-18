import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('sdg_camp_youth_participants')
    .update({ application_status: 'Hidden' })
    .eq('id', 1)
    .select();
  console.log(error);
}
run();
