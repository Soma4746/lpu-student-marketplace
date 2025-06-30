import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  DollarSign, 
  Search, 
  Palette, 
  ArrowRight,
  BookOpen,
  Laptop,
  Code,
  Camera,
  Users,
  Shield,
  Star
} from 'lucide-react';

const PurposeSelection: React.FC = () => {
  const purposes = [
    {
      id: 'buy-items',
      title: 'Buy Items',
      subtitle: 'Find what you need',
      description: 'Browse and purchase items from fellow LPU students',
      icon: ShoppingCart,
      color: 'green',
      link: '/marketplace',
      features: [
        'Books & Study Materials',
        'Electronics & Gadgets',
        'Fashion & Clothing',
        'Hostel Supplies',
        'Sports Equipment'
      ]
    },
    {
      id: 'sell-items',
      title: 'Sell Items',
      subtitle: 'Turn unused items into cash',
      description: 'List your items and earn money from things you no longer need',
      icon: DollarSign,
      color: 'blue',
      link: '/create-item',
      features: [
        'Easy listing process',
        'Set your own prices',
        'Secure transactions',
        'Direct student contact',
        'Quick sales'
      ]
    },
    {
      id: 'buy-talent',
      title: 'Hire Talent',
      subtitle: 'Find skilled students',
      description: 'Hire talented LPU students for your projects and assignments',
      icon: Search,
      color: 'purple',
      link: '/talent-store',
      features: [
        'Programming & Development',
        'Graphic Design',
        'Content Writing',
        'Photography',
        'Tutoring & Teaching'
      ]
    },
    {
      id: 'sell-talent',
      title: 'Offer Services',
      subtitle: 'Monetize your skills',
      description: 'Showcase your talents and earn by offering services to fellow students',
      icon: Palette,
      color: 'orange',
      link: '/create-talent',
      features: [
        'Create service packages',
        'Set competitive rates',
        'Build your portfolio',
        'Gain experience',
        'Flexible schedule'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: {
        bg: 'bg-green-500',
        hover: 'hover:bg-green-600',
        border: 'border-green-200',
        text: 'text-green-600'
      },
      blue: {
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        border: 'border-blue-200',
        text: 'text-blue-600'
      },
      purple: {
        bg: 'bg-purple-500',
        hover: 'hover:bg-purple-600',
        border: 'border-purple-200',
        text: 'text-purple-600'
      },
      orange: {
        bg: 'bg-orange-500',
        hover: 'hover:bg-orange-600',
        border: 'border-orange-200',
        text: 'text-orange-600'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What would you like to do?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your purpose to get started with the LPU Student Marketplace
            </p>
          </div>
        </div>
      </div>

      {/* Purpose Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {purposes.map((purpose) => {
            const colorClasses = getColorClasses(purpose.color);
            return (
              <div
                key={purpose.id}
                className={`bg-white rounded-xl shadow-lg border-2 ${colorClasses.border} hover:shadow-xl transition-all duration-300`}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 ${colorClasses.bg} rounded-full flex items-center justify-center mr-4`}>
                      <purpose.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{purpose.title}</h3>
                      <p className={`text-lg ${colorClasses.text} font-medium`}>{purpose.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 text-lg">{purpose.description}</p>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-3">What you can do:</h4>
                    <ul className="space-y-2">
                      {purpose.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <div className={`w-2 h-2 ${colorClasses.bg} rounded-full mr-3`}></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={purpose.link}
                    className={`w-full ${colorClasses.bg} ${colorClasses.hover} text-white py-4 px-6 rounded-lg font-semibold transition-colors inline-flex items-center justify-center group`}
                  >
                    Get Started
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose LPU Marketplace?
            </h2>
            <p className="text-xl text-gray-600">
              Safe, trusted, and designed specifically for LPU students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Students Only</h3>
              <p className="text-gray-600">All users are verified LPU students for your safety and security</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Campus Community</h3>
              <p className="text-gray-600">Connect with students from your own campus and hostels</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted Transactions</h3>
              <p className="text-gray-600">Rating system and secure payment options for peace of mind</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join the Community?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Create your account and start connecting with fellow LPU students today
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center"
          >
            Create Account
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurposeSelection;
