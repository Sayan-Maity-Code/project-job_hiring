import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Eye,
  Building2,
  MapPin,
  DollarSign
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'create' | 'applicants'>('jobs');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    skills: [],
    experience: { min: 0, max: 0 },
    salary: { min: 0, max: 0, currency: 'USD' },
    location: '',
    jobType: 'full-time',
    workMode: 'on-site',
    deadline: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [editingJob, setEditingJob] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    }
  }, [user?.id]);

  const fetchJobs = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await api.get(`/hr/jobs/${user.id}`);
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplicants = async (jobId: string) => {
    try {
      const response = await api.get(`/hr/applicants/${jobId}`);
      setApplicants(response.data.applicants);
      setSelectedJob(jobs.find((job: any) => job._id === jobId));
      setActiveTab('applicants');
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobData = {
        ...jobForm,
        hrId: user?.id
      };

      if (editingJob) {
        await api.put(`/hr/jobs/${editingJob._id}`, jobData);
        alert('Job updated successfully!');
      } else {
        await api.post('/hr/jobs', jobData);
        alert('Job posted successfully!');
      }
      
      resetJobForm();
      fetchJobs();
      setActiveTab('jobs');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save job. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    
    try {
      await api.delete(`/hr/jobs/${jobId}`);
      alert('Job deleted successfully!');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills || [],
      experience: job.experience || { min: 0, max: 0 },
      salary: job.salary || { min: 0, max: 0, currency: 'USD' },
      location: job.location,
      jobType: job.jobType,
      workMode: job.workMode,
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : ''
    });
    setActiveTab('create');
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      description: '',
      requirements: '',
      skills: [],
      experience: { min: 0, max: 0 },
      salary: { min: 0, max: 0, currency: 'USD' },
      location: '',
      jobType: 'full-time',
      workMode: 'on-site',
      deadline: ''
    });
    setEditingJob(null);
  };

  const addSkill = () => {
    if (newSkill.trim() && !jobForm.skills.includes(newSkill.trim())) {
      setJobForm({
        ...jobForm,
        skills: [...jobForm.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setJobForm({
      ...jobForm,
      skills: jobForm.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const updateApplicationStatus = async (jobId: string, employeeId: string, status: string) => {
    try {
      await api.put(`/hr/applicants/${jobId}/${employeeId}`, { status });
      fetchApplicants(jobId);
      alert('Application status updated successfully!');
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'text-blue-600 bg-blue-100';
      case 'reviewing': return 'text-yellow-600 bg-yellow-100';
      case 'shortlisted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {user?.fullName}!</h1>
              <p className="text-purple-100">
                {user?.company?.name && `Managing opportunities at ${user.company.name}`}
              </p>
              <p className="text-purple-100">
                You have {jobs.length} active job postings with{' '}
                {jobs.reduce((total: number, job: any) => total + (job.applicants?.length || 0), 0)} total applications.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 rounded-full p-4">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((total: number, job: any) => total + (job.applicants?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Match Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.length > 0 ? Math.round(
                    jobs.reduce((total: number, job: any) => {
                      const avgScore = job.applicants?.length > 0 
                        ? job.applicants.reduce((sum: number, app: any) => sum + (app.matchScore || 0), 0) / job.applicants.length
                        : 0;
                      return total + avgScore;
                    }, 0) / jobs.length
                  ) : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((total: number, job: any) => 
                    total + (job.applicants?.filter((app: any) => app.status === 'shortlisted').length || 0), 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Briefcase className="h-4 w-4 inline mr-2" />
                My Jobs ({jobs.length})
              </button>
              <button
                onClick={() => { setActiveTab('create'); resetJobForm(); }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                {editingJob ? 'Edit Job' : 'Create Job'}
              </button>
              {activeTab === 'applicants' && (
                <button
                  onClick={() => setActiveTab('applicants')}
                  className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Applicants ({applicants.length})
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Jobs List Tab */}
            {activeTab === 'jobs' && (
              <div>
                {jobs.length > 0 ? (
                  <div className="space-y-6">
                    {jobs.map((job: any) => (
                      <div key={job._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                            <div className="flex items-center text-gray-600 mb-2 space-x-4">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="capitalize">{job.jobType}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="capitalize">{job.workMode}</span>
                              </div>
                              {job.salary && (job.salary.min || job.salary.max) && (
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  <span>
                                    {job.salary.min && job.salary.max 
                                      ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                                      : job.salary.min 
                                        ? `${job.salary.currency} ${job.salary.min.toLocaleString()}+`
                                        : `Up to ${job.salary.currency} ${job.salary.max.toLocaleString()}`
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 mb-4">{job.description.substring(0, 200)}...</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills?.slice(0, 5).map((skill: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                  {skill}
                                </span>
                              ))}
                              {job.skills?.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                  +{job.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              job.isActive 
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {job.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>📅 Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                            <span>👥 {job.applicants?.length || 0} applicants</span>
                            {job.deadline && (
                              <span>⏰ Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => fetchApplicants(job._id)}
                              className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              View Applicants
                            </button>
                            <button
                              onClick={() => handleEditJob(job)}
                              className="flex items-center px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job._id)}
                              className="flex items-center px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Postings Yet</h3>
                    <p className="text-gray-600 mb-4">Create your first job posting to start finding great candidates.</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                      Create First Job
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Create/Edit Job Tab */}
            {activeTab === 'create' && (
              <form onSubmit={handleJobSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type
                    </label>
                    <select
                      value={jobForm.jobType}
                      onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Mode
                    </label>
                    <select
                      value={jobForm.workMode}
                      onChange={(e) => setJobForm({ ...jobForm, workMode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="on-site">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience (Years)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={jobForm.experience.min}
                        onChange={(e) => setJobForm({ 
                          ...jobForm, 
                          experience: { ...jobForm.experience, min: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        min="0"
                        value={jobForm.experience.max}
                        onChange={(e) => setJobForm({ 
                          ...jobForm, 
                          experience: { ...jobForm.experience, max: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={jobForm.deadline}
                      onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Range
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={jobForm.salary.currency}
                      onChange={(e) => setJobForm({ 
                        ...jobForm, 
                        salary: { ...jobForm.salary, currency: e.target.value }
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={jobForm.salary.min}
                      onChange={(e) => setJobForm({ 
                        ...jobForm, 
                        salary: { ...jobForm.salary, min: parseInt(e.target.value) || 0 }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Minimum salary"
                    />
                    <input
                      type="number"
                      min="0"
                      value={jobForm.salary.max}
                      onChange={(e) => setJobForm({ 
                        ...jobForm, 
                        salary: { ...jobForm.salary, max: parseInt(e.target.value) || 0 }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Maximum salary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills
                  </label>
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a required skill..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {jobForm.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description *
                  </label>
                  <textarea
                    required
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements *
                  </label>
                  <textarea
                    required
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List the qualifications, experience, and skills required for this position..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('jobs'); resetJobForm(); }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {editingJob ? 'Update Job' : 'Post Job'}
                  </button>
                </div>
              </form>
            )}

            {/* Applicants Tab */}
            {activeTab === 'applicants' && selectedJob && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Applicants for: {selectedJob.title}
                  </h3>
                  <p className="text-gray-600">{applicants.length} total applications</p>
                </div>

                {applicants.length > 0 ? (
                  <div className="space-y-4">
                    {applicants.map((applicant: any) => (
                      <div key={applicant._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {applicant.employeeId?.fullName}
                            </h4>
                            <p className="text-gray-600 mb-2">{applicant.employeeId?.email}</p>
                            {applicant.employeeId?.phone && (
                              <p className="text-gray-600 mb-2">📞 {applicant.employeeId.phone}</p>
                            )}
                            {applicant.employeeId?.location && (
                              <p className="text-gray-600 mb-2">📍 {applicant.employeeId.location}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {applicant.matchScore || 0}%
                              </div>
                              <div className="text-sm text-gray-500">Match</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}>
                              {applicant.status}
                            </div>
                          </div>
                        </div>

                        {applicant.employeeId?.resume && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Skills:</h5>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {applicant.employeeId.resume.skills?.map((skill: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            
                            {applicant.employeeId.resume.summary && (
                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 mb-1">Summary:</h5>
                                <p className="text-gray-600 text-sm">{applicant.employeeId.resume.summary}</p>
                              </div>
                            )}
                            
                            {applicant.employeeId.resume.experience && (
                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 mb-1">Experience:</h5>
                                <p className="text-gray-600 text-sm">{applicant.employeeId.resume.experience}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            Applied on: {new Date(applicant.appliedAt).toLocaleDateString()}
                          </div>
                          
                          <div className="flex space-x-2">
                            <select
                              value={applicant.status}
                              onChange={(e) => updateApplicationStatus(selectedJob._id, applicant.employeeId._id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="applied">Applied</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600">Applications will appear here once candidates start applying.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;