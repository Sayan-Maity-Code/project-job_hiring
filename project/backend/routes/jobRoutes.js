import express from 'express';
import Job from '../models/Job.js';
import Employee from '../models/Employee.js';
import { calculateMatchScore } from '../utils/mlMatcher.js';

const router = express.Router();

// Get All Active Jobs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, location, jobType, workMode } = req.query;
    
    const filter = { isActive: true };
    
    if (location) filter.location = new RegExp(location, 'i');
    if (jobType) filter.jobType = jobType;
    if (workMode) filter.workMode = workMode;
    
    const jobs = await Job.find(filter)
      .populate('hrId', 'fullName company')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Job.countDocuments(filter);
    
    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalJobs: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('hrId', 'fullName company');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for Job
router.post('/apply', async (req, res) => {
  try {
    const { jobId, employeeId } = req.body;
    
    const job = await Job.findById(jobId);
    const employee = await Employee.findById(employeeId);
    
    if (!job || !employee) {
      return res.status(404).json({ message: 'Job or Employee not found' });
    }
    
    // Check if already applied
    const existingApplication = job.applicants.find(
      app => app.employeeId.toString() === employeeId
    );
    
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    
    // Calculate match score
    const matchScore = calculateMatchScore(employee.resume, {
      description: job.description,
      requirements: job.requirements,
      skills: job.skills
    });
    
    // Add to job applicants
    job.applicants.push({
      employeeId,
      matchScore,
      appliedAt: new Date()
    });
    
    // Add to employee applied jobs
    employee.appliedJobs.push({
      jobId,
      appliedAt: new Date()
    });
    
    await job.save();
    await employee.save();
    
    res.json({
      message: 'Application submitted successfully',
      matchScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search Jobs
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchRegex = new RegExp(query, 'i');
    
    const jobs = await Job.find({
      isActive: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { skills: { $in: [searchRegex] } },
        { location: searchRegex }
      ]
    })
    .populate('hrId', 'fullName company')
    .sort({ createdAt: -1 });
    
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;