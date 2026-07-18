import { supabase } from './supabase';
import { Participant, Creation, Story, Branding, generatePin } from '../types';

export const db = {
  // Branding (Using LocalStorage as fallback since no table was provided)
  async getBranding(): Promise<Branding> {
    const data = localStorage.getItem('youth_branding');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.founder_note === undefined) {
         parsed.founder_note = "Every child deserves a platform to show what they're capable of — even if they can't be at camp in person. We are incredibly proud of these young minds.";
      }
      return parsed;
    }
    return {
      logo_url: '',
      main_title: 'Delta SDGs Youngsters',
      subtitle: 'Youth Catalogue',
      tagline: 'Young innovators shaping the future',
      founder_note: "Every child deserves a platform to show what they're capable of — even if they can't be at camp in person. We are incredibly proud of these young minds.",
    };
  },
  async updateBranding(data: Branding): Promise<void> {
    localStorage.setItem('youth_branding', JSON.stringify(data));
  },

  // Participants
  async getParticipants(): Promise<Participant[]> {
    const { data, error } = await supabase.from('sdg_camp_youth_participants').select('*');
    if (error) {
      console.error("Error fetching participants from Supabase:", error);
      return [];
    }
    
    if (!data || !Array.isArray(data)) return [];

    // Sort descending by id or created_at in memory
    const sorted = [...data].sort((a, b) => {
      try {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
          return timeB - timeA;
        }
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      } catch (e) {
        return 0;
      }
    });
    return sorted;
  },
  
  async getParticipant(id: number): Promise<Participant | null> {
    const { data, error } = await supabase.from('sdg_camp_youth_participants').select('*').eq('id', id).single();
    if (error) {
      console.error("Error fetching participant", error);
      return null;
    }
    return data as Participant;
  },
  
  async saveParticipant(participant: Partial<Participant>): Promise<Participant | null> {
    // If it's a new participant (no ID), we insert, then generate PIN based on ID, then update
    if (!participant.id) {
      // Remove any placeholder pin so DB handles it or we handle it next
      const tempParticipant = { ...participant };
      delete tempParticipant.id;
      
      const { data, error } = await supabase
        .from('sdg_camp_youth_participants')
        .insert([tempParticipant])
        .select()
        .single();
        
      if (error) {
        console.error("Error saving participant:", error);
        throw error;
      }
      
      const newParticipant = data as Participant;
      // Now generate PIN
      const pin = generatePin(newParticipant.first_name, newParticipant.id);
      
      const { data: updated, error: updateError } = await supabase
        .from('sdg_camp_youth_participants')
        .update({ participant_access_pin: pin })
        .eq('id', newParticipant.id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      return updated as Participant;
    } else {
      const { id, created_at, updated_at, ...updateData } = participant as any;
      const { data, error } = await supabase
        .from('sdg_camp_youth_participants')
        .update(updateData)
        .eq('id', participant.id)
        .select()
        .single();
      if (error) {
        console.error("Error updating participant:", error);
        throw error;
      }
      return data as Participant;
    }
  },
  
  // Creations
  async getCreations(): Promise<Creation[]> {
    const { data, error } = await supabase.from('sdg_camp_youth_creations').select('*');
    if (error) return [];
    return (data as Creation[]).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },
  
  async getCreationsByParticipant(participantId: number): Promise<Creation[]> {
    const { data, error } = await supabase.from('sdg_camp_youth_creations').select('*').eq('participant_id', participantId);
    if (error) return [];
    return (data as Creation[]).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },
  
  async getAllCreations(): Promise<Creation[]> {
    const { data, error } = await supabase.from('sdg_camp_youth_creations').select('*');
    if (error) {
      console.error("Error fetching all creations from Supabase:", error);
      return [];
    }
    return data as Creation[];
  },
  
  async saveCreation(creation: Partial<Creation>): Promise<Creation | null> {
    const toSave = { ...creation };
    if (!toSave.id) delete toSave.id;
    
    if (toSave.id) {
      const { id, created_at, updated_at, ...updateData } = toSave as any;
      const { data, error } = await supabase.from('sdg_camp_youth_creations').update(updateData).eq('id', toSave.id).select().single();
      if (error) throw error;
      return data as Creation;
    } else {
      const { data, error } = await supabase.from('sdg_camp_youth_creations').insert([toSave]).select().single();
      if (error) throw error;
      return data as Creation;
    }
  },
  
  async deleteCreation(id: number): Promise<void> {
    const { error } = await supabase.from('sdg_camp_youth_creations').delete().eq('id', id);
    if (error) throw error;
  },

  // Stories
  async getStories(): Promise<Story[]> {
    const { data, error } = await supabase.from('sdg_camp_youth_stories').select('*');
    if (error) {
      console.error("Error fetching stories from Supabase:", error);
      return [];
    }
    return (data as Story[]).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },
  
  async getStoriesByParticipant(participantId: number): Promise<Story[]> {
    const { data, error } = await supabase.from('sdg_camp_youth_stories').select('*').eq('participant_id', participantId);
    if (error) return [];
    return (data as Story[]).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },
  
  async saveStory(story: Partial<Story>): Promise<Story | null> {
    const toSave = { ...story };
    if (!toSave.id) delete toSave.id;
    
    if (toSave.id) {
      const { id, created_at, updated_at, ...updateData } = toSave as any;
      const { data, error } = await supabase.from('sdg_camp_youth_stories').update(updateData).eq('id', toSave.id).select().single();
      if (error) throw error;
      return data as Story;
    } else {
      const { data, error } = await supabase.from('sdg_camp_youth_stories').insert([toSave]).select().single();
      if (error) throw error;
      return data as Story;
    }
  },
  
  async deleteStory(id: number): Promise<void> {
    const { error } = await supabase.from('sdg_camp_youth_stories').delete().eq('id', id);
    if (error) throw error;
  },

  // Live Counter
  async getApprovedCount(): Promise<number> {
    const { count, error } = await supabase
      .from('sdg_camp_youth_participants')
      .select('*', { count: 'exact', head: true })
      .eq('application_status', 'Approved')
      .eq('guardian_consent', true);
      
    if (error) {
      console.error("Error fetching approved count from Supabase:", error);
      return 0;
    }
    return count || 0;
  },

  // Interest Form
  async saveCohortInterest(interest: any): Promise<void> {
    const { error } = await supabase.from('sdg_youth_next_cohort_interest').insert([interest]);
    if (error) throw error;
  },

  // Cheers
  async incrementCheer(participantId: number): Promise<void> {
    // Standard supabase rpc or update. 
    // Since we don't have an RPC for increment, we can fetch, then increment. 
    // Wait, Supabase allows simple increments if we use RPC, but without it we can just do:
    const { data } = await supabase.from('sdg_camp_youth_participants').select('cheer_count').eq('id', participantId).single();
    if (data) {
      const newCount = (data.cheer_count || 0) + 1;
      await supabase.from('sdg_camp_youth_participants').update({ cheer_count: newCount }).eq('id', participantId);
    }
  },

  // Connection Requests
  async saveConnectionRequest(request: any): Promise<void> {
    const { error } = await supabase.from('sdg_youth_connection_requests').insert([request]);
    if (error) throw error;
  },

  async getConnectionRequests(): Promise<any[]> {
    const { data, error } = await supabase.from('sdg_youth_connection_requests').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data;
  },

  async updateConnectionRequestStatus(id: number, status: string): Promise<void> {
    const updateData: any = { status };
    if (status === 'Forwarded') {
      updateData.forwarded_at = new Date().toISOString();
    }
    const { error } = await supabase.from('sdg_youth_connection_requests').update(updateData).eq('id', id);
    if (error) throw error;
  }
};
