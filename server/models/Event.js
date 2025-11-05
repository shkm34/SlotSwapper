import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
      maxlength: 100,
    },
    startTime: {
      type: Date,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please provide end time'],
    },
    status: {
      type: String,
      enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
      default: 'BUSY',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Validate that endTime is after startTime
eventSchema.pre('save', function (next) {
  if (this.endTime <= this.startTime) {
    throw new Error('End time must be after start time');
  }
  next();
});

// Index for faster queries on userId and status
eventSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Event', eventSchema);
