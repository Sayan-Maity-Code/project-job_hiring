import mongoose from 'mongoose';

const hrSchema = new mongoose.Schema({
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
  company: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    industry: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('HR', hrSchema);