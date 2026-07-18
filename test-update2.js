import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('sdg_camp_youth_participants')
    .update({ application_status: 'Approved' })
    .eq('id', 1)
    .select()
    .single();
  console.log('Update to Approved:', data ? 'OK' : data, error);

  const { data: data2, error: error2 } = await supabase.from('sdg_camp_youth_participants')
    .update({ application_status: 'Hidden' })
    .eq('id', 1)
    .select()
    .single();
  console.log('Update to Hidden:', data2 ? 'OK' : data2, error2);
}
run();
