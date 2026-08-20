import {
  User,
  VolunteerProfile,
  HourSubmission,
  VolunteerStats,
  Notification,
  AuditLog,
  SystemStats,
  StaffStatsSummary,
  MonthlyStatsItem,
  SchoolStatsItem,
  TopVolunteerItem,
  PublicVolunteerDetail,
  PublicReview,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('volunteer_portal_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'Error en el servidor';
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async register(body: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<{
      message: string;
      token: string;
      user: User;
      profile: VolunteerProfile;
    }>(res);
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{
      message: string;
      token: string;
      user: User;
      profile: VolunteerProfile;
      stats?: VolunteerStats;
    }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      user: User;
      profile: VolunteerProfile;
      stats?: VolunteerStats;
    }>(res);
  },

  async updateProfile(profileData: Partial<VolunteerProfile>) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse<{ message: string; profile: VolunteerProfile }>(res);
  },

  async createStaff(staffData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role?: 'STAFF' | 'ADMIN';
    secret_key: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/create-staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(staffData),
    });
    return handleResponse<{ message: string; user?: User; profile?: VolunteerProfile }>(res);
  },

  async createStaffAccount(staffData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role?: 'STAFF' | 'ADMIN';
    secret_key: string;
  }) {
    return this.createStaff(staffData);
  },

  // Submissions (Volunteer)
  async checkDuplicate(date: string, activity_name: string, start_time: string) {
    const res = await fetch(`${API_BASE}/submissions/check-duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ date, activity_name, start_time }),
    });
    return handleResponse<{
      is_duplicate: boolean;
      message?: string;
      existing_submission?: any;
    }>(res);
  },

  async submitHours(submissionData: {
    activity_name: string;
    organization_name: string;
    date: string;
    start_time?: string;
    end_time?: string;
    manual_hours?: number;
    manual_minutes?: number;
    location?: string;
    description: string;
    supervisor_name: string;
    proof_file_url?: string;
    proof_file_name?: string;
  }) {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(submissionData),
    });
    return handleResponse<{ message: string; submission: HourSubmission }>(res);
  },

  async getMySubmissions(status?: string, search?: string) {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/submissions/my?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      submissions: HourSubmission[];
      stats: VolunteerStats;
    }>(res);
  },

  async getSubmissionDetails(id: string) {
    const res = await fetch(`${API_BASE}/submissions/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ submission: HourSubmission }>(res);
  },

  async correctSubmission(id: string, correctionData: any) {
    const res = await fetch(`${API_BASE}/submissions/${id}/correct`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(correctionData),
    });
    return handleResponse<{ message: string; submission: HourSubmission }>(res);
  },

  async cancelSubmission(id: string) {
    const res = await fetch(`${API_BASE}/submissions/${id}/cancel`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string; submission: HourSubmission }>(res);
  },

  // AI Text-to-Hours Processing & Batch Submission
  async extractHoursAI(raw_text: string) {
    const res = await fetch(`${API_BASE}/ai/extract-hours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ raw_text }),
    });
    return handleResponse<{
      success: boolean;
      source: string;
      entries: any[];
      message: string;
    }>(res);
  },

  async submitBatchHours(items: any[]) {
    const res = await fetch(`${API_BASE}/ai/batch-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ items }),
    });
    return handleResponse<{
      success: boolean;
      count: number;
      total_minutes: number;
      submissions: any[];
      message: string;
    }>(res);
  },

  // Public Volunteers, Ranking & Community Reviews
  async getPublicVolunteers(filters?: { search?: string; school?: string; sort?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.school && filters.school !== 'ALL') params.append('school', filters.school);
    if (filters?.sort) params.append('sort', filters.sort);

    const res = await fetch(`${API_BASE}/public/volunteers?${params.toString()}`);
    return handleResponse<{
      success: boolean;
      total: number;
      volunteers: PublicVolunteerDetail[];
    }>(res);
  },

  async getTopRanking() {
    const res = await fetch(`${API_BASE}/public/top-ranking`);
    return handleResponse<{ success: boolean; top: PublicVolunteerDetail[] }>(res);
  },

  async getSilverCord160Honorees() {
    const res = await fetch(`${API_BASE}/public/silver-cord-160`);
    return handleResponse<{
      success: boolean;
      milestone_target: number;
      total: number;
      honorees: Array<{
        id: string;
        volunteer_id: string;
        first_name: string;
        last_name: string;
        school: string;
        approved_minutes: number;
        approved_hours: number;
        rank: string;
        rating_avg: number;
        rating_count: number;
        certificate_code?: string;
        completed_date?: string;
      }>;
    }>(res);
  },

  async getPublicVolunteerDetail(id: string) {
    const res = await fetch(`${API_BASE}/public/volunteers/${id}`);
    return handleResponse<{ success: boolean; volunteer: PublicVolunteerDetail }>(res);
  },

  async getVolunteerReviews(id: string) {
    const res = await fetch(`${API_BASE}/public/volunteers/${id}/reviews`);
    return handleResponse<{ success: boolean; reviews: PublicReview[]; count: number; rating_avg: number }>(res);
  },

  async submitVolunteerReview(
    id: string,
    data: { rating: number; reviewer_name?: string; reviewer_relation?: string; message?: string }
  ) {
    const res = await fetch(`${API_BASE}/public/volunteers/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{
      success: boolean;
      message: string;
      review: PublicReview;
      rating_avg: number;
      rating_count: number;
    }>(res);
  },

  async reportVolunteerReview(
    reviewId: string,
    data: { reason: string; reporter_name?: string; details?: string }
  ) {
    const res = await fetch(`${API_BASE}/public/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{
      success: boolean;
      message: string;
      report: any;
    }>(res);
  },

  async getStaffReviewReports() {
    const res = await fetch(`${API_BASE}/public/staff/reports`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; reports: any[] }>(res);
  },

  async deleteReviewByStaff(reviewId: string, reason?: string) {
    const res = await fetch(`${API_BASE}/public/staff/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{
      success: boolean;
      message: string;
      volunteer_id: string;
    }>(res);
  },

  async dismissReviewReport(reportId: string, note?: string) {
    const res = await fetch(`${API_BASE}/public/staff/reports/${reportId}/dismiss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ note }),
    });
    return handleResponse<{
      success: boolean;
      message: string;
      report: any;
    }>(res);
  },

  // Certificates (Volunteer & Public Verification)
  async getMyCertificates() {
    const res = await fetch(`${API_BASE}/certificates/my`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ certificates: any[] }>(res);
  },

  async getCertificateById(id: string) {
    const res = await fetch(`${API_BASE}/certificates/${id}`);
    return handleResponse<{ certificate: any }>(res);
  },

  async getAllCertificatesStaff() {
    const res = await fetch(`${API_BASE}/certificates/staff/all`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ certificates: any[] }>(res);
  },

  async issueManualCertificate(data: { volunteer_id: string; hours_milestone: number; reason?: string }) {
    const res = await fetch(`${API_BASE}/certificates/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; certificate: any }>(res);
  },

  // Submissions (Staff)
  async getAllSubmissions(
    statusOrFilters?: string | { status?: string; search?: string; school?: string },
    search?: string
  ) {
    const params = new URLSearchParams();
    if (typeof statusOrFilters === 'string') {
      if (statusOrFilters && statusOrFilters !== 'ALL') params.append('status', statusOrFilters);
      if (search) params.append('search', search);
    } else if (statusOrFilters) {
      if (statusOrFilters.status && statusOrFilters.status !== 'ALL')
        params.append('status', statusOrFilters.status);
      if (statusOrFilters.search) params.append('search', statusOrFilters.search);
      if (statusOrFilters.school && statusOrFilters.school !== 'ALL')
        params.append('school', statusOrFilters.school);
    }

    const res = await fetch(`${API_BASE}/submissions?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ submissions: HourSubmission[] }>(res);
  },

  async approveSubmission(id: string, approved_minutes?: number, review_note?: string) {
    const res = await fetch(`${API_BASE}/submissions/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ approved_minutes, review_note }),
    });
    return handleResponse<{ message: string; submission: HourSubmission }>(res);
  },

  async rejectSubmission(id: string, rejection_reason: string, rejection_comment?: string) {
    const res = await fetch(`${API_BASE}/submissions/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ rejection_reason, rejection_comment }),
    });
    return handleResponse<{ message: string; submission: HourSubmission }>(res);
  },

  async requestCorrection(id: string, staff_message: string) {
    const res = await fetch(`${API_BASE}/submissions/${id}/request-correction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ staff_message }),
    });
    return handleResponse<{ message: string; submission: HourSubmission }>(res);
  },

  // Volunteers (Staff)
  async getVolunteers(
    searchOrFilters?:
      | string
      | {
          search?: string;
          school?: string;
          min_hours?: string;
          max_hours?: string;
          sort_by?: string;
        }
  ) {
    const params = new URLSearchParams();
    if (typeof searchOrFilters === 'string') {
      if (searchOrFilters) params.append('search', searchOrFilters);
    } else if (searchOrFilters) {
      if (searchOrFilters.search) params.append('search', searchOrFilters.search);
      if (searchOrFilters.school && searchOrFilters.school !== 'ALL')
        params.append('school', searchOrFilters.school);
      if (searchOrFilters.min_hours) params.append('min_hours', searchOrFilters.min_hours);
      if (searchOrFilters.max_hours) params.append('max_hours', searchOrFilters.max_hours);
      if (searchOrFilters.sort_by) params.append('sort_by', searchOrFilters.sort_by);
    }

    const res = await fetch(`${API_BASE}/volunteers?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      volunteers: (VolunteerProfile & {
        stats?: {
          approved_minutes: number;
          pending_minutes: number;
          total_submissions: number;
          rejected_count: number;
        };
      })[];
    }>(res);
  },

  async getVolunteerProfile(id: string) {
    const res = await fetch(`${API_BASE}/volunteers/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      profile: VolunteerProfile;
      stats: VolunteerStats & { total_submissions: number };
      submissions: HourSubmission[];
    }>(res);
  },

  async getVolunteerDetails(id: string) {
    return this.getVolunteerProfile(id);
  },

  // Stats (Staff)
  async getSystemStats() {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<any>(res);
    return {
      stats: {
        total_volunteers: data.summary?.total_volunteers || 0,
        active_volunteers: data.summary?.active_volunteers || 0,
        total_approved_minutes: data.summary?.approved_minutes_total || 0,
        approved_minutes_this_month: data.summary?.approved_minutes_this_month || 0,
        approved_minutes_this_year: data.summary?.approved_minutes_this_year || 0,
        pending_submissions: data.summary?.pending_submissions_count || 0,
        pending_minutes_total: data.summary?.pending_minutes_total || 0,
        approved_submissions: data.summary?.approved_submissions_count || 0,
        rejected_submissions: data.summary?.rejected_submissions_count || 0,
        needs_correction_submissions: data.summary?.needs_correction_count || 0,
        total_submissions:
          (data.summary?.approved_submissions_count || 0) +
          (data.summary?.pending_submissions_count || 0) +
          (data.summary?.rejected_submissions_count || 0) +
          (data.summary?.needs_correction_count || 0),
        school_stats: (data.schoolDistribution || []).map((s: any) => ({
          school: s.school,
          minutes: s.horas * 60,
          volunteers_count: s.voluntarios,
        })),
        top_volunteers: (data.topVolunteers || []).map((v: any) => ({
          id: v.id,
          volunteer_id: v.volunteer_id,
          name: v.name,
          school: v.school,
          minutes: v.approved_minutes || v.hours_number * 60,
          submissions: 1,
        })),
        monthly_breakdown: (data.monthlyData || []).map((m: any) => ({
          month: m.month,
          minutes: m.horas * 60,
          submissions: m.solicitudes,
        })),
      } as SystemStats,
    };
  },

  async getStaffStats() {
    return this.getSystemStats();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ notifications: Notification[]; unreadCount: number }>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Audit Logs (Staff)
  async getAuditLogs(filters?: { action?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.action && filters.action !== 'ALL') params.append('action', filters.action);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/audit?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ logs: AuditLog[] }>(res);
  },

  // Public Hub API
  async getPublicEvents(filters?: { status?: string; search?: string; timeframe?: string }) {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.timeframe) params.append('timeframe', filters.timeframe);

    const res = await fetch(`${API_BASE}/events?${params.toString()}`);
    return handleResponse<{ events: any[] }>(res);
  },

  async getPublicEventDetail(id: string) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    return handleResponse<{ event: any }>(res);
  },

  async sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; success: boolean }>(res);
  },

  async getPublicResources(category?: string) {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category);
    const res = await fetch(`${API_BASE}/resources?${params.toString()}`);
    return handleResponse<{ resources: any[] }>(res);
  },

  // ==========================================
  // PHASE 2: EVENT APPLICATIONS (VOLUNTEER)
  // ==========================================
  async applyToEvent(eventId: string) {
    const res = await fetch(`${API_BASE}/events/${eventId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse<{ message: string; application: any }>(res);
  },

  async getMyApplications() {
    const res = await fetch(`${API_BASE}/events/user/my-applications`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ applications: any[] }>(res);
  },

  async getMyAcceptedEvents() {
    const res = await fetch(`${API_BASE}/events/user/my-events`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ events: any[] }>(res);
  },

  async cancelApplication(applicationId: string, reason?: string) {
    const res = await fetch(`${API_BASE}/events/applications/${applicationId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{ message: string; status: string }>(res);
  },

  // ==========================================
  // PHASE 2: EVENT REVIEW & MANAGEMENT (STAFF)
  // ==========================================
  async getStaffApplications(filters?: {
    event_id?: string;
    status?: string;
    school?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.event_id && filters.event_id !== 'ALL') params.append('event_id', filters.event_id);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.school && filters.school !== 'ALL') params.append('school', filters.school);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/events/staff/applications?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      applications: any[];
      counters: {
        pending: number;
        accepted: number;
        waitlist: number;
        rejected: number;
        total: number;
      };
    }>(res);
  },

  async getApplicationDetails(applicationId: string) {
    const res = await fetch(`${API_BASE}/events/applications/${applicationId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ application: any; volunteerProfile?: any }>(res);
  },

  async acceptApplication(applicationId: string, staff_message?: string) {
    const res = await fetch(`${API_BASE}/events/staff/applications/${applicationId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ staff_message }),
    });
    return handleResponse<{ message: string; application: any; available_spots?: number }>(res);
  },

  async rejectApplication(applicationId: string, rejection_reason: string, staff_message?: string) {
    const res = await fetch(`${API_BASE}/events/staff/applications/${applicationId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ rejection_reason, staff_message }),
    });
    return handleResponse<{ message: string; application: any }>(res);
  },

  async waitlistApplication(applicationId: string, staff_message?: string) {
    const res = await fetch(`${API_BASE}/events/staff/applications/${applicationId}/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ staff_message }),
    });
    return handleResponse<{ message: string; application: any }>(res);
  },

  async getAllEventsStaff(includeDrafts: boolean = true) {
    const params = new URLSearchParams();
    if (includeDrafts) params.append('include_drafts', 'true');
    const res = await fetch(`${API_BASE}/events?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ events: any[] }>(res);
  },

  async getStaffEvents(includeDrafts: boolean = true) {
    return this.getAllEventsStaff(includeDrafts);
  },

  async createEvent(eventData: any) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse<{ message: string; event: any }>(res);
  },

  async updateEvent(id: string, eventData: any) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse<{ message: string; event: any }>(res);
  },

  async publishEvent(id: string) {
    const res = await fetch(`${API_BASE}/events/${id}/publish`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string; event: any }>(res);
  },

  async closeEvent(id: string) {
    const res = await fetch(`${API_BASE}/events/${id}/close`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string; event: any }>(res);
  },

  async cancelEvent(id: string, reason?: string) {
    const res = await fetch(`${API_BASE}/events/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{ message: string; event: any }>(res);
  },

  async deleteApplication(applicationId: string) {
    const res = await fetch(`${API_BASE}/events/applications/${applicationId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  async deleteSubmission(submissionId: string) {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },
};

/**
 * Format minutes into Spanish duration string
 */
export function formatMinutes(totalMinutes: number | null | undefined): string {
  if (totalMinutes === null || totalMinutes === undefined || totalMinutes <= 0) {
    return '0 min';
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} h ${minutes} min`;
  } else if (hours > 0) {
    return `${hours} h`;
  } else {
    return `${minutes} min`;
  }
}
