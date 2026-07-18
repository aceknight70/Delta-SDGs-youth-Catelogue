export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Hidden';
export type AttendanceType = 'Physical' | 'Remote';

export interface Participant {
  id: number;
  first_name: string;
  age: number;
  location_area: string;
  story: string | null;
  parent_photo_url: string | null;
  parent_quote: string | null;
  guardian_consent: boolean;
  application_status: ApplicationStatus;
  attendance_type: AttendanceType;
  participant_photo_url: string | null;
  participant_access_pin: string;
  creation_photo_limit: number;
  bonus_creation_photo_slots: number;
  bonus_expires_at: string | null;
  supported_by?: string;
  sdg_goal_focus?: string;
  cheer_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Creation {
  id: number;
  participant_id: number;
  project_title: string;
  project_category: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type StoryType = 'Short Story' | 'Poem' | 'Novel Excerpt' | 'Personal Reflection';

export interface Story {
  id: number;
  participant_id: number;
  title: string;
  story_type: StoryType | null;
  written_text: string;
  featured_in_sdg_museum: boolean;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Branding {
  logo_url: string;
  main_title: string;
  subtitle: string;
  tagline: string;
  founder_note: string;
}

export function generatePin(firstName: string, id: number): string {
  const prefix = firstName.substring(0, 2).toUpperCase().padEnd(2, 'X');
  const idStr = id.toString().padStart(4, '0');
  return `${prefix}${idStr}`;
}

export interface CohortInterest {
  id?: number;
  parent_name: string;
  child_name: string;
  child_age: number;
  location: string;
  phone_whatsapp: string;
  email: string;
  supporting_organization?: string;
  created_at?: string;
}

export type ConnectionRequestStatus = 'Pending' | 'Forwarded' | 'Declined';

export interface ConnectionRequest {
  id?: number;
  participant_id: number;
  requester_name: string;
  requester_contact: string;
  message: string;
  status: ConnectionRequestStatus;
  created_at?: string;
  forwarded_at?: string;
}

export const CATEGORIES = [
  'Recycled Fashion',
  'Solar & Renewable Energy Projects',
  'Art & Illustration',
  'Community Solutions',
  'Coding & Robotics',
  'Woodworking & Craft',
  'Music & Performing Arts',
  'Environmental Conservation',
  'Agriculture & Farming Projects',
  'Health & Hygiene Awareness',
  'Creative Writing',
  'Culinary Arts'
];

export const STORY_TYPES: StoryType[] = [
  'Short Story', 'Poem', 'Novel Excerpt', 'Personal Reflection'
];
