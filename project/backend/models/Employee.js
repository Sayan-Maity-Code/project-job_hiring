import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  resume: {
    skills: {
      type: [String],
      default: []
    },
    experience: {
      type: String,
      default: ''
    },
    education: {
      type: String,
      default: ''
    },
    summary: {
      type: String,
      default: ''
    },
    resumeText: {
      type: String,
      default: ''
    }
  },
  appliedJobs: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'rejected'],
      default: 'applied'
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Employee', employeeSchema);