import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  skills: [String],
  experience: {
    min: Number,
    max: Number
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  workMode: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
    default: 'on-site'
  },
  hrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HR',
    required: true
  },
  applicants: [{
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'rejected'],
      default: 'applied'
    },
    matchScore: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  deadline: Date
}, {
  timestamps: true
});

export default mongoose.model('Job', jobSchema);