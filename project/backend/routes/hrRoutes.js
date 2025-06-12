import express from 'express';
import HR from '../models/HR.js';
import Job from '../models/Job.js';

const router = express.Router();

// HR Signup
router.post('/signup', async (req, res) => {
  try {
    console.log('HR signup request:', req.body);
    
    const { username, email, password, fullName, phone, company } = req.body;
    
    // Check if HR already exists
    const existingHR = await HR.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingHR) {
      return res.status(400).json({
        message: 'HR with this email or username already exists'
      });
    }
    
    // Create new HR
    const hr = new HR({
      username,
      email,
      password,
      fullName,
      phone: phone || '',
      company: {
        name: company.name,
        industry: company.industry || '',
        size: company.size || '',
        location: company.location || '',
        website: company.website || '',
        description: company.description || ''
      }
    });
    
    await hr.save();
    console.log('HR created successfully:', hr._id);
    
    res.status(201).json({
      message: 'HR registered successfully',
      hr: {
        id: hr._id,
        username: hr.username,
        email: hr.email,
        fullName: hr.fullName,
        phone: hr.phone,
        company: hr.company
      }
    });
  } catch (error) {
    console.error('HR signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// HR Login
router.post('/login', async (req, res) => {
  try {
    console.log('HR login request:', req.body);
    
    const { email, password } = req.body;
    
    const hr = await HR.findOne({ email });
    
    if (!hr || hr.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      message: 'Login successful',
      hr: {
        id: hr._id,
        username: hr.username,
        email: hr.email,
        fullName: hr.fullName,
        phone: hr.phone,
        company: hr.company
      }
    });
  } catch (error) {
    console.error('HR login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Job Posting
router.post('/jobs', async (req, res) => {
  try {
    console.log('Create job request:', req.body);
    
    const jobData = req.body;
    
    const job = new Job(jobData);
    await job.save();
    
    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get HR's Job Postings
router.get('/jobs/:hrId', async (req, res) => {
  try {
    const jobs = await Job.find({ hrId: req.params.hrId })
      .populate('applicants.employeeId', 'fullName email phone location resume')
      .sort({ createdAt: -1 });
    
    res.json({ jobs });
  } catch (error) {
    console.error('Get HR jobs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Job Posting
router.put('/jobs/:jobId', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.jobId,
      req.body,
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Job Posting
router.delete('/jobs/:jobId', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Applicants for a Job
router.get('/applicants/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('applicants.employeeId', 'fullName email phone location resume');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({ applicants: job.applicants });
  } catch (error) {
    console.error('Get applicants error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Application Status
router.put('/applicants/:jobId/:employeeId', async (req, res) => {
  try {
    const { jobId, employeeId } = req.params;
    const { status } = req.body;
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const applicant = job.applicants.find(
      app => app.employeeId.toString() === employeeId
    );
    
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    
    applicant.status = status;
    await job.save();
    
    res.json({
      message: 'Application status updated successfully',
      applicant
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;