import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Popular Pages
          </h3>
          <div className="space-y-2">
            <Link
              to="/marketplace"
              className="block text-primary-600 hover:text-primary-700 text-sm"
            >
              Marketplace
            </Link>
            <Link
              to="/talent-store"
              className="block text-primary-600 hover:text-primary-700 text-sm"
            >
              Talent Store
            </Link>
            <Link
              to="/dashboard"
              className="block text-primary-600 hover:text-primary-700 text-sm"
            >
              Dashboard
            </Link>
            <Link
              to="/help"
              className="block text-primary-600 hover:text-primary-700 text-sm"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
