import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';
import Event from './models/Event.js';
import SwapRequest from './models/SwapRequest.js';

dotenv.config();

const testModels = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await SwapRequest.deleteMany({});

    // Create test user
    const user1 = await User.create({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    const user2 = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password456',
    });

    console.log('✓ Users created:', user1.username, user2.username);

    // Create test events
    const event1 = await Event.create({
      title: 'Team Meeting',
      startTime: new Date('2025-11-05T10:00:00'),
      endTime: new Date('2025-11-05T11:00:00'),
      status: 'SWAPPABLE',
      userId: user1._id,
    });

    const event2 = await Event.create({
      title: 'Focus Block',
      startTime: new Date('2025-11-05T14:00:00'),
      endTime: new Date('2025-11-05T15:00:00'),
      status: 'SWAPPABLE',
      userId: user2._id,
    });

    console.log('✓ Events created:', event1.title, event2.title);

    // Create test swap request
    const swapRequest = await SwapRequest.create({
      requesterId: user1._id,
      requesterSlotId: event1._id,
      receiverId: user2._id,
      receiverSlotId: event2._id,
      status: 'PENDING',
    });

    console.log('✓ Swap request created with status:', swapRequest.status);

    // Query tests
    const userWithEvents = await User.findById(user1._id);
    console.log('✓ User query successful:', userWithEvents.username);

    const userEvents = await Event.find({ userId: user1._id });
    console.log('✓ User events query:', userEvents.length, 'event(s)');

    const incomingRequests = await SwapRequest.find({ receiverId: user2._id });
    console.log('✓ Incoming requests for Bob:', incomingRequests.length);

    // Cleanup
    await User.deleteMany({});
    await Event.deleteMany({});
    await SwapRequest.deleteMany({});

    console.log('\n✓ All tests passed! Models are working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

testModels();
