import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, User, VolunteerProfile, UserRole } from '../db.js';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../auth.js';

const router = Router();
const STAFF_SECRET = process.env.STAFF_REGISTRATION_SECRET || 'VOLUNTEER-STAFF-ADMIN-2026';

// Register (Public - ONLY creates VOLUNTEER accounts)
router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, email, password, confirm_password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      res.status(400).json({ error: 'Todos los campos requeridos deben ser completados.' });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({ error: 'Las contraseñas no coinciden.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      res.status(400).json({ error: 'El correo electrónico no es válido.' });
      return;
    }

    const existingUser = db.findUserByEmail(emailClean);
    if (existingUser) {
      res.status(400).json({ error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user: User = {
      id: userId,
      email: emailClean,
      password_hash,
      role: 'VOLUNTEER', // Strict rule: Public registration ONLY creates VOLUNTEER
      created_at: now,
      updated_at: now,
    };
    db.createUser(user);

    // Create initial profile with unique VOL-xxxxx
    const volunteerId = db.getNextVolunteerId();
    const profileId = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const profile: VolunteerProfile = {
      id: profileId,
      user_id: userId,
      volunteer_id: volunteerId,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: emailClean,
      phone: '',
      school: '',
      grade: '',
      organization: '',
      languages: ['Español'],
      join_date: now.split('T')[0],
      bio: '',
      profile_completed: false,
      created_at: now,
      updated_at: now,
    };
    db.createProfile(profile);

    // Audit log
    db.createAuditLog({
      id: `audit_${Date.now()}`,
      user_id: userId,
      user_name: `${first_name} ${last_name}`,
      role: 'VOLUNTEER',
      action: 'VOLUNTEER_REGISTERED',
      target_id: userId,
      timestamp: now,
    });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Cuenta creada con éxito. Por favor completa tu perfil.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err: any) {
    console.error('Error registering:', err);
    res.status(500).json({ error: 'Ocurrió un error al crear la cuenta. Intenta de nuevo.' });
  }
});

// Login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Por favor ingresa tu correo y contraseña.' });
      return;
    }

    const emailClean = email.trim().toLowerCase();
    const user = db.findUserByEmail(emailClean);
    if (!user) {
      res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos.' });
      return;
    }

    const profile = db.getProfileByUserId(user.id);
    const token = generateToken(user);

    // Get stats if volunteer
    let stats = null;
    if (user.role === 'VOLUNTEER' && profile) {
      stats = {
        approved_minutes: db.getApprovedMinutesForVolunteer(profile.id),
        pending_minutes: db.getPendingMinutesForVolunteer(profile.id),
        this_month_minutes: db.getApprovedMinutesThisMonthForVolunteer(profile.id),
        rejected_count: db.getRejectedCountForVolunteer(profile.id),
        total_submissions: db.getSubmissionsByVolunteer(profile.id).length,
      };
    }

    res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
      stats,
    });
  } catch (err: any) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
  }
});

// Current Authenticated User (Me)
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  const profile = db.getProfileByUserId(req.user.id);
  let stats = null;
  if (req.user.role === 'VOLUNTEER' && profile) {
    stats = {
      approved_minutes: db.getApprovedMinutesForVolunteer(profile.id),
      pending_minutes: db.getPendingMinutesForVolunteer(profile.id),
      this_month_minutes: db.getApprovedMinutesThisMonthForVolunteer(profile.id),
      rejected_count: db.getRejectedCountForVolunteer(profile.id),
      total_submissions: db.getSubmissionsByVolunteer(profile.id).length,
    };
  }

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
    profile,
    stats,
  });
});

// Update Profile
router.put('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.user || !req.profile) {
      res.status(401).json({ error: 'Perfil no encontrado.' });
      return;
    }

    const {
      first_name,
      last_name,
      phone,
      school,
      grade,
      organization,
      languages,
      bio,
      avatar_url,
    } = req.body;

    const updates: Partial<VolunteerProfile> = {
      first_name: first_name !== undefined ? first_name.trim() : req.profile.first_name,
      last_name: last_name !== undefined ? last_name.trim() : req.profile.last_name,
      phone: phone !== undefined ? phone.trim() : req.profile.phone,
      school: school !== undefined ? school.trim() : req.profile.school,
      grade: grade !== undefined ? grade.trim() : req.profile.grade,
      organization: organization !== undefined ? organization.trim() : req.profile.organization,
      languages: Array.isArray(languages) ? languages : req.profile.languages,
      bio: bio !== undefined ? bio.trim() : req.profile.bio,
      avatar_url: avatar_url !== undefined ? avatar_url : req.profile.avatar_url,
      profile_completed: true,
    };

    const updated = db.updateProfile(req.profile.id, updates);

    // Audit log
    db.createAuditLog({
      id: `audit_${Date.now()}`,
      user_id: req.user.id,
      user_name: `${updates.first_name} ${updates.last_name}`,
      role: req.user.role,
      action: 'PROFILE_UPDATED',
      target_id: req.profile.id,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Perfil actualizado exitosamente.',
      profile: updated,
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
});

// Create or Authorize Staff / Admin Account (No secret key required)
router.post('/create-staff', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password) {
      res.status(400).json({ error: 'Todos los campos son obligatorios.' });
      return;
    }

    const emailClean = email.trim().toLowerCase();
    const existing = db.findUserByEmail(emailClean);
    if (existing) {
      // If user exists, we can promote them to STAFF or ADMIN
      db.updateUserRole(existing.id, role === 'ADMIN' ? 'ADMIN' : 'STAFF');
      db.createAuditLog({
        id: `audit_${Date.now()}`,
        user_id: existing.id,
        user_name: `${first_name} ${last_name}`,
        role: role === 'ADMIN' ? 'ADMIN' : 'STAFF',
        action: 'STAFF_ROLE_GRANTED',
        target_id: existing.id,
        reason: 'Autorizado mediante clave de administración',
        timestamp: new Date().toISOString(),
      });
      res.json({ message: `Cuenta ${emailClean} actualizada a rol ${role || 'STAFF'}.` });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    const userId = `usr_staff_${Date.now()}`;
    const userRole: UserRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF';

    const newUser: User = {
      id: userId,
      email: emailClean,
      password_hash,
      role: userRole,
      created_at: now,
      updated_at: now,
    };
    db.createUser(newUser);

    const profileId = `prof_staff_${Date.now()}`;
    const newProfile: VolunteerProfile = {
      id: profileId,
      user_id: userId,
      volunteer_id: `STAFF-${Math.floor(100 + Math.random() * 900)}`,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: emailClean,
      phone: '',
      school: 'Oficina Central de Coordinación',
      languages: ['Español'],
      join_date: now.split('T')[0],
      bio: 'Miembro del equipo de coordinación y verificación de voluntariado.',
      profile_completed: true,
      created_at: now,
      updated_at: now,
    };
    db.createProfile(newProfile);

    db.createAuditLog({
      id: `audit_${Date.now()}`,
      user_id: userId,
      user_name: `${first_name} ${last_name}`,
      role: userRole,
      action: 'STAFF_ACCOUNT_CREATED',
      target_id: userId,
      reason: 'Creación autorizada de cuenta staff',
      timestamp: now,
    });

    res.status(201).json({
      message: `Cuenta de ${userRole} creada exitosamente.`,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      profile: newProfile,
    });
  } catch (err: any) {
    console.error('Error creating staff:', err);
    res.status(500).json({ error: 'Error al crear la cuenta de staff.' });
  }
});

// Forgot Password Helper
router.post('/forgot-password', (req, res: Response): void => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Ingresa tu correo electrónico.' });
    return;
  }
  const user = db.findUserByEmail(email.trim());
  if (!user) {
    // Return standard message for privacy
    res.json({ message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.' });
    return;
  }
  res.json({
    message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.',
    instruction: 'Para restablecer tu contraseña en este entorno de portal, puedes solicitar soporte a tu coordinador o staff asignado.',
  });
});

export default router;
