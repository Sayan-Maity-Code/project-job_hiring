import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Calendar, 
  Users,
  ArrowLeft,
  CheckCircle,
  Star
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const JobDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job);
      
      // Check if user has already applied
      if (user && user.type === 'employee') {
        const hasUserApplied = response.data.job.applicants?.some(
          (applicant: any) => applicant.employeeId === user.id
        );
        setHasApplied(hasUserApplied);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.type !== 'employee') {
      alert('Only employees can apply for jobs.');
      return;
    }

    try {
      setIsApplying(true);
      await api.post('/jobs/apply', {
        jobId: id,
        employeeId: user.id
      });
      
      setHasApplied(true);
      alert('Application submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `Up to ${currency} ${max.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <Building2 className="h-5 w-5 mr-2" />
                <span className="text-lg font-medium">
                  {job.hrId?.company?.name || job.hrId?.fullName}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="capitalize">{job.jobType}</span>
                </div>
                {job.salary && (job.salary.min || job.salary.max) && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.workMode === 'remote' ? 'bg-green-100 text-green-600' :
                  job.workMode === 'hybrid' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {job.workMode}
                </span>
                {job.experience && (
                  <span className="text-sm text-gray-500">
                    {job.experience.min}-{job.experience.max} years experience
                  </span>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{job.applicants?.length || 0} applicants</span>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="ml-8">
              {user && user.type === 'employee' ? (
                hasApplied ? (
                  <div className="flex items-center bg-green-100 text-green-600 px-6 py-3 rounded-lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Applied
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {isApplying ? 'Applying...' : 'Apply Now'}
                  </button>
                )
              ) : user && user.type === 'hr' ? (
                <div className="text-gray-500 text-sm">
                  HR accounts cannot apply to jobs
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
                >
                  Login to Apply
                </button>
              )}
            </div>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deadline */}
          {job.deadline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">
                  Application Deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </p>
          </div>
        </div>

        {/* Company Information */}
        {job.hrId?.company && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Company</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{job.hrId.company.name}</h3>
                {job.hrId.company.industry && (
                  <p className="text-gray-600">Industry: {job.hrId.company.industry}</p>
                )}
                {job.hrId.company.size && (
                  <p className="text-gray-600">Company Size: {job.hrId.company.size}</p>
                )}
                {job.hrId.company.location && (
                  <p className="text-gray-600">Location: {job.hrId.company.location}</p>
                )}
                {job.hrId.company.website && (
                  <p className="text-gray-600">
                    Website: <a href={job.hrId.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      {job.hrId.company.website}
                    </a>
                  </p>
                )}
              </div>
              {job.hrId.company.description && (
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    {job.hrId.company.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsPage;