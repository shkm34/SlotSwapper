import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getSwappableSlots,
  createSwapRequest,
  respondToSwapRequest,
  getMySwapRequests,
} from '../controllers/swapController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get swappable slots from other users - marketplace
router.get('/swappable-slots', getSwappableSlots);

// Create swap request
router.post('/create', createSwapRequest);

// Respond to swap request - accept or reject
router.post('/respond/:swapRequestId', respondToSwapRequest);

// Get all incoming and outgoing swap requests
router.get('/my-requests', getMySwapRequests);

export default router;
