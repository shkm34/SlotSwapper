import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';

// @desc    Get all SWAPPABLE events from other users (Marketplace)
// @route   GET /api/swap-request/swappable-slots
// @access  Private
export const getSwappableSlots = async (req, res) => {
  try {
    // Find all SWAPPABLE events from other users
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: req.user._id }, // Exclude current user's events
    })
      .populate('userId', 'username email _id') // Include user details
      .sort({ startTime: 1 });

    res.json({
      success: true,
      count: swappableSlots.length,
      slots: swappableSlots,
    });
  } catch (error) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({ message: 'Server error fetching swappable slots' });
  }
};

// @desc    Create a swap request
// @route   POST /api/swap-request/create
// @access  Private
export const createSwapRequest = async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;

  try {
    // Validate required fields
    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({
        message: 'Please provide mySlotId and theirSlotId',
      });
    }

    // Fetch both slots
    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    // Validate slots exist
    if (!mySlot || !theirSlot) {
      return res.status(404).json({ message: 'One or both slots not found' });
    }

    // Verify mySlot belongs to current user
    if (mySlot.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only swap your own events',
      });
    }

    // Verify theirSlot does NOT belong to current user
    if (theirSlot.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'Cannot request swap with your own event',
      });
    }

    // Verify both slots are SWAPPABLE
    if (mySlot.status !== 'SWAPPABLE') {
      return res.status(400).json({
        message: `Your slot status is ${mySlot.status}, must be SWAPPABLE`,
      });
    }

    if (theirSlot.status !== 'SWAPPABLE') {
      return res.status(400).json({
        message: `Their slot status is ${theirSlot.status}, must be SWAPPABLE`,
      });
    }

    // Check if swap request already exists- prevent duplicates
    const existingRequest = await SwapRequest.findOne({
      $or: [
        {
          requesterId: req.user._id,
          requesterSlotId: mySlotId,
          receiverId: theirSlot.userId,
          receiverSlotId: theirSlotId,
          status: 'PENDING',
        },
        {
          requesterId: theirSlot.userId,
          requesterSlotId: theirSlotId,
          receiverId: req.user._id,
          receiverSlotId: mySlotId,
          status: 'PENDING',
        },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'A swap request already exists for these slots',
      });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      requesterId: req.user._id,
      requesterSlotId: mySlotId,
      receiverId: theirSlot.userId,
      receiverSlotId: theirSlotId,
      status: 'PENDING',
    });

    // Update both slots to SWAP_PENDING
    await Event.findByIdAndUpdate(mySlotId, { status: 'SWAP_PENDING' });
    await Event.findByIdAndUpdate(theirSlotId, { status: 'SWAP_PENDING' });

    // Populate swap request with slot and user details
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate({
        path: 'requesterId',
        select: 'username email',
      })
      .populate({
        path: 'receiverId',
        select: 'username email',
      })
      .populate({
        path: 'requesterSlotId',
        select: 'title startTime endTime',
      })
      .populate({
        path: 'receiverSlotId',
        select: 'title startTime endTime',
      });

    res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      swapRequest: populatedRequest,
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ message: 'Server error creating swap request' });
  }
};

// @desc    Handle swap response (accept or reject)
// @route   POST /api/swap-request/respond/:swapRequestId
// @access  Private
export const respondToSwapRequest = async (req, res) => {
  const { swapRequestId } = req.params;
  const { action } = req.body;

  try {
    // Validate action
    if (!action || !['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({
        message: 'Action must be ACCEPT or REJECT',
      });
    }

    // Find swap request
    const swapRequest = await SwapRequest.findById(swapRequestId);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Verify current user is the receiver
    if (swapRequest.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the receiver can respond to this swap request',
      });
    }

    // Verify swap request is still PENDING
    if (swapRequest.status !== 'PENDING') {
      return res.status(400).json({
        message: `Swap request is already ${swapRequest.status}`,
      });
    }

    if (action === 'ACCEPT') {
      // ACCEPT: Swap ownership and set both to BUSY
      const requesterSlot = await Event.findById(
        swapRequest.requesterSlotId
      );
      const receiverSlot = await Event.findById(
        swapRequest.receiverSlotId
    );

      if (!requesterSlot || !receiverSlot) {
        return res.status(404).json({ message: 'Slot not found' });
      }

      // Swap ownership: change userId of both slots
      await Event.findByIdAndUpdate(swapRequest.requesterSlotId, {
        userId: swapRequest.receiverId, // Now owned by receiver
        status: 'BUSY',
      });

      await Event.findByIdAndUpdate(swapRequest.receiverSlotId, {
        userId: swapRequest.requesterId, // Now owned by requester
        status: 'BUSY',
      });

      // Update swap request status
      swapRequest.status = 'ACCEPTED';
      await swapRequest.save();

      // Populate response with details
      const populatedRequest = await SwapRequest.findById(swapRequest._id)
        .populate({
          path: 'requesterId',
          select: 'username email',
        })
        .populate({
          path: 'receiverId',
          select: 'username email',
        })
        .populate({
          path: 'requesterSlotId',
          select: 'title startTime endTime userId',
        })
        .populate({
          path: 'receiverSlotId',
          select: 'title startTime endTime userId',
        });

      res.json({
        success: true,
        message: 'Swap request accepted successfully',
        swapRequest: populatedRequest,
      });
    } else if (action === 'REJECT') {
      // REJECT: Revert both slots to SWAPPABLE
      await Event.findByIdAndUpdate(swapRequest.requesterSlotId, {
        status: 'SWAPPABLE',
      });

      await Event.findByIdAndUpdate(swapRequest.receiverSlotId, {
        status: 'SWAPPABLE',
      });

      // Update swap request status
      swapRequest.status = 'REJECTED';
      await swapRequest.save();

      res.json({
        success: true,
        message: 'Swap request rejected successfully',
        swapRequest,
      });
    }
  } catch (error) {
    console.error('Respond to swap request error:', error);
    res.status(500).json({ message: 'Server error responding to swap request' });
  }
};

// @desc    Get all swap requests (incoming and outgoing)
// @route   GET /api/swap-request/my-requests
// @access  Private
export const getMySwapRequests = async (req, res) => {
  try {
    // Get incoming requests (where user is receiver)
    const incomingRequests = await SwapRequest.find({
      receiverId: req.user._id,
    })
      .populate({
        path: 'requesterId',
        select: 'username email',
      })
      .populate({
        path: 'requesterSlotId',
        select: 'title startTime endTime',
      })
      .populate({
        path: 'receiverSlotId',
        select: 'title startTime endTime',
      })
      .sort({ createdAt: -1 });

    // Get outgoing requests (where user is requester)
    const outgoingRequests = await SwapRequest.find({
      requesterId: req.user._id,
    })
      .populate({
        path: 'receiverId',
        select: 'username email',
      })
      .populate({
        path: 'requesterSlotId',
        select: 'title startTime endTime',
      })
      .populate({
        path: 'receiverSlotId',
        select: 'title startTime endTime',
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      incoming: incomingRequests,
      outgoing: outgoingRequests,
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ message: 'Server error fetching swap requests' });
  }
};
