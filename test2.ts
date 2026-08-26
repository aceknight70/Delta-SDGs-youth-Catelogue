import { supabase } from './src/lib/supabase.ts';
(async () => {
  const { data } = await supabase.from('sdg_camp_youth_participants').select('*');
  console.log('Participants:', data?.length);
  const approved = data?.filter(p => p.application_status === 'Approved');
  console.log('Approved:', approved?.length);
  const consented = approved?.filter(p => p.guardian_consent === true);
  console.log('With consent:', consented?.length);
})();
