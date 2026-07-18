import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: list } = await supabase.from('sdg_camp_youth_participants').select('*').limit(1);
  const p = list[0];
  const updated = { ...p, application_status: 'Hidden' };
  
  const { data, error } = await supabase.from('sdg_camp_youth_participants')
    .update(updated)
    .eq('id', p.id)
    .select()
    .single();
  console.log(error);
}
run();
