export type UserRole = 'VOLUNTEER' | 'STAFF' | 'ADMIN';

export type HourStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'NEEDS_CORRECTION' 
  | 'CORRECTED' 
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface VolunteerProfile {
  id: string;
  user_id: string;
  volunteer_id: string; // VOL-00001
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  school: string;
  grade?: string;
  organization?: string;
  languages: string[];
  join_date: string;
  bio?: string;
  avatar_url?: string;
  profile_completed: boolean;
  goal_hours?: number; // User personal goal (e.g. 50)
  approved_minutes?: number;
  pending_minutes?: number;
  total_submissions?: number;
  created_at: string;
  updated_at: string;
  stats?: {
    approved_minutes: number;
    pending_minutes: number;
    total_submissions: number;
    rejected_count: number;
  };
}

export interface HourSubmission {
  id: string;
  volunteer_id: string;
  user_id: string;
  volunteer_code: string;
  volunteer_name: string;
  school: string;
  activity_name: string;
  organization_name: string;
  date: string;
  start_time: string;
  end_time: string;
  submitted_minutes: number;
  approved_minutes: number | null;
  location?: string;
  description: string;
  supervisor_name: string;
  proof_file_url?: string;
  proof_file_name?: string;
  status: HourStatus;
  staff_message?: string;
  rejection_reason?: string;
  rejection_comment?: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  previous_data?: any;
  correction_notes?: string;
  // Event linkage (Bloque A)
  event_id?: string;
  event_application_id?: string;
  event_scheduled_minutes?: number;
  source?: 'EVENT' | 'MANUAL' | 'STAFF_CREDIT';
  arrival_time?: string;
  departure_time?: string;
  is_attended?: boolean;
  created_at: string;
  updated_at: string;
}

export interface VolunteerStats {
  approved_minutes: number;
  pending_minutes: number;
  this_month_minutes: number;
  this_year_minutes?: number;
  rejected_count: number;
  total_submissions?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  related_submission_id?: string | null;
  related_event_id?: string | null;
  related_application_id?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name?: string;
  actor_name?: string;
  actor_role?: string;
  role: string;
  action: string;
  target_id: string;
  target_type?: string;
  details?: any;
  previous_value?: any;
  new_value?: any;
  reason?: string | null;
  timestamp: string;
  created_at: string;
}

export interface SystemStats {
  total_volunteers: number;
  active_volunteers: number;
  total_approved_minutes: number;
  approved_minutes_total?: number;
  approved_minutes_this_month: number;
  approved_minutes_this_year: number;
  pending_submissions: number;
  pending_submissions_count?: number;
  pending_minutes_total: number;
  approved_submissions: number;
  approved_submissions_count?: number;
  rejected_submissions: number;
  rejected_submissions_count?: number;
  needs_correction_submissions: number;
  needs_correction_count?: number;
  total_submissions: number;
  total_events?: number;
  active_events?: number;
  total_applications?: number;
  school_stats: {
    school: string;
    minutes: number;
    volunteers_count: number;
  }[];
  top_volunteers: {
    id: string;
    volunteer_id: string;
    name: string;
    school: string;
    minutes: number;
    submissions: number;
  }[];
  monthly_breakdown: {
    month: string;
    minutes: number;
    submissions: number;
  }[];
}

export type StaffStatsSummary = SystemStats;

export interface MonthlyStatsItem {
  month: string;
  horas: number;
  solicitudes: number;
}

export interface SchoolStatsItem {
  school: string;
  horas: number;
  voluntarios: number;
}

export interface TopVolunteerItem {
  id: string;
  volunteer_id: string;
  name: string;
  school: string;
  approved_minutes: number;
  hours_formatted: string;
  hours_number: number;
  avatar_url?: string;
}

export type EventStatus = 
  | 'DRAFT'
  | 'OPEN'
  | 'FEW_SPOTS'
  | 'FULL'
  | 'CLOSED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type ApplicationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WAITLIST'
  | 'REJECTED'
  | 'CANCELLED';

export interface EventItem {
  id: string;
  title: string;
  short_description: string;
  description: string;
  image_url?: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  estimated_minutes: number;
  total_spots: number;
  available_spots: number;
  accepted_count?: number;
  pending_count?: number;
  languages: string[];
  requirements: string[];
  min_age?: number;
  important_info?: string;
  organizer: string;
  status: EventStatus;
  code: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EventApplication {
  id: string;
  event_id: string;
  volunteer_id: string;
  user_id: string;
  volunteer_name: string;
  volunteer_code: string;
  school: string;
  languages: string[];
  status: ApplicationStatus;
  applied_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  staff_message?: string;
  // Attendance & Hour Submission tracking (Bloque A / C)
  attended?: boolean | null; // true = Asistió, false = No asistió, null/undefined = pendiente
  attendance_marked_at?: string;
  attendance_marked_by?: string;
  attendance_note?: string;
  hours_submitted?: boolean;
  hour_submission_id?: string;
  created_at: string;
  updated_at: string;
  event?: EventItem;
}

export interface Certificate {
  id: string;
  volunteer_id: string; // Profile ID
  user_id: string;
  volunteer_code: string;
  volunteer_name: string;
  school: string;
  hours_milestone: number; // 10, 25, 50, 100 or custom
  certificate_code: string; // CERT-2026-XXXXX
  issue_date: string;
  verified_minutes: number;
  created_by: string; // 'SYSTEM' | Staff Name
  reason?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'ALL' | 'VOLUNTEER' | 'STAFF';
  active: boolean;
  category?: 'info' | 'urgent' | 'event';
  expires_at?: string;
  created_by: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  event_id?: string;
  event_title?: string;
  date: string;
  created_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  published: boolean;
  order: number;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: 'voluntariado' | 'guias' | 'capacitaciones' | 'informacion' | 'ayuda' | 'faq';
  url?: string;
  icon?: string;
  created_at: string;
}

export interface PodiumMedal {
  place: 1 | 2 | 3;
  tier: 'GOLD' | 'SILVER' | 'BRONZE';
  name: string;
  title: string;
  subtitle: string;
  icon: string;
  color_gradient: string;
  badge_bg: string;
  border_color: string;
  text_color: string;
  glow_color: string;
  is_active: boolean;
  is_permanent: boolean;
  days_on_podium: number;
  description: string;
}

export interface PublicVolunteerDetail {
  id: string;
  volunteer_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  school?: string;
  organization?: string;
  approved_hours: number;
  approved_minutes: number;
  rating_avg: number;
  rating_count: number;
  total_submissions?: number;
  total_approved_submissions?: number;
  join_date?: string;
  bio?: string;
  languages?: string[];
  rank?: number;
  podium_place?: 1 | 2 | 3 | null;
  podium_medals?: PodiumMedal[];
  certificates?: Certificate[];
  reviews?: PublicReview[];
}

export interface PublicReview {
  id: string;
  volunteer_id: string;
  rating: number;
  reviewer_name: string;
  reviewer_relation?: string;
  message?: string;
  is_reported?: boolean;
  created_at: string;
}

export interface ReviewReport {
  id: string;
  review_id: string;
  volunteer_id: string;
  volunteer_name: string;
  reporter_name?: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'RESOLVED_DELETED' | 'RESOLVED_DISMISSED';
  review_snapshot: PublicReview;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  staff_resolution_note?: string;
}
