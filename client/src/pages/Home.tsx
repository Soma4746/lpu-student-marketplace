import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Palette,
  Users,
  Star,
  ArrowRight,
  BookOpen,
  Laptop,
  Shirt,
  Coffee,
  Camera,
  Code,
  Brush,
  Music,
  ShoppingCart,
  DollarSign,
  UserPlus,
  Eye,
  Plus,
  Search
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: ShoppingBag,
      title: 'Student-to-Student Marketplace',
      description: 'Buy and sell items directly with fellow LPU students. From textbooks to electronics, find everything you need at student-friendly prices.',
      link: '/marketplace'
    },
    {
      icon: Palette,
      title: 'Talent Exchange Platform',
      description: 'Hire talented students for projects or showcase your own skills. From coding to design, connect with the right talent.',
      link: '/talent-store'
    },
    {
      icon: Users,
      title: 'Trusted LPU Community',
      description: 'Safe, verified transactions within the LPU community. All users are verified LPU students for your security.',
      link: '/register'
    }
  ];

  const categories = [
    { icon: BookOpen, name: 'Books & Study Material', count: '500+' },
    { icon: Laptop, name: 'Electronics', count: '200+' },
    { icon: Shirt, name: 'Fashion & Clothing', count: '150+' },
    { icon: Coffee, name: 'Hostel Supplies', count: '300+' },
  ];

  const talentCategories = [
    { icon: Code, name: 'Programming', count: '80+' },
    { icon: Brush, name: 'Art & Design', count: '120+' },
    { icon: Camera, name: 'Photography', count: '60+' },
    { icon: Music, name: 'Music & Audio', count: '40+' },
  ];

  const stats = [
    { number: '5000+', label: 'Active Students' },
    { number: '2000+', label: 'Items Listed' },
    { number: '500+', label: 'Talent Products' },
    { number: '4.8', label: 'Average Rating' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              LPU Student
              <span className="block text-primary-200">Marketplace</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-primary-100 max-w-3xl mx-auto">
              Buy, sell, and showcase your talents in the ultimate marketplace designed exclusively for LPU students
            </p>

            {/* Purpose Selection Cards */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-8 text-primary-100">What would you like to do today?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

                {/* Buy Items */}
                <Link
                  to="/marketplace"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Buy Items</h3>
                  <p className="text-primary-100 text-sm">Find books, electronics, and more from fellow students</p>
                </Link>

                {/* Sell Items */}
                <Link
                  to="/create-item"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sell Items</h3>
                  <p className="text-primary-100 text-sm">List your items and earn money from things you no longer need</p>
                </Link>

                {/* Buy Talent/Services */}
                <Link
                  to="/talent-store"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Buy Talent</h3>
                  <p className="text-primary-100 text-sm">Hire talented students for projects, designs, coding, and more</p>
                </Link>

                {/* Sell Talent/Services */}
                <Link
                  to="/create-talent"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Palette className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sell Talent</h3>
                  <p className="text-primary-100 text-sm">Showcase your skills and earn by offering services</p>
                </Link>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/purpose"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Choose Your Purpose
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Join LPU Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From buying textbooks to selling your creative work, our platform connects the entire LPU community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <Link
                  to={feature.link}
                  className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center"
                >
                  Learn More <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600">
              Discover what's trending in our marketplace
            </p>
          </div>

          {/* Marketplace Categories */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Marketplace</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  to={`/marketplace?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <category.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{category.name}</h4>
                  <p className="text-sm text-gray-500">{category.count} items</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Talent Categories */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Talent Store</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {talentCategories.map((category, index) => (
                <Link
                  key={index}
                  to={`/talent-store?category=${category.name.split(' ')[0]}`}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <category.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{category.name}</h4>
                  <p className="text-sm text-gray-500">{category.count} products</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by LPU Students
            </h2>
            <p className="text-xl text-primary-100">
              Join thousands of students who are already part of our community
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the LPU Marketplace today and connect with your fellow students
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              to="/marketplace"
              className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
