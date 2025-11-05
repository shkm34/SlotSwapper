import Event from '../models/Event.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  const { title, startTime, endTime } = req.body;

  try {
    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Please provide title, startTime, and endTime' 
      });
    }

    // Validate time inputs
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ 
        message: 'Invalid date format' 
      });
    }

    if (end <= start) {
      return res.status(400).json({ 
        message: 'End time must be after start time' 
      });
    }

    // Create event
    const event = await Event.create({
      title,
      startTime: start,
      endTime: end,
      status: 'BUSY', // by default
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

// @desc    Get all events for authenticated user
// @route   GET /api/events
// @access  Private
export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id }).sort({
      startTime: 1,
    });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns the event
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to access this event' 
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
};

// @desc    Update event status (toggle b/w BUSY - SWAPPABLE)
// @route   PATCH /api/events/:id/status
// @access  Private
export const updateEventStatus = async (req, res) => {
  const { status } = req.body;

  try {
    // Validate status
    if (!status || !['BUSY', 'SWAPPABLE'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be BUSY or SWAPPABLE' 
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns the event
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to update this event' 
      });
    }

    // Cannot change status if event is in SWAP_PENDING
    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ 
        message: 'Cannot modify event while swap is pending' 
      });
    }

    // Update status
    event.status = status;
    await event.save();

    res.json({
      success: true,
      message: `Event status updated to ${status}`,
      event,
    });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns the event
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this event' 
      });
    }

    // Cannot delete if event is in SWAP_PENDING
    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ 
        message: 'Cannot delete event while swap is pending' 
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};

// @desc    Get all SWAPPABLE events from other users
// @route   GET /api/events/swappable/marketplace
// @access  Private
export const getSwappableEvents = async (req, res) => {
  try {
    // Find all SWAPPABLE events excluding current user's events
    const swappableEvents = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: req.user._id }, // Exclude current user
    })
      .populate('userId', 'username email') // Include user info
      .sort({ startTime: 1 });

    res.json({
      success: true,
      count: swappableEvents.length,
      events: swappableEvents,
    });
  } catch (error) {
    console.error('Get swappable events error:', error);
    res.status(500).json({ message: 'Server error fetching swappable events' });
  }
};