import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/public/volunteers
// Public directory with search, filter, ranking
router.get('/volunteers', (req, res) => {
  try {
    const { search, school, sort } = req.query;
    let list = db.getPublicVolunteersList();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.full_name.toLowerCase().includes(q) ||
          v.volunteer_id.toLowerCase().includes(q) ||
          v.school?.toLowerCase().includes(q) ||
          v.organization?.toLowerCase().includes(q)
      );
    }

    if (school && typeof school === 'string' && school !== 'ALL') {
      list = list.filter((v) => v.school?.toLowerCase() === school.toLowerCase());
    }

    if (sort === 'rating') {
      list.sort((a, b) => b.rating_avg - a.rating_avg || b.rating_count - a.rating_count);
    } else if (sort === 'reviews') {
      list.sort((a, b) => b.rating_count - a.rating_count || b.approved_hours - a.approved_hours);
    } else if (sort === 'recent') {
      list.sort((a, b) => new Date(b.join_date || 0).getTime() - new Date(a.join_date || 0).getTime());
    } else {
      // Default: By hours descending (Honor ranking)
      list.sort((a, b) => b.approved_hours - a.approved_hours || b.rating_avg - a.rating_avg);
    }

    // Attach rank position
    const rankedList = list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    res.json({
      success: true,
      total: rankedList.length,
      volunteers: rankedList,
    });
  } catch (err: any) {
    console.error('Error fetching public volunteers:', err);
    res.status(500).json({ error: 'Error al obtener el directorio público de voluntarios.' });
  }
});

// GET /api/public/top-ranking
router.get('/top-ranking', (req, res) => {
  try {
    const list = db.getPublicVolunteersList();
    const top = list.slice(0, 10).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
    res.json({ success: true, top });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener el ranking público.' });
  }
});

// GET /api/public/silver-cord-160
// Returns volunteers who reached the 160-hour Silver Cord milestone
router.get('/silver-cord-160', (req, res) => {
  try {
    const honorees = db.getSilverCord160Honorees();
    res.json({
      success: true,
      milestone_target: 160,
      total: honorees.length,
      honorees,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener el cuadro de honor de 160 horas.' });
  }
});

// GET /api/public/volunteers/:id
router.get('/volunteers/:id', (req, res) => {
  try {
    const detail = db.getPublicVolunteerDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({ error: 'Voluntario no encontrado en el directorio público.' });
    }

    // Calculate public rank position
    const fullList = db.getPublicVolunteersList();
    const rankIndex = fullList.findIndex((v) => v.id === detail.id || v.volunteer_id === detail.volunteer_id);
    const rank = rankIndex !== -1 ? rankIndex + 1 : fullList.length + 1;

    res.json({
      success: true,
      volunteer: {
        ...detail,
        rank,
      },
    });
  } catch (err: any) {
    console.error('Error fetching volunteer detail:', err);
    res.status(500).json({ error: 'Error al consultar el perfil del voluntario.' });
  }
});

// GET /api/public/volunteers/:id/reviews
router.get('/volunteers/:id/reviews', (req, res) => {
  try {
    const detail = db.getPublicVolunteerDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({ error: 'Voluntario no encontrado.' });
    }
    const reviews = db.getPublicReviewsForVolunteer(detail.id);
    res.json({ success: true, reviews, count: reviews.length, rating_avg: detail.rating_avg });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener las reseñas.' });
  }
});

// POST /api/public/volunteers/:id/reviews
// No mandatory complicated fields: just rating (1-5) and optional text message and name!
router.post('/volunteers/:id/reviews', (req, res) => {
  try {
    const detail = db.getPublicVolunteerDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({ error: 'Voluntario no encontrado.' });
    }

    const { rating, reviewer_name, reviewer_relation, message } = req.body;

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Por favor selecciona una calificación de 1 a 5 estrellas.' });
    }

    const createdReview = db.addPublicReview({
      volunteer_id: detail.id,
      rating: numRating,
      reviewer_name: reviewer_name && reviewer_name.trim().length > 0 ? reviewer_name.trim() : 'Miembro de la Comunidad',
      reviewer_relation: reviewer_relation?.trim() || 'Comunidad Escolar',
      message: message ? message.trim().slice(0, 500) : undefined,
    });

    const updatedDetail = db.getPublicVolunteerDetail(detail.id);

    res.json({
      success: true,
      review: createdReview,
      rating_avg: updatedDetail.rating_avg,
      rating_count: updatedDetail.rating_count,
      message: '¡Gracias por dejar tu reseña y reconocer a este voluntario!',
    });
  } catch (err: any) {
    console.error('Error submitting public review:', err);
    res.status(500).json({ error: err.message || 'Error al registrar la calificación.' });
  }
});

// POST /api/public/reviews/:id/report
// Any volunteer or visitor can report an inappropriate review with 3 quick reasons
router.post('/reviews/:id/report', (req, res) => {
  try {
    const { reason, reporter_name, details } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Por favor selecciona el motivo de la denuncia.' });
    }

    const report = db.reportPublicReview(req.params.id, {
      reason,
      reporter_name,
      details,
    });

    res.json({
      success: true,
      report,
      message: 'Denuncia enviada al equipo de Staff. Se revisará a la brevedad para su eliminación si incumple las normas.',
    });
  } catch (err: any) {
    console.error('Error reporting review:', err);
    res.status(500).json({ error: err.message || 'Error al enviar la denuncia de la reseña.' });
  }
});

// GET /api/public/staff-review-reports
// Staff: Get list of reported reviews
router.get('/staff/reports', (req, res) => {
  try {
    const reports = db.getReviewReports();
    res.json({ success: true, reports });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener reportes de reseñas.' });
  }
});

// DELETE /api/public/staff/reviews/:id
// Staff: Delete an inappropriate review and recalculate ratings / milestones
router.delete('/staff/reviews/:id', (req, res) => {
  try {
    const staffName = (req.headers['x-staff-name'] as string) || 'Staff DMPS';
    const reason = (req.body?.reason as string) || (req.query.reason as string) || 'Contenido inapropiado eliminado por Staff';
    
    const result = db.deleteReviewByStaff(req.params.id, staffName, reason);
    res.json({
      success: true,
      message: 'Reseña eliminada con éxito. El promedio de estrellas y los reconocimientos asociados del voluntario han sido recalculados de inmediato.',
      volunteer_id: result.volunteer_id,
    });
  } catch (err: any) {
    console.error('Error deleting review by staff:', err);
    res.status(500).json({ error: err.message || 'Error al eliminar la reseña.' });
  }
});

// POST /api/public/staff/reports/:id/dismiss
router.post('/staff/reports/:id/dismiss', (req, res) => {
  try {
    const staffName = (req.headers['x-staff-name'] as string) || 'Staff DMPS';
    const { note } = req.body;
    const report = db.dismissReviewReport(req.params.id, staffName, note);
    res.json({
      success: true,
      report,
      message: 'Reporte desestimado correctamente.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error al desestimar reporte.' });
  }
});

export default router;
