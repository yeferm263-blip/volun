import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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
  password_hash: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface VolunteerProfile {
  id: string;
  user_id: string;
  volunteer_id: string; // e.g., VOL-00001
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  school: string;
  grade?: string;
  organization?: string;
  languages: string[];
  join_date: string; // YYYY-MM-DD
  bio?: string;
  avatar_url?: string;
  profile_completed: boolean;
  goal_hours?: number; // Bloque B10
  approved_minutes?: number;
  total_submissions?: number;
  rating_avg?: number;
  rating_count?: number;
  created_at: string;
  updated_at: string;
}

export interface HourSubmission {
  id: string;
  volunteer_id: string; // Profile ID
  user_id: string;
  volunteer_code: string; // VOL-00001
  volunteer_name: string;
  school: string;
  activity_name: string;
  organization_name: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
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
  reviewed_by: string | null; // Staff Name & ID
  previous_data?: any;
  correction_notes?: string;
  // Bloque A Linkage
  event_id?: string;
  event_application_id?: string;
  event_scheduled_minutes?: number;
  source?: 'EVENT' | 'MANUAL' | 'STAFF_CREDIT' | 'INFINITE_CAMPUS';
  external_id?: string;
  arrival_time?: string;
  departure_time?: string;
  is_attended?: boolean;
  created_at: string;
  updated_at: string;
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
  user_name: string;
  role: string;
  action: string;
  target_id: string;
  details?: any;
  previous_value?: any;
  new_value?: any;
  reason?: string | null;
  timestamp: string;
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
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  location: string;
  estimated_minutes: number;
  total_spots: number;
  available_spots?: number; // Computed dynamically
  accepted_count?: number; // Computed dynamically
  pending_count?: number; // Computed dynamically
  languages: string[];
  requirements: string[];
  min_age?: number;
  minimum_age?: number;
  important_info?: string;
  instructions?: string;
  organizer: string;
  status: EventStatus;
  computed_status?: EventStatus;
  code: string; // e.g. REG-8214
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EventApplication {
  id: string;
  event_id: string;
  volunteer_id: string; // Profile ID
  user_id: string;
  volunteer_name: string;
  volunteer_code: string;
  school: string;
  grade?: string;
  languages: string[];
  status: ApplicationStatus;
  applied_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  staff_message?: string;
  rejection_reason?: string;
  rejection_comment?: string;
  cancelled_at?: string | null;
  cancellation_reason?: string;
  waitlisted_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  // Bloque A & C: Attendance & Hours submission tracking
  attended?: boolean | null; // true = ASISTIÓ, false = NO ASISTIÓ, null/undefined = pendiente
  attendance_marked_at?: string;
  attendance_marked_by?: string;
  attendance_note?: string;
  hours_submitted?: boolean;
  hour_submission_id?: string;
  created_at: string;
  updated_at: string;
  event?: EventItem; // Optionally populated for view responses
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
  message?: string;
  content?: string;
  audience?: 'ALL' | 'VOLUNTEER' | 'STAFF';
  target_role?: 'ALL' | 'VOLUNTEER' | 'STAFF' | string;
  priority?: string;
  is_banner?: boolean;
  active?: boolean;
  category?: 'info' | 'urgent' | 'event';
  expires_at?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  event_id?: string;
  event_title?: string;
  date: string;
  uploaded_by?: string;
  created_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  published?: boolean;
  order?: number;
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

export interface PublicReview {
  id: string;
  volunteer_id: string; // Profile ID
  rating: number; // 1 to 5
  reviewer_name: string;
  reviewer_relation?: string; // e.g. "Padre de Familia", "Maestro / Coordinador", "Compañero Voluntario", "Comunidad"
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
  reason: string; // e.g. 'Contenido Inapropiado / Ofensivo' | 'Spam o Reseña Falsa' | 'Información Fuera de Lugar'
  details?: string;
  status: 'PENDING' | 'RESOLVED_DELETED' | 'RESOLVED_DISMISSED';
  review_snapshot: {
    id: string;
    volunteer_id: string;
    rating: number;
    reviewer_name: string;
    reviewer_relation?: string;
    message?: string;
    created_at: string;
  };
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  staff_resolution_note?: string;
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

interface DatabaseSchema {
  users: User[];
  profiles: VolunteerProfile[];
  hour_submissions: HourSubmission[];
  notifications: Notification[];
  audit_logs: AuditLog[];
  events: EventItem[];
  event_applications: EventApplication[];
  certificates: Certificate[];
  announcements: Announcement[];
  gallery: GalleryItem[];
  faqs: FaqItem[];
  contact_messages: ContactMessage[];
  resources: ResourceItem[];
  public_reviews: PublicReview[];
  review_reports: ReviewReport[];
  volunteer_counter: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.profiles) this.data.profiles = [];
        if (!this.data.hour_submissions) this.data.hour_submissions = [];
        if (!this.data.notifications) this.data.notifications = [];
        if (!this.data.audit_logs) this.data.audit_logs = [];
        if (!this.data.events) this.data.events = [];
        if (!this.data.event_applications) this.data.event_applications = [];
        if (!this.data.certificates) this.data.certificates = [];
        if (!this.data.announcements) this.data.announcements = [];
        if (!this.data.gallery) this.data.gallery = [];
        if (!this.data.faqs) this.data.faqs = [];
        if (!this.data.contact_messages) this.data.contact_messages = [];
        if (!this.data.resources) this.data.resources = [];
        if (!this.data.public_reviews) this.data.public_reviews = [];
        if (!this.data.review_reports) this.data.review_reports = [];
        if (typeof this.data.volunteer_counter !== 'number') this.data.volunteer_counter = 1;
        
        if (this.data.events.length === 0) {
          this.seedInitialEvents();
        }
        if (this.data.resources.length === 0) {
          this.seedInitialResources();
        }
        if (this.data.faqs.length === 0) {
          this.seedInitialFaqs();
        }
        if (this.data.announcements.length === 0) {
          this.seedInitialAnnouncements();
        }
      } catch (e) {
        console.error('Error reading db.json, initializing empty db', e);
        this.data = this.getDefaultData();
        this.seedInitialEvents();
        this.seedInitialResources();
        this.seedInitialFaqs();
        this.seedInitialAnnouncements();
      }
    } else {
      this.data = this.getDefaultData();
      this.seedInitialEvents();
      this.seedInitialResources();
      this.seedInitialFaqs();
      this.seedInitialAnnouncements();
    }
  }

  private seedInitialEvents() {
    const sampleEvents: EventItem[] = [
      {
        id: 'evt_feria_recursos_2026',
        title: 'Feria Comunitaria de Recursos y Salud Escolar',
        short_description: 'Apoyo en recepción, traducción español-inglés, orientación a familias y entrega de materiales informativos.',
        description: 'La Feria Comunitaria reúne a decenas de organizaciones locales para brindar recursos de salud, nutrición y educación a las familias del distrito. Los voluntarios asistirán en la mesa de registro, guiarán a los asistentes, apoyarán con interpretación bilingüe y colaborarán en la logística de los stands informativos.',
        date: '2026-09-12',
        start_time: '08:30',
        end_time: '13:30',
        location: 'Centro Comunitario Lincoln, Salón Principal',
        estimated_minutes: 300,
        total_spots: 15,
        available_spots: 8,
        languages: ['Español', 'Inglés'],
        requirements: ['Puntualidad', 'Excelente trato comunitario', 'Uso de camiseta de voluntario'],
        min_age: 14,
        important_info: 'Se proporcionará refrigerio y acreditación oficial de horas de voluntariado.',
        organizer: 'DMPS Connect & Enlace Comunitario',
        status: 'OPEN',
        code: 'REG-5021',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'evt_taller_digital_familias',
        title: 'Taller de Alfabetización Digital para Familias',
        short_description: 'Ayuda técnica individual a padres de familia en el uso del portal escolar y herramientas educativas.',
        description: 'Sesión práctica guiada para orientar a padres de familia y tutores en la navegación de plataformas educativas, consulta de calificaciones, acceso a DMPS Info y comunicación con docentes. Los voluntarios trabajarán uno a uno con las familias.',
        date: '2026-09-19',
        start_time: '10:00',
        end_time: '14:00',
        location: 'Biblioteca Pública Central, Laboratorio de Cómputo 2',
        estimated_minutes: 240,
        total_spots: 10,
        available_spots: 3,
        languages: ['Español', 'Inglés', 'Bilingüe preferido'],
        requirements: ['Conocimientos básicos de computación', 'Paciencia y vocación de servicio'],
        min_age: 15,
        important_info: 'Capacitación previa de 20 minutos al inicio de la jornada.',
        organizer: 'Equipo Tecnológico DMPS Connect',
        status: 'FEW_SPOTS',
        code: 'REG-8214',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'evt_jornada_utiles_alimentos',
        title: 'Jornada de Empaque y Distribución de Alimentos y Útiles',
        short_description: 'Clasificación de víveres, empaque de paquetes escolares y distribución vehicular para familias.',
        description: 'Jornada de impacto directo donde se preparan y entregan cajas de alimentos no perecederos y kits de útiles escolares para estudiantes y familias del área metropolitana.',
        date: '2026-09-26',
        start_time: '08:00',
        end_time: '12:30',
        location: 'Almacén Comunitario East Side, Bahía de Carga 4',
        estimated_minutes: 270,
        total_spots: 20,
        available_spots: 14,
        languages: ['Español', 'Inglés'],
        requirements: ['Capacidad para levantar cajas ligeras', 'Ropa cómoda y calzado cerrado'],
        min_age: 14,
        important_info: 'Agua y refrigerios incluidos.',
        organizer: 'Red Solidaria & DMPS Connect',
        status: 'OPEN',
        code: 'REG-3390',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    this.data.events = sampleEvents;
    this.save();
  }

  private seedInitialResources() {
    const sampleResources: ResourceItem[] = [
      {
        id: 'res_guia_registro_horas',
        title: 'Guía Paso a Paso para Registrar tus Horas de Voluntariado',
        description: 'Instructivo oficial en formato PDF para registrar correctamente actividades, adjuntar comprobantes y enviar horas a revisión.',
        category: 'guias',
        url: '#',
        created_at: new Date().toISOString(),
      },
      {
        id: 'res_politica_graduacion',
        title: 'Criterios de Graduación y Reconocimiento de Servicio Comunitario',
        description: 'Reglamento distrital sobre horas válidas, organizaciones aliadas acreditadas y plazos de entrega por semestre.',
        category: 'informacion',
        url: '#',
        created_at: new Date().toISOString(),
      },
      {
        id: 'res_capacitacion_liderazgo',
        title: 'Módulo de Capacitación: Liderazgo y Trabajo en Equipo Comunitario',
        description: 'Material interactivo de formación previa para coordinadores estudiantiles y líderes de evento.',
        category: 'capacitaciones',
        url: '#',
        created_at: new Date().toISOString(),
      },
      {
        id: 'res_preguntas_frecuentes_portal',
        title: 'Preguntas Frecuentes sobre el Portal DMPS Connect',
        description: 'Respuestas rápidas sobre cómo solicitar cupos en eventos, qué hacer si rechazan una solicitud y cómo descargar certificados.',
        category: 'faq',
        url: '#',
        created_at: new Date().toISOString(),
      },
    ];

    this.data.resources = sampleResources;
    this.save();
  }

  private seedInitialFaqs() {
    const sampleFaqs: FaqItem[] = [
      {
        id: 'faq_1',
        question: '¿Cómo se acreditan las horas de un evento?',
        answer: 'Ser aceptado en un evento no otorga horas automáticamente. Una vez finalizado el evento, debes ingresar a "Mis Eventos" o "Registrar Horas", reportar tu hora real de llegada y salida. El equipo de Staff revisará y aprobará tu participación antes de que se sumen a tu perfil oficial.',
        category: 'Horas y Eventos',
        published: true,
        order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'faq_2',
        question: '¿Qué pasa si me inscribí en un evento pero no podré asistir?',
        answer: 'Puedes presionar el botón "No puedo asistir" desde el detalle del evento antes de que inicie. Esto liberará automáticamente el cupo para que otro voluntario en lista de espera pueda participar.',
        category: 'Eventos',
        published: true,
        order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'faq_3',
        question: '¿Cuándo recibo un certificado de reconocimiento?',
        answer: 'El sistema genera automáticamente certificados oficiales al alcanzar 10, 25, 50 y 100 horas verificadas. Además, el Staff puede emitir certificados especiales de mérito.',
        category: 'Certificados',
        published: true,
        order: 3,
        created_at: new Date().toISOString(),
      },
    ];
    this.data.faqs = sampleFaqs;
    this.save();
  }

  private seedInitialAnnouncements() {
    const sampleAnnouncements: Announcement[] = [
      {
        id: 'ann_welcome_hub',
        title: '¡Bienvenidos al nuevo DMPS Connect Hub!',
        message: 'Explora los eventos comunitarios de este ciclo, solicita tu cupo y registra tus horas verificadas de forma sencilla y transparente.',
        audience: 'ALL',
        active: true,
        category: 'info',
        created_by: 'DMPS Connect Staff',
        created_at: new Date().toISOString(),
      }
    ];
    this.data.announcements = sampleAnnouncements;
    this.save();
  }

  private getDefaultData(): DatabaseSchema {
    const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);
    const staffPasswordHash = bcrypt.hashSync('Staff123!', 10);
    const volunteerPasswordHash = bcrypt.hashSync('Volunteer123!', 10);

    const now = new Date().toISOString();

    return {
      users: [
        {
          id: 'usr_admin_001',
          email: 'admin@dmps.org',
          password_hash: adminPasswordHash,
          role: 'ADMIN',
          created_at: now,
          updated_at: now,
        },
        {
          id: 'usr_staff_001',
          email: 'staff@dmps.org',
          password_hash: staffPasswordHash,
          role: 'STAFF',
          created_at: now,
          updated_at: now,
        },
        {
          id: 'usr_vol_001',
          email: 'voluntario@dmps.org',
          password_hash: volunteerPasswordHash,
          role: 'VOLUNTEER',
          created_at: now,
          updated_at: now,
        },
      ],
      profiles: [
        {
          id: 'prof_vol_001',
          user_id: 'usr_vol_001',
          volunteer_id: 'VOL-00001',
          first_name: 'Jeferson',
          last_name: 'M.',
          email: 'voluntario@dmps.org',
          phone: '(515) 555-0199',
          school: 'East High School',
          grade: '11th Grade',
          organization: 'DMPS Connect Youth Club',
          languages: ['Español', 'Inglés'],
          join_date: '2026-01-15',
          bio: 'Estudiante comprometido con el servicio comunitario y la alfabetización digital.',
          profile_completed: true,
          goal_hours: 50,
          created_at: now,
          updated_at: now,
        },
      ],
      hour_submissions: [
        {
          id: 'sub_001',
          volunteer_id: 'prof_vol_001',
          user_id: 'usr_vol_001',
          volunteer_code: 'VOL-00001',
          volunteer_name: 'Jeferson M.',
          school: 'East High School',
          activity_name: 'Tutoría de Lectura Bilingüe',
          organization_name: 'Biblioteca Pública Central',
          date: '2026-08-10',
          start_time: '14:00',
          end_time: '17:30',
          submitted_minutes: 210, // 3h 30min
          approved_minutes: 210,
          location: 'Des Moines, IA',
          description: 'Apoyo en lectura guiada para niños de 1° a 3° grado.',
          supervisor_name: 'María Sánchez (Coordinadora)',
          status: 'APPROVED',
          submitted_at: '2026-08-10T18:00:00Z',
          reviewed_at: '2026-08-11T10:00:00Z',
          reviewed_by: 'Staff DMPS (staff@dmps.org)',
          source: 'MANUAL',
          created_at: '2026-08-10T18:00:00Z',
          updated_at: '2026-08-11T10:00:00Z',
        },
        {
          id: 'sub_002',
          volunteer_id: 'prof_vol_001',
          user_id: 'usr_vol_001',
          volunteer_code: 'VOL-00001',
          volunteer_name: 'Jeferson M.',
          school: 'East High School',
          activity_name: 'Apoyo en Logística y Registro',
          organization_name: 'Centro Comunitario Norte',
          date: '2026-08-14',
          start_time: '09:00',
          end_time: '13:00',
          submitted_minutes: 240, // 4h
          approved_minutes: 240,
          location: 'Des Moines, IA',
          description: 'Registro de familias y entrega de folletos informativos.',
          supervisor_name: 'Carlos Ruiz',
          status: 'APPROVED',
          submitted_at: '2026-08-14T14:00:00Z',
          reviewed_at: '2026-08-15T09:30:00Z',
          reviewed_by: 'Staff DMPS (staff@dmps.org)',
          source: 'MANUAL',
          created_at: '2026-08-14T14:00:00Z',
          updated_at: '2026-08-15T09:30:00Z',
        },
      ],
      notifications: [
        {
          id: 'notif_welcome',
          user_id: 'usr_vol_001',
          title: '¡Bienvenido a DMPS Connect Hub!',
          message: 'Tu cuenta ha sido activada con el código VOL-00001. Puedes registrar tus horas y solicitar cupo en los eventos disponibles.',
          type: 'success',
          read: false,
          created_at: now,
        },
      ],
      audit_logs: [
        {
          id: 'audit_init',
          user_id: 'usr_admin_001',
          user_name: 'Sistema Admin',
          role: 'ADMIN',
          action: 'SYSTEM_INITIALIZED',
          target_id: 'db_root',
          timestamp: now,
        },
      ],
      events: [],
      event_applications: [],
      certificates: [],
      announcements: [],
      gallery: [],
      faqs: [],
      contact_messages: [],
      resources: [],
      public_reviews: [],
      review_reports: [],
      volunteer_counter: 2,
    };
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db.json', e);
    }
  }

  // --- Users ---
  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserByEmail(email: string): User | undefined {
    return this.getUserByEmail(email);
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserById(id: string): User | undefined {
    return this.getUserById(id);
  }

  public getAllUsers(): User[] {
    return this.data.users;
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = {
        ...this.data.users[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.data.users[idx];
    }
    return undefined;
  }

  public updateUserRole(id: string, role: UserRole): User | undefined {
    return this.updateUser(id, { role });
  }

  // --- Profiles ---
  public getProfileByUserId(userId: string): VolunteerProfile | undefined {
    return this.data.profiles.find(p => p.user_id === userId);
  }

  public getProfileById(id: string): VolunteerProfile | undefined {
    return this.data.profiles.find(p => p.id === id);
  }

  public getProfileByVolunteerId(volunteerId: string): VolunteerProfile | undefined {
    return this.data.profiles.find(p => p.volunteer_id.toUpperCase() === volunteerId.toUpperCase());
  }

  public getAllProfiles(): VolunteerProfile[] {
    return this.data.profiles;
  }

  public getAllVolunteers(): VolunteerProfile[] {
    return this.getAllProfiles();
  }

  public createProfile(profile: VolunteerProfile): VolunteerProfile {
    this.data.profiles.push(profile);
    this.save();
    return profile;
  }

  public updateProfile(id: string, updates: Partial<VolunteerProfile>): VolunteerProfile | undefined {
    const idx = this.data.profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.profiles[idx] = {
        ...this.data.profiles[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.data.profiles[idx];
    }
    return undefined;
  }

  public getNextVolunteerId(): string {
    const nextNum = this.data.volunteer_counter++;
    this.save();
    return `VOL-${String(nextNum).padStart(5, '0')}`;
  }

  // --- Hour Submissions ---
  public getSubmissionsByVolunteer(volunteerProfileId: string): HourSubmission[] {
    return this.data.hour_submissions
      .filter(s => s.volunteer_id === volunteerProfileId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getSubmissionById(id: string): HourSubmission | undefined {
    return this.data.hour_submissions.find(s => s.id === id);
  }

  public getAllSubmissions(): HourSubmission[] {
    return [...this.data.hour_submissions].sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  }

  public createSubmission(submission: HourSubmission): HourSubmission {
    this.data.hour_submissions.unshift(submission);
    this.save();
    return submission;
  }

  public updateSubmission(id: string, updates: Partial<HourSubmission>): HourSubmission | undefined {
    const index = this.data.hour_submissions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.hour_submissions[index] = {
        ...this.data.hour_submissions[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.data.hour_submissions[index];
    }
    return undefined;
  }

  public deleteSubmission(id: string): boolean {
    const idx = this.data.hour_submissions.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.hour_submissions.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public checkDuplicateSubmission(volunteerId: string, date: string, activityName: string, startTime: string): HourSubmission | undefined {
    const cleanActivity = activityName.trim().toLowerCase();
    return this.data.hour_submissions.find(s => 
      s.volunteer_id === volunteerId &&
      s.date === date &&
      s.status !== 'REJECTED' &&
      s.status !== 'CANCELLED' &&
      (
        s.activity_name.trim().toLowerCase() === cleanActivity ||
        (s.start_time && startTime && s.start_time === startTime)
      )
    );
  }

  public checkActiveEventSubmission(volunteerProfileId: string, eventId: string): HourSubmission | undefined {
    return this.data.hour_submissions.find(s => 
      s.volunteer_id === volunteerProfileId &&
      s.event_id === eventId &&
      (s.status === 'PENDING' || s.status === 'APPROVED' || s.status === 'NEEDS_CORRECTION' || s.status === 'CORRECTED')
    );
  }

  // Helper to compute approved minutes exclusively (Rule A10)
  public getApprovedMinutesForVolunteer(volunteerProfileId: string): number {
    return this.data.hour_submissions
      .filter(s => s.volunteer_id === volunteerProfileId && s.status === 'APPROVED')
      .reduce((acc, s) => acc + (s.approved_minutes ?? s.submitted_minutes ?? 0), 0);
  }

  // Helper to compute pending minutes
  public getPendingMinutesForVolunteer(volunteerProfileId: string): number {
    return this.data.hour_submissions
      .filter(s => s.volunteer_id === volunteerProfileId && (s.status === 'PENDING' || s.status === 'CORRECTED'))
      .reduce((acc, s) => acc + (s.submitted_minutes || 0), 0);
  }

  // Helper to compute minutes this month
  public getApprovedMinutesThisMonthForVolunteer(volunteerProfileId: string): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${currentYear}-${currentMonth}`;

    return this.data.hour_submissions
      .filter(s => 
        s.volunteer_id === volunteerProfileId && 
        s.status === 'APPROVED' && 
        s.date.startsWith(monthPrefix)
      )
      .reduce((acc, s) => acc + (s.approved_minutes ?? s.submitted_minutes ?? 0), 0);
  }

  public getApprovedMinutesThisYearForVolunteer(volunteerProfileId: string): number {
    const currentYear = String(new Date().getFullYear());
    return this.data.hour_submissions
      .filter(s => 
        s.volunteer_id === volunteerProfileId && 
        s.status === 'APPROVED' && 
        s.date.startsWith(currentYear)
      )
      .reduce((acc, s) => acc + (s.approved_minutes ?? s.submitted_minutes ?? 0), 0);
  }

  public getRejectedCountForVolunteer(volunteerProfileId: string): number {
    return this.data.hour_submissions
      .filter(s => s.volunteer_id === volunteerProfileId && s.status === 'REJECTED')
      .length;
  }

  // --- Certificates System (Bloque D) ---
  public getCertificatesByVolunteer(volunteerProfileId: string): Certificate[] {
    return this.data.certificates
      .filter(c => c.volunteer_id === volunteerProfileId)
      .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());
  }

  public getCertificateById(id: string): Certificate | undefined {
    return this.data.certificates.find(c => c.id === id || c.certificate_code === id);
  }

  public getAllCertificates(): Certificate[] {
    return [...this.data.certificates].sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());
  }

  public createCertificate(cert: Certificate): Certificate {
    this.data.certificates.unshift(cert);
    this.save();
    return cert;
  }

  // Auto-issuance based on APPROVED hours strictly (Rule D1, D2)
  public checkAndIssueMilestoneCertificates(volunteerProfileId: string): Certificate[] {
    const profile = this.getProfileById(volunteerProfileId);
    if (!profile) return [];

    const approvedMinutes = this.getApprovedMinutesForVolunteer(volunteerProfileId);
    const existingCerts = this.getCertificatesByVolunteer(volunteerProfileId);
    const existingMilestones = new Set(existingCerts.map(c => c.hours_milestone));

    const milestones = [
      { hours: 10, minutes: 600 },
      { hours: 25, minutes: 1500 },
      { hours: 50, minutes: 3000 },
      { hours: 160, minutes: 9600 },
    ];

    const newlyIssued: Certificate[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const m of milestones) {
      if (approvedMinutes >= m.minutes && !existingMilestones.has(m.hours)) {
        const codeNumber = Math.floor(10000 + Math.random() * 90000);
        const cert: Certificate = {
          id: `cert_${Date.now()}_${m.hours}h`,
          volunteer_id: profile.id,
          user_id: profile.user_id,
          volunteer_code: profile.volunteer_id,
          volunteer_name: `${profile.first_name} ${profile.last_name}`.trim(),
          school: profile.school,
          hours_milestone: m.hours,
          certificate_code: `CERT-DMPS-${new Date().getFullYear()}-${codeNumber}`,
          issue_date: today,
          verified_minutes: approvedMinutes,
          created_by: 'SISTEMA DMPS CONNECT',
          reason: `Alcanzar el hito oficial de ${m.hours} horas verificadas de servicio comunitario.`,
          created_at: new Date().toISOString(),
        };

        this.createCertificate(cert);
        newlyIssued.push(cert);

        // Notify volunteer
        this.notifyUser(
          profile.user_id,
          `🏆 ¡Nuevo Certificado Desbloqueado (${m.hours} Horas)!`,
          `Felicitaciones ${profile.first_name}, has alcanzado ${m.hours} horas verificadas. Tu certificado oficial ya está disponible para visualización y descarga.`,
          'success'
        );
      }
    }

    return newlyIssued;
  }

  // --- Notifications ---
  public getNotificationsByUser(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createNotification(notification: Notification): Notification {
    this.data.notifications.unshift(notification);
    this.save();
    return notification;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.user_id === userId);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications
      .filter(n => n.user_id === userId)
      .forEach(n => { n.read = true; });
    this.save();
  }

  public notifyUser(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    submissionId?: string | null,
    eventId?: string | null,
    applicationId?: string | null
  ): Notification {
    const notif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      title,
      message,
      type,
      read: false,
      related_submission_id: submissionId || null,
      related_event_id: eventId || null,
      related_application_id: applicationId || null,
      created_at: new Date().toISOString(),
    };
    return this.createNotification(notif);
  }

  public notifyAllStaff(
    title: string,
    message: string,
    submissionId?: string,
    eventId?: string,
    applicationId?: string
  ) {
    const staffUsers = this.data.users.filter(u => u.role === 'STAFF' || u.role === 'ADMIN');
    for (const s of staffUsers) {
      this.notifyUser(s.id, title, message, 'info', submissionId, eventId, applicationId);
    }
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return [...this.data.audit_logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public logAudit(
    userId: string,
    userName: string,
    role: string,
    action: string,
    targetId: string,
    previousValue?: any,
    newValue?: any,
    reason?: string | null,
    details?: any
  ): AuditLog {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      user_name: userName,
      role,
      action,
      target_id: targetId,
      previous_value: previousValue,
      new_value: newValue,
      reason: reason || null,
      details,
      timestamp: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.save();
    return log;
  }

  public createAuditLog(entry: any): AuditLog {
    const log: AuditLog = {
      id: entry.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: entry.user_id || 'system',
      user_name: entry.user_name || 'System',
      role: entry.role || 'SYSTEM',
      action: entry.action,
      target_id: entry.target_id,
      previous_value: entry.previous_value ?? entry.previousValue,
      new_value: entry.new_value ?? entry.newValue,
      reason: entry.reason || null,
      details: entry.details,
      timestamp: entry.timestamp || new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.save();
    return log;
  }

  // --- Events System ---
  public getAllEvents(includeDrafts: boolean = false): EventItem[] {
    return this.data.events
      .filter(e => includeDrafts || e.status !== 'DRAFT')
      .map(e => this.formatEventWithComputedSpots(e))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public getEvents(includeDrafts: boolean = false): EventItem[] {
    return this.getAllEvents(includeDrafts);
  }

  public getEventById(id: string): EventItem | undefined {
    const event = this.data.events.find(e => e.id === id || e.code === id);
    if (!event) return undefined;
    return this.formatEventWithComputedSpots(event);
  }

  public getRawEventById(id: string): EventItem | undefined {
    return this.data.events.find(e => e.id === id || e.code === id);
  }

  public getAvailableSpotsForEvent(eventId: string): number {
    const event = this.getEventById(eventId);
    return event?.available_spots ?? 0;
  }

  public createEvent(event: EventItem): EventItem {
    this.data.events.unshift(event);
    this.save();
    return this.formatEventWithComputedSpots(event);
  }

  public updateEvent(id: string, updates: Partial<EventItem>): EventItem | undefined {
    const idx = this.data.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      const prev = this.data.events[idx];
      this.data.events[idx] = {
        ...prev,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.formatEventWithComputedSpots(this.data.events[idx]);
    }
    return undefined;
  }

  public deleteEvent(id: string): boolean {
    const idx = this.data.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.events.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public formatEventWithComputedSpots(event: EventItem): EventItem {
    const acceptedCount = this.data.event_applications.filter(
      a => a.event_id === event.id && a.status === 'ACCEPTED'
    ).length;

    const pendingCount = this.data.event_applications.filter(
      a => a.event_id === event.id && a.status === 'PENDING'
    ).length;

    const totalSpots = event.total_spots || 0;
    const availableSpots = Math.max(0, totalSpots - acceptedCount);

    let computedStatus = event.status;
    if (event.status !== 'DRAFT' && event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && event.status !== 'ARCHIVED') {
      if (availableSpots === 0) {
        computedStatus = 'FULL';
      } else if (availableSpots <= 3) {
        computedStatus = 'FEW_SPOTS';
      } else {
        computedStatus = 'OPEN';
      }
    }

    return {
      ...event,
      total_spots: totalSpots,
      available_spots: availableSpots,
      accepted_count: acceptedCount,
      pending_count: pendingCount,
      computed_status: computedStatus,
    };
  }

  // --- Event Applications ---
  public getAllApplications(): EventApplication[] {
    return this.data.event_applications.map(app => {
      const rawEvent = this.data.events.find(e => e.id === app.event_id);
      return {
        ...app,
        event: rawEvent,
      };
    }).sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
  }

  public getApplicationsByEvent(eventId: string): EventApplication[] {
    return this.data.event_applications
      .filter(a => a.event_id === eventId)
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
  }

  public getApplicationsByVolunteer(volunteerProfileId: string): EventApplication[] {
    return this.data.event_applications
      .filter(a => a.volunteer_id === volunteerProfileId)
      .map(app => {
        const event = this.getEventById(app.event_id);
        return {
          ...app,
          event,
        };
      })
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
  }

  public getApplicationById(id: string): EventApplication | undefined {
    const app = this.data.event_applications.find(a => a.id === id);
    if (!app) return undefined;
    const event = this.getEventById(app.event_id);
    return {
      ...app,
      event,
    };
  }

  public checkActiveApplication(volunteerProfileId: string, eventId: string): EventApplication | undefined {
    return this.data.event_applications.find(
      a => a.volunteer_id === volunteerProfileId &&
           a.event_id === eventId &&
           (a.status === 'PENDING' || a.status === 'ACCEPTED' || a.status === 'WAITLIST')
    );
  }

  public checkAnyExistingApplication(volunteerProfileId: string, eventId: string): EventApplication | undefined {
    return this.data.event_applications.find(
      a => a.volunteer_id === volunteerProfileId && a.event_id === eventId
    );
  }

  public createApplication(app: EventApplication): EventApplication {
    this.data.event_applications.unshift(app);
    this.save();
    return app;
  }

  public updateApplication(id: string, updates: Partial<EventApplication>): EventApplication | undefined {
    const idx = this.data.event_applications.findIndex(a => a.id === id);
    if (idx !== -1) {
      const prev = this.data.event_applications[idx];
      this.data.event_applications[idx] = {
        ...prev,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.data.event_applications[idx];
    }
    return undefined;
  }

  public deleteApplication(id: string): boolean {
    const idx = this.data.event_applications.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.event_applications.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Attendance marking (Bloque A13, C8)
  public markAttendance(
    applicationId: string,
    attended: boolean,
    staffName: string,
    staffUserId: string,
    note?: string
  ): { success: boolean; application?: EventApplication; error?: string } {
    const idx = this.data.event_applications.findIndex(a => a.id === applicationId);
    if (idx === -1) return { success: false, error: 'SOLICITUD_NO_ENCONTRADA' };

    const app = this.data.event_applications[idx];
    if (app.status !== 'ACCEPTED') {
      return { success: false, error: 'SOLO_PARTICIPANTES_ACEPTADOS_PUEDEN_REGISTRAR_ASISTENCIA' };
    }

    const prevAttended = app.attended;
    const now = new Date().toISOString();

    this.data.event_applications[idx] = {
      ...app,
      attended,
      attendance_marked_at: now,
      attendance_marked_by: staffName,
      attendance_note: note || app.attendance_note,
      updated_at: now,
    };

    this.save();

    // Log in audit
    this.logAudit(
      staffUserId,
      staffName,
      'STAFF',
      attended ? 'MARK_ATTENDANCE_PRESENT' : 'MARK_ATTENDANCE_NO_SHOW',
      applicationId,
      { attended: prevAttended },
      { attended, note },
      note || (attended ? 'Asistencia confirmada' : 'Marcado como No asistió')
    );

    return { success: true, application: this.data.event_applications[idx] };
  }

  // Bloque E9: "NO PUEDO ASISTIR"
  public cancelAcceptedParticipation(
    applicationId: string,
    userId: string,
    reason?: string
  ): { success: boolean; error?: string } {
    const idx = this.data.event_applications.findIndex(a => a.id === applicationId);
    if (idx === -1) return { success: false, error: 'Solicitud no encontrada' };

    const app = this.data.event_applications[idx];
    if (app.user_id !== userId) {
      return { success: false, error: 'No autorizado' };
    }

    const now = new Date().toISOString();
    this.data.event_applications[idx] = {
      ...app,
      status: 'CANCELLED',
      cancelled_at: now,
      cancellation_reason: reason || 'Voluntario notificó que no puede asistir',
      updated_at: now,
    };
    this.save();

    // Notify staff
    const event = this.getEventById(app.event_id);
    this.notifyAllStaff(
      'Cupo Liberado por Voluntario',
      `El voluntario ${app.volunteer_name} (${app.volunteer_code}) ha cancelado su asistencia al evento "${event?.title || 'Evento'}". El cupo ha sido liberado.`,
      undefined,
      app.event_id,
      applicationId
    );

    return { success: true };
  }

  // Synchronous atomic acceptance check
  public acceptApplicationWithConcurrencyCheck(
    applicationId: string,
    staffName: string,
    staffMessage?: string
  ): { success: boolean; reason?: string; application?: EventApplication; availableSpots?: number } {
    const idx = this.data.event_applications.findIndex(a => a.id === applicationId);
    if (idx === -1) {
      return { success: false, reason: 'APPLICATION_NOT_FOUND' };
    }

    const app = this.data.event_applications[idx];
    const eventIdx = this.data.events.findIndex(e => e.id === app.event_id);
    if (eventIdx === -1) {
      return { success: false, reason: 'EVENT_NOT_FOUND' };
    }

    const event = this.data.events[eventIdx];
    if (['CANCELLED', 'ARCHIVED', 'COMPLETED'].includes(event.status)) {
      return { success: false, reason: 'EVENT_INACTIVE' };
    }

    const currentAccepted = this.data.event_applications.filter(
      a => a.event_id === event.id && a.status === 'ACCEPTED' && a.id !== applicationId
    ).length;

    const remainingSpots = (event.total_spots || 0) - currentAccepted;
    if (remainingSpots <= 0) {
      return { success: false, reason: 'NO_SPOTS_AVAILABLE', availableSpots: 0 };
    }

    const now = new Date().toISOString();
    this.data.event_applications[idx] = {
      ...app,
      status: 'ACCEPTED',
      reviewed_by: staffName,
      reviewed_at: now,
      accepted_at: now,
      staff_message: staffMessage || app.staff_message || '',
      updated_at: now,
    };

    this.save();
    return {
      success: true,
      application: this.data.event_applications[idx],
      availableSpots: remainingSpots - 1,
    };
  }

  // --- Announcements System (Bloque E6) ---
  public getAnnouncements(audience?: string): Announcement[] {
    const now = new Date().toISOString();
    return this.data.announcements
      .filter(a => {
        if (!a.active) return false;
        if (a.expires_at && a.expires_at < now) return false;
        if (!audience || audience === 'ALL') return true;
        return a.audience === 'ALL' || a.audience === audience;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllAnnouncementsAdmin(): Announcement[] {
    return [...this.data.announcements].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public createAnnouncement(ann: Announcement): Announcement {
    this.data.announcements.unshift(ann);
    this.save();
    return ann;
  }

  public deleteAnnouncement(id: string): boolean {
    const idx = this.data.announcements.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.announcements.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- FAQs System (Bloque E4) ---
  public getFaqs(includeUnpublished: boolean = false): FaqItem[] {
    return this.data.faqs
      .filter(f => includeUnpublished || f.published)
      .sort((a, b) => a.order - b.order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createFaq(faq: FaqItem): FaqItem {
    this.data.faqs.push(faq);
    this.save();
    return faq;
  }

  public updateFaq(id: string, updates: Partial<FaqItem>): FaqItem | undefined {
    const idx = this.data.faqs.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.data.faqs[idx] = { ...this.data.faqs[idx], ...updates };
      this.save();
      return this.data.faqs[idx];
    }
    return undefined;
  }

  public deleteFaq(id: string): boolean {
    const idx = this.data.faqs.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.data.faqs.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Gallery System (Bloque E3) ---
  public getGalleryItems(): GalleryItem[] {
    return [...this.data.gallery].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public getGallery(): GalleryItem[] {
    return this.getGalleryItems();
  }

  public createGalleryItem(item: GalleryItem): GalleryItem {
    this.data.gallery.unshift(item);
    this.save();
    return item;
  }

  public deleteGalleryItem(id: string): boolean {
    const idx = this.data.gallery.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.data.gallery.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Contact Messages (Bloque E5) ---
  public createContactMessage(msg: ContactMessage): ContactMessage {
    this.data.contact_messages.unshift(msg);
    this.save();
    return msg;
  }

  public getContactMessages(): ContactMessage[] {
    return [...this.data.contact_messages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public markContactMessageRead(id: string): boolean {
    const msg = this.data.contact_messages.find(m => m.id === id);
    if (msg) {
      msg.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public deleteContactMessage(id: string): boolean {
    const idx = this.data.contact_messages.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.data.contact_messages.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Resources (Bloque E2) ---
  public getResources(): ResourceItem[] {
    return [...this.data.resources];
  }

  public createResource(res: ResourceItem): ResourceItem {
    this.data.resources.push(res);
    this.save();
    return res;
  }

  public deleteResource(id: string): boolean {
    const idx = this.data.resources.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.resources.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Infinite Campus Silver Cord Synchronization ---
  public syncInfiniteCampusSubmissions(
    userId: string,
    entries: Array<{
      external_id?: string;
      activity_name: string;
      organization_name?: string;
      date: string;
      hours: number;
      minutes?: number;
      supervisor_name?: string;
      description?: string;
      location?: string;
    }>
  ): {
    importedCount: number;
    duplicateCount: number;
    totalNewMinutes: number;
    totalInfiniteCampusMinutes: number;
    newSubmissions: HourSubmission[];
    newlyIssuedCertificates: Certificate[];
  } {
    const profile = this.getProfileByUserId(userId);
    if (!profile) {
      throw new Error('Perfil de voluntario no encontrado.');
    }

    const existing = this.data.hour_submissions.filter(s => s.user_id === userId);
    const existingKeys = new Set(
      existing.map(s => s.external_id || `${s.date}_${s.activity_name.toLowerCase().trim()}_${s.submitted_minutes}`)
    );

    const newSubmissions: HourSubmission[] = [];
    let duplicateCount = 0;
    let totalNewMinutes = 0;
    const now = new Date().toISOString();

    for (const entry of entries) {
      const totalMinutes = Math.round((Number(entry.hours) || 0) * 60 + (Number(entry.minutes) || 0));
      if (totalMinutes <= 0) continue;

      const activityClean = (entry.activity_name || 'Servicio Comunitario Silver Cord').trim();
      const dedupKey = entry.external_id || `${entry.date}_${activityClean.toLowerCase()}_${totalMinutes}`;

      if (existingKeys.has(dedupKey)) {
        duplicateCount++;
        continue;
      }

      const newSub: HourSubmission = {
        id: `ic_sub_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        volunteer_id: profile.id,
        user_id: userId,
        volunteer_code: profile.volunteer_id,
        volunteer_name: `${profile.first_name} ${profile.last_name}`.trim(),
        school: profile.school || 'Des Moines Public Schools',
        activity_name: activityClean,
        organization_name: (entry.organization_name || 'Des Moines Public Schools (Silver Cord)').trim(),
        date: entry.date || now.split('T')[0],
        start_time: '08:00',
        end_time: '12:00',
        submitted_minutes: totalMinutes,
        approved_minutes: totalMinutes, // DIRECTLY VERIFIED & APPROVED!
        location: entry.location || 'Des Moines Public Schools',
        description: entry.description?.trim() || `Horas validadas y acreditadas en Infinite Campus (Silver Cord).`,
        supervisor_name: entry.supervisor_name?.trim() || 'Brenda Lucero (DMPS Silver Cord)',
        status: 'APPROVED', // DIRECTLY APPROVED!
        source: 'INFINITE_CAMPUS',
        external_id: dedupKey,
        submitted_at: now,
        reviewed_at: now,
        reviewed_by: 'Infinite Campus Silver Cord (Acreditación Oficial)',
        created_at: now,
        updated_at: now,
      };

      this.data.hour_submissions.unshift(newSub);
      existingKeys.add(dedupKey);
      newSubmissions.push(newSub);
      totalNewMinutes += totalMinutes;
    }

    let newlyIssuedCerts: Certificate[] = [];
    if (newSubmissions.length > 0) {
      // Update profile cache
      profile.approved_minutes = this.getApprovedMinutesForVolunteer(profile.id);
      profile.total_submissions = this.getSubmissionsByVolunteer(profile.id).length;
      profile.updated_at = now;

      this.save();

      // Check milestones for automatic certificate awards (10h, 25h, 50h, 100h)
      newlyIssuedCerts = this.checkAndIssueMilestoneCertificates(profile.id);

      // Create notification
      this.notifyUser(
        userId,
        'Horas de Infinite Campus Sincronizadas',
        `Se sincronizaron ${newSubmissions.length} actividades oficiales (${(totalNewMinutes / 60).toFixed(1)} horas) directamente como APROBADAS.`,
        'success'
      );
    }

    const totalInfiniteCampusMinutes = this.data.hour_submissions
      .filter(s => s.user_id === userId && s.source === 'INFINITE_CAMPUS' && s.status === 'APPROVED')
      .reduce((sum, s) => sum + (s.approved_minutes || s.submitted_minutes || 0), 0);

    return {
      importedCount: newSubmissions.length,
      duplicateCount,
      totalNewMinutes,
      totalInfiniteCampusMinutes,
      newSubmissions,
      newlyIssuedCertificates: newlyIssuedCerts,
    };
  }

  // --- Public Reviews & Ratings ---
  public getPublicReviewsForVolunteer(volunteerId: string): PublicReview[] {
    return this.data.public_reviews
      .filter((r) => r.volunteer_id === volunteerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addPublicReview(data: {
    volunteer_id: string;
    rating: number;
    reviewer_name?: string;
    reviewer_relation?: string;
    message?: string;
  }): PublicReview {
    const profile = this.getProfileById(data.volunteer_id);
    if (!profile) {
      throw new Error('Perfil de voluntario no encontrado.');
    }

    const clampedRating = Math.max(1, Math.min(5, Math.round(data.rating || 5)));
    const newRev: PublicReview = {
      id: `rev_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      volunteer_id: data.volunteer_id,
      rating: clampedRating,
      reviewer_name: data.reviewer_name?.trim() || 'Miembro de la Comunidad',
      reviewer_relation: data.reviewer_relation?.trim() || 'Comunidad Escolar',
      message: data.message?.trim() || undefined,
      is_reported: false,
      created_at: new Date().toISOString(),
    };

    this.data.public_reviews.unshift(newRev);
    this.recalculateVolunteerRating(data.volunteer_id);
    this.save();

    // Notify volunteer
    this.notifyUser(
      profile.user_id,
      '¡Nueva Reseña y Calificación de la Comunidad!',
      `${newRev.reviewer_name} te ha dejado una calificación de ${'★'.repeat(clampedRating)} (${clampedRating}/5 estrellas)${newRev.message ? `: "${newRev.message.slice(0, 60)}..."` : '.'}`,
      'success'
    );

    return newRev;
  }

  public reportPublicReview(reviewId: string, data: {
    reason: string;
    reporter_name?: string;
    details?: string;
  }): ReviewReport {
    const review = this.data.public_reviews.find((r) => r.id === reviewId);
    if (!review) {
      throw new Error('Reseña no encontrada.');
    }

    const profile = this.getProfileById(review.volunteer_id);
    const volunteerName = profile ? `${profile.first_name} ${profile.last_name}` : 'Voluntario';

    review.is_reported = true;

    const newReport: ReviewReport = {
      id: `rep_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      review_id: review.id,
      volunteer_id: review.volunteer_id,
      volunteer_name: volunteerName,
      reporter_name: data.reporter_name?.trim() || 'Voluntario / Usuario Anónimo',
      reason: data.reason?.trim() || 'Contenido Inapropiado o Fuera de Lugar',
      details: data.details?.trim() || undefined,
      status: 'PENDING',
      review_snapshot: { ...review },
      created_at: new Date().toISOString(),
    };

    this.data.review_reports.unshift(newReport);
    this.save();

    // Notify all staff/admin
    const staffUsers = this.data.users.filter((u) => u.role === 'STAFF' || u.role === 'ADMIN');
    for (const staff of staffUsers) {
      this.notifyUser(
        staff.id,
        '⚠️ Denuncia de Reseña Inapropiada',
        `Se ha reportado una reseña de ${volunteerName} por motivo: "${newReport.reason}". Revisa el panel de moderación para eliminarla si procede.`,
        'warning'
      );
    }

    return newReport;
  }

  public getReviewReports(): ReviewReport[] {
    return this.data.review_reports.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public deleteReviewByStaff(reviewId: string, staffName: string, reason?: string): { success: boolean; volunteer_id: string } {
    const reviewIndex = this.data.public_reviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) {
      throw new Error('La reseña no existe o ya fue eliminada.');
    }

    const review = this.data.public_reviews[reviewIndex];
    const volunteerId = review.volunteer_id;
    const profile = this.getProfileById(volunteerId);

    // Remove review
    this.data.public_reviews.splice(reviewIndex, 1);

    // Recalculate ratings
    this.recalculateVolunteerRating(volunteerId);

    // Update any related reports
    this.data.review_reports.forEach((rep) => {
      if (rep.review_id === reviewId) {
        rep.status = 'RESOLVED_DELETED';
        rep.resolved_at = new Date().toISOString();
        rep.resolved_by = staffName;
        rep.staff_resolution_note = reason || 'Reseña eliminada por moderación de staff.';
      }
    });

    // Create Audit Log
    this.createAuditLog({
      user_id: profile ? profile.user_id : 'SYSTEM',
      user_name: staffName,
      actor_name: staffName,
      actor_role: 'STAFF',
      role: 'STAFF',
      action: 'MODERATION_REVIEW_DELETED',
      target_id: reviewId,
      target_type: 'PUBLIC_REVIEW',
      details: {
        volunteer_id: volunteerId,
        volunteer_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Voluntario',
        removed_review: review,
        moderation_reason: reason || 'Contenido inapropiado / fuera de lugar',
      },
      reason: reason || 'Moderación de reseña inapropiada',
    });

    // Notify volunteer
    if (profile) {
      this.notifyUser(
        profile.user_id,
        'Aviso de Moderación: Reseña Eliminada',
        `El equipo de Staff ha retirado una reseña señalada como fuera de lugar. Tu promedio de calificación y reconocimientos han sido actualizados con total transparencia.`,
        'info'
      );
    }

    this.save();
    return { success: true, volunteer_id: volunteerId };
  }

  public dismissReviewReport(reportId: string, staffName: string, note?: string): ReviewReport {
    const report = this.data.review_reports.find((r) => r.id === reportId);
    if (!report) {
      throw new Error('Reporte no encontrado.');
    }

    report.status = 'RESOLVED_DISMISSED';
    report.resolved_at = new Date().toISOString();
    report.resolved_by = staffName;
    report.staff_resolution_note = note || 'Reporte desestimado: la reseña cumple con las normas.';

    this.save();
    return report;
  }

  public recalculateVolunteerRating(volunteerId: string): { avg: number; count: number } {
    const reviews = this.data.public_reviews.filter((r) => r.volunteer_id === volunteerId);
    const count = reviews.length;
    const profile = this.getProfileById(volunteerId);

    if (count === 0) {
      if (profile) {
        profile.rating_avg = 5.0;
        profile.rating_count = 0;
      }
      return { avg: 5.0, count: 0 };
    }

    const totalSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = parseFloat((totalSum / count).toFixed(1));

    if (profile) {
      profile.rating_avg = avg;
      profile.rating_count = count;
    }

    return { avg, count };
  }

  // Calculate podium medals based on rank, stacking, and 1-month persistence
  public calculatePodiumMedalsForVolunteer(rank: number, profile: VolunteerProfile): any[] {
    const medals: any[] = [];
    const joinDate = new Date(profile.join_date || profile.created_at || Date.now());
    const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Check if stayed in podium for at least 30 days (1 month)
    // If profile join date / active podium presence >= 30 days, medal becomes permanent
    const isPermanentEligible = daysSinceJoin >= 30;

    const goldMedal = {
      place: 1,
      tier: 'GOLD',
      name: 'Corona de Oro #1',
      title: 'Campeón Distrital de Honor',
      subtitle: 'Primer Lugar del Podio',
      icon: 'Crown',
      color_gradient: 'from-amber-400 via-yellow-300 to-amber-500',
      badge_bg: 'bg-amber-500/20',
      border_color: 'border-amber-400/60',
      text_color: 'text-amber-300',
      glow_color: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      is_active: rank === 1,
      is_permanent: isPermanentEligible && rank === 1,
      days_on_podium: daysSinceJoin,
      description: 'Insignia suprema por liderar el cuadro de honor comunitario con el mayor número de horas de servicio.',
    };

    const silverMedal = {
      place: 2,
      tier: 'SILVER',
      name: 'Escudo de Plata #2',
      title: 'Subcampeón Distrital de Honor',
      subtitle: 'Segundo Lugar del Podio',
      icon: 'Shield',
      color_gradient: 'from-slate-200 via-slate-300 to-slate-400',
      badge_bg: 'bg-slate-400/20',
      border_color: 'border-slate-300/60',
      text_color: 'text-slate-200',
      glow_color: 'shadow-[0_0_20px_rgba(203,213,225,0.35)]',
      is_active: rank === 1 || rank === 2,
      is_permanent: isPermanentEligible && (rank === 1 || rank === 2),
      days_on_podium: daysSinceJoin,
      description: 'Distintivo plateado de excelencia por estar en el selecto grupo de los mejores 2 voluntarios del distrito.',
    };

    const bronzeMedal = {
      place: 3,
      tier: 'BRONZE',
      name: 'Medalla de Bronce #3',
      title: 'Tercer Lugar de Honor',
      subtitle: 'Tercer Puesto del Podio',
      icon: 'Medal',
      color_gradient: 'from-amber-700 via-orange-600 to-amber-800',
      badge_bg: 'bg-amber-800/20',
      border_color: 'border-amber-600/60',
      text_color: 'text-amber-400',
      glow_color: 'shadow-[0_0_20px_rgba(217,119,6,0.35)]',
      is_active: rank === 1 || rank === 2 || rank === 3,
      is_permanent: isPermanentEligible && (rank === 1 || rank === 2 || rank === 3),
      days_on_podium: daysSinceJoin,
      description: 'Condecoración de bronce por alcanzar el podio de honor de la comunidad educativa.',
    };

    // Stacking and persistence rules:
    // Rank 1 gets Gold, Silver, and Bronze
    if (rank === 1) {
      medals.push(goldMedal);
      medals.push(silverMedal);
      medals.push(bronzeMedal);
    } else if (rank === 2) {
      // Rank 2 gets Silver and Bronze
      medals.push(silverMedal);
      medals.push(bronzeMedal);
    } else if (rank === 3) {
      // Rank 3 gets Bronze
      medals.push(bronzeMedal);
    } else {
      // If rank > 3, only keep permanent medals if earned
      if (isPermanentEligible && profile.podium_permanent_medals) {
        if (profile.podium_permanent_medals.includes('GOLD')) {
          medals.push({ ...goldMedal, is_active: false, is_permanent: true });
        }
        if (profile.podium_permanent_medals.includes('SILVER')) {
          medals.push({ ...silverMedal, is_active: false, is_permanent: true });
        }
        if (profile.podium_permanent_medals.includes('BRONZE')) {
          medals.push({ ...bronzeMedal, is_active: false, is_permanent: true });
        }
      }
    }

    return medals;
  }

  public getPublicVolunteersList(): any[] {
    const list = this.data.profiles.map((p) => {
      const approvedMin = this.getApprovedMinutesForVolunteer(p.id);
      const approvedHours = parseFloat((approvedMin / 60).toFixed(1));
      const subs = this.getSubmissionsByVolunteer(p.id);
      const certs = this.getCertificatesByVolunteer(p.id);
      const reviews = this.getPublicReviewsForVolunteer(p.id);
      
      const ratingCount = reviews.length;
      const ratingAvg = ratingCount > 0
        ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount).toFixed(1))
        : 5.0;

      return {
        id: p.id,
        user_id: p.user_id,
        volunteer_id: p.volunteer_id,
        first_name: p.first_name,
        last_name: p.last_name,
        full_name: `${p.first_name} ${p.last_name}`.trim(),
        school: p.school,
        grade: p.grade,
        organization: p.organization,
        languages: p.languages || [],
        bio: p.bio,
        approved_minutes: approvedMin,
        approved_hours: approvedHours,
        total_submissions: subs.length,
        certificates_count: certs.length,
        rating_avg: ratingAvg,
        rating_count: ratingCount,
        join_date: p.join_date,
        raw_profile: p,
      };
    }).sort((a, b) => {
      // Sort by approved hours descending, then rating count
      if (b.approved_hours !== a.approved_hours) {
        return b.approved_hours - a.approved_hours;
      }
      return b.rating_count - a.rating_count;
    });

    // Assign dynamic ranks and podium metadata
    return list.map((item, index) => {
      const rank = index + 1;
      const podiumPlace = rank <= 3 ? (rank as 1 | 2 | 3) : null;
      const podiumMedals = this.calculatePodiumMedalsForVolunteer(rank, item.raw_profile);

      return {
        ...item,
        rank,
        podium_place: podiumPlace,
        podium_medals: podiumMedals,
      };
    });
  }

  public getPublicVolunteerDetail(identifier: string): any | null {
    const list = this.getPublicVolunteersList();
    const found = list.find(
      (p) => p.id === identifier || p.volunteer_id.toLowerCase() === identifier.toLowerCase()
    );

    if (!found) return null;

    const profile = this.getProfileById(found.id);
    if (!profile) return null;

    const subs = this.getSubmissionsByVolunteer(profile.id).filter((s) => s.status === 'APPROVED');
    const certs = this.getCertificatesByVolunteer(profile.id);
    const reviews = this.getPublicReviewsForVolunteer(profile.id);

    return {
      ...found,
      total_approved_submissions: subs.length,
      certificates: certs,
      reviews,
    };
  }

  public getSilverCord160Honorees(): any[] {
    const list = this.getPublicVolunteersList();
    return list.filter((v) => v.approved_hours >= 160 || v.approved_minutes >= 9600);
  }
}

export const db = new Database();
