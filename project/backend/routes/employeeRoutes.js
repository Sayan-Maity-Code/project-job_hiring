import express from 'express';
import Employee from '../models/Employee.js';
import { calculateJobMatches } from '../utils/mlMatcher.js';

const router = express.Router();

// Employee Signup
router.post('/signup', async (req, res) => {
  try {
    console.log('Employee signup request:', req.body);
    
    const { username, email, password, fullName, phone, location } = req.body;
    
    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingEmployee) {
      return res.status(400).json({
        message: 'Employee with this email or username already exists'
      });
    }
    
    // Create new employee
    const employee = new Employee({
      username,
      email,
      password,
      fullName,
      phone: phone || '',
      location: location || '',
      resume: {
        skills: [],
        experience: '',
        education: '',
        summary: '',
        resumeText: ''
      }
    });
    
    await employee.save();
    console.log('Employee created successfully:', employee._id);
    
    res.status(201).json({
      message: 'Employee registered successfully',
      employee: {
        id: employee._id,
        username: employee.username,
        email: employee.email,
        fullName: employee.fullName,
        phone: employee.phone,
        location: employee.location,
        resume: employee.resume
      }
    });
  } catch (error) {
    console.error('Employee signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Employee Login
router.post('/login', async (req, res) => {
  try {
    console.log('Employee login request:', req.body);
    
    const { email, password } = req.body;
    
    const employee = await Employee.findOne({ email });
    
    if (!employee || employee.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      message: 'Login successful',
      employee: {
        id: employee._id,
        username: employee.username,
        email: employee.email,
        fullName: employee.fullName,
        phone: employee.phone,
        location: employee.location,
        resume: employee.resume,
        appliedJobs: employee.appliedJobs
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Resume
router.put('/resume/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { skills, experience, education, summary, resumeText } = req.body;
    
    const employee = await Employee.findByIdAndUpdate(
      id,
      {
        resume: {
          skills: skills || [],
          experience: experience || '',
          education: education || '',
          summary: summary || '',
          resumeText: resumeText || ''
        }
      },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({
      message: 'Resume updated successfully',
      resume: employee.resume
    });
  } catch (error) {
    console.error('Resume update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Employee Profile
router.get('/profile/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('appliedJobs.jobId');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ employee });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Job Matches for Employee
router.get('/matches/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const matches = await calculateJobMatches(employee);
    
    res.json({ matches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;