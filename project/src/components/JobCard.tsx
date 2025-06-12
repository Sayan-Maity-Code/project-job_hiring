import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Building2, Calendar, TrendingUp } from 'lucide-react';

interface JobCardProps {
  job: any;
  matchScore?: number;
  showMatchScore?: boolean;
  isApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, matchScore, showMatchScore, isApplied }) => {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `Up to ${currency} ${max.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
              <Link to={`/job/${job._id}`}>{job.title}</Link>
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building2 className="h-4 w-4 mr-2" />
              <span className="font-medium">{job.hrId?.company?.name || job.hrId?.fullName}</span>
            </div>
          </div>
          
          {showMatchScore && matchScore !== undefined && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getMatchScoreColor(matchScore)}`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {matchScore}% Match
            </div>
          )}
          
          {isApplied && (
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
              Applied
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills?.slice(0, 3).map((skill: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.skills?.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {job.description.substring(0, 150)}...
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="capitalize">{job.jobType}</span>
          </div>
          {job.salary && (job.salary.min || job.salary.max) && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              job.workMode === 'remote' ? 'bg-green-100 text-green-600' :
              job.workMode === 'hybrid' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {job.workMode}
            </span>
            {job.experience && (
              <span className="text-xs text-gray-500">
                {job.experience.min}-{job.experience.max} years exp.
              </span>
            )}
          </div>
          
          <Link
            to={`/job/${job._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;