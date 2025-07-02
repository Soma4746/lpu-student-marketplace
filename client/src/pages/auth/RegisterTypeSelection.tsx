import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, Users, BookOpen, Settings, BarChart3 } from 'lucide-react';

const RegisterTypeSelection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Join LPU Marketplace</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your account type to get started with the right features for your needs
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Student Registration */}
          <Link
            to="/register/student"
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-8 border border-gray-200 hover:border-primary-300"
          >
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Student Account</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Perfect for LPU students who want to buy, sell items, and showcase their talents
              </p>

              {/* Features */}
              <div className="space-y-3 text-left">
                <div className="flex items-center text-sm text-gray-700">
                  <BookOpen className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                  <span>Buy and sell academic items</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                  <span>Showcase and sell your talents</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <GraduationCap className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                  <span>Connect with fellow students</span>
                </div>
              </div>

              <div className="mt-8">
                <span className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 group-hover:bg-blue-700 transition-colors duration-300">
                  Register as Student
                </span>
              </div>
            </div>
          </Link>

          {/* Admin Registration */}
          <Link
            to="/register/admin"
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-8 border border-gray-200 hover:border-purple-300"
          >
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Admin Account</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                For LPU staff and administrators who need to manage the marketplace
              </p>

              {/* Features */}
              <div className="space-y-3 text-left">
                <div className="flex items-center text-sm text-gray-700">
                  <Settings className="h-4 w-4 text-purple-500 mr-3 flex-shrink-0" />
                  <span>Manage users and content</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <BarChart3 className="h-4 w-4 text-purple-500 mr-3 flex-shrink-0" />
                  <span>View analytics and reports</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Shield className="h-4 w-4 text-purple-500 mr-3 flex-shrink-0" />
                  <span>Moderate marketplace activity</span>
                </div>
              </div>

              <div className="mt-8">
                <span className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 group-hover:bg-purple-700 transition-colors duration-300">
                  Register as Admin
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterTypeSelection;
