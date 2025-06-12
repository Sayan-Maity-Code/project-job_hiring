import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Users, TrendingUp, ArrowRight, MapPin, Building2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import api from '../utils/api';

const HomePage: React.FC = () => {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats] = useState({
    totalJobs: 1250,
    totalEmployees: 3400,
    successfulMatches: 890
  });

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const response = await api.get('/jobs?limit=6');
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setIsLoading(true);
        const response = await api.get(`/jobs/search/${searchQuery}`);
        setJobs(response.data.jobs);
      } catch (error) {
        console.error('Error searching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchRecentJobs();
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Find Your Perfect Job with
            <span className="text-yellow-300"> AI-Powered </span>
            Matching
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Connect talented professionals with dream opportunities using advanced machine learning 
            to match skills, experience, and preferences.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex bg-white rounded-full shadow-lg overflow-hidden">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search jobs, skills, or companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-gray-700 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup?type=employee"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Users className="h-5 w-5 mr-2" />
              Find Jobs
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <Link
              to="/signup?type=hr"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Post Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalJobs.toLocaleString()}</h3>
              <p className="text-gray-600">Active Job Postings</p>
            </div>
            
            <div className="p-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalEmployees.toLocaleString()}</h3>
              <p className="text-gray-600">Registered Professionals</p>
            </div>
            
            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.successfulMatches.toLocaleString()}</h3>
              <p className="text-gray-600">Successful Matches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Job Opportunities</h2>
            <p className="text-xl text-gray-600">Discover the latest openings from top companies</p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-colors inline-flex items-center"
            >
              View All Jobs
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose JobMatch AI?</h2>
            <p className="text-xl text-gray-600">Advanced technology meets human expertise</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
              <p className="text-gray-600">Our machine learning algorithms analyze your skills and match you with the most relevant opportunities.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-gray-600">Find jobs faster with intelligent search that understands context and preferences.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Network</h3>
              <p className="text-gray-600">Connect with verified employers and top-tier professionals in your industry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">JobMatch AI</span>
              </div>
              <p className="text-gray-400">
                Connecting talent with opportunity through intelligent matching.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Create Profile</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Resume Builder</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/signup?type=hr" className="hover:text-white transition-colors">Post Jobs</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Find Candidates</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Manage Applications</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JobMatch AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;