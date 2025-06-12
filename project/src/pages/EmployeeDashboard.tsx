import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  FileText,
  Briefcase,
  TrendingUp,
  Search,
  Filter,
  Settings,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import api from '../utils/api';

const EmployeeDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'applied' | 'profile'>('matches');
  const [matches, setMatches] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState({
    skills: user?.resume?.skills || [],
    experience: user?.resume?.experience || '',
    education: user?.resume?.education || '',
    summary: user?.resume?.summary || '',
    resumeText: user?.resume?.resumeText || ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Fetch job matches
      const matchesResponse = await api.get(`/employees/matches/${user.id}`);
      setMatches(matchesResponse.data.matches);

      // Fetch employee profile with applied jobs
      const profileResponse = await api.get(`/employees/profile/${user.id}`);
      setAppliedJobs(profileResponse.data.employee.appliedJobs);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpdate = async () => {
    if (!user?.id) return;

    try {
      await api.put(`/employees/resume/${user.id}`, resumeData);
      updateUser({ resume: resumeData });

      // Refresh matches after updating resume
      fetchDashboardData();

      alert('Resume updated successfully!');
    } catch (error) {
      console.error('Error updating resume:', error);
      alert('Failed to update resume. Please try again.');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const applyToJob = async (jobId: string) => {
    if (!user?.id) return;

    try {
      await api.post('/jobs/apply', {
        jobId,
        employeeId: user.id
      });

      // Refresh dashboard data
      fetchDashboardData();

      alert('Application submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to apply. Please try again.');
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

  // Handle resume file upload and update resumeText
  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeFile(file || null);
    if (!file) return;

    const isText = file.type === 'text/plain';
    if (isText) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeData((prev) => ({
          ...prev,
          resumeText: text || ''
        }));
        console.log('Extracted text from TXT:', text);
      };
      reader.readAsText(file);
    } else {
      setIsExtracting(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isOverlayRequired', 'false');
        formData.append('apikey', import.meta.env.VITE_OCR_API || '');
        formData.append('language', 'eng');

        const response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        const parsedText = data?.ParsedResults?.[0]?.ParsedText || '';
        setResumeData((prev) => ({
          ...prev,
          resumeText: parsedText || '[No text extracted. Please try another file or paste manually.]'
        }));
        console.log('Extracted text from OCR:', parsedText);
      } catch (err) {
        alert('Failed to extract text from resume. Please try a different file or paste the text manually.');
        setResumeData((prev) => ({
          ...prev,
          resumeText: '[Extraction failed. Please try again or paste manually.]'
        }));
      } finally {
        setIsExtracting(false);
      }
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName}!</h1>
              <p className="text-blue-100">
                {matches.length > 0
                  ? `We found ${matches.length} job matches for you based on your profile.`
                  : 'Complete your profile to get personalized job matches.'
                }
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 rounded-full p-4">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Job Matches</p>
                <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{appliedJobs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appliedJobs.filter((job: any) => job.status === 'applied').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Profile Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resumeData.skills.length > 0 ? Math.min(100, resumeData.skills.length * 10 + 20) : 20}%
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
                onClick={() => setActiveTab('matches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'matches'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Job Matches ({matches.length})
              </button>
              <button
                onClick={() => setActiveTab('applied')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'applied'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Briefcase className="h-4 w-4 inline mr-2" />
                Applied Jobs ({appliedJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Profile & Resume
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Job Matches Tab */}
            {activeTab === 'matches' && (
              <div>
                {matches.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {matches.map((match: any) => (
                      <JobCard
                        key={match.job._id}
                        job={match.job}
                        matchScore={match.matchScore}
                        showMatchScore={true}
                        isApplied={match.isApplied}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Matches Yet</h3>
                    <p className="text-gray-600 mb-4">Complete your profile to get personalized job recommendations.</p>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                      Complete Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Applied Jobs Tab */}
            {activeTab === 'applied' && (
              <div>
                {appliedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {appliedJobs.map((application: any) => (
                      <div key={application._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.jobId?.title || 'Job Title Not Available'}
                            </h3>
                            <p className="text-gray-600">
                              {application.jobId?.hrId?.company?.name || application.jobId?.hrId?.fullName}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>Applied on: {new Date(application.appliedAt).toLocaleDateString()}</span>
                          {application.jobId?.location && (
                            <span>📍 {application.jobId.location}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-4">Start applying to jobs that match your profile.</p>
                    <button
                      onClick={() => setActiveTab('matches')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                      Browse Job Matches
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Skills Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button
                        onClick={addSkill}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                  <textarea
                    value={resumeData.experience}
                    onChange={(e) => setResumeData({ ...resumeData, experience: e.target.value })}
                    placeholder="Describe your work experience..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Education Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                  <textarea
                    value={resumeData.education}
                    onChange={(e) => setResumeData({ ...resumeData, education: e.target.value })}
                    placeholder="Describe your educational background..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Summary Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    placeholder="Write a brief professional summary..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Resume Text Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Resume Text</h3>
                  <textarea
                    value={resumeData.resumeText}
                    onChange={(e) => setResumeData({ ...resumeData, resumeText: e.target.value })}
                    placeholder="Paste your complete resume text here for better job matching..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-4 flex items-center gap-4">
                    <label className="block">
                      <span className="text-gray-700 font-medium">Upload Resume File (PDF, DOC, DOCX, TXT):</span>
                      <input
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleResumeFileChange}
                        className="block mt-2"
                        disabled={isExtracting}
                      />
                    </label>
                    {resumeFile && (
                      <span className="text-sm text-gray-600">{resumeFile.name}</span>
                    )}
                    {isExtracting && (
                      <span className="text-blue-600 text-sm ml-2">Extracting text from file...</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Uploading a file will extract and replace the resume text above. For best results, use PDF, DOC, DOCX, or TXT files.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleResumeUpdate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Update Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;