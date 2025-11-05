import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  createEvent,
  getUserEvents,
  getEventById,
  updateEventStatus,
  deleteEvent,
  getSwappableEvents,
} from '../controllers/eventController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Event CRUD
router.post('/', createEvent);
router.get('/', getUserEvents);
router.get('/:id', getEventById);
router.patch('/:id/status', updateEventStatus);
router.delete('/:id', deleteEvent);

// Marketplace - get swappable events from other users
router.get('/swappable/marketplace', getSwappableEvents);

export default router;